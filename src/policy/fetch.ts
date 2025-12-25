/**
 * Policy pack fetching from git repositories
 */
import * as https from 'https';
import * as http from 'http';
import { PolicyPackSource } from '../types';

export interface FetchedFiles {
  [path: string]: string;
}

/**
 * Fetch policy pack files from a git repository via HTTPS
 * MVP: Fetches raw files from GitHub/GitLab URLs
 * Future: Add authentication support
 */
export async function fetchPolicyPack(source: PolicyPackSource): Promise<FetchedFiles> {
  const { url, ref } = source;
  
  // Determine the provider and construct raw file URLs
  const baseUrl = convertToRawUrl(url, ref);
  
  // Expected files to fetch
  const filesToFetch = [
    'aegis.yaml',
    'components/inventory.json',
    'tokens/tokens.json',
    'rules/governance.md',
  ];
  
  const files: FetchedFiles = {};
  
  // Fetch each file
  for (const filePath of filesToFetch) {
    try {
      const fileUrl = `${baseUrl}/${filePath}`;
      const content = await fetchFile(fileUrl);
      files[filePath] = content;
    } catch (error) {
      // Log but don't fail - some files may be optional
      console.warn(`Warning: Could not fetch ${filePath}:`, (error as Error).message);
    }
  }
  
  // Ensure aegis.yaml is present (required)
  if (!files['aegis.yaml']) {
    throw new Error('Required file aegis.yaml not found in policy pack');
  }
  
  return files;
}

/**
 * Convert a git repository URL to a raw content URL
 * Supports GitHub and GitLab
 */
function convertToRawUrl(repoUrl: string, ref: string): string {
  // Remove trailing .git
  let url = repoUrl.replace(/\.git$/, '');
  
  // GitHub: https://github.com/owner/repo -> https://raw.githubusercontent.com/owner/repo/ref
  if (url.includes('github.com')) {
    const match = url.match(/github\.com[\/:](.+)/);
    if (match) {
      const repoPath = match[1];
      return `https://raw.githubusercontent.com/${repoPath}/${ref}`;
    }
  }
  
  // GitLab: https://gitlab.com/owner/repo -> https://gitlab.com/owner/repo/-/raw/ref
  if (url.includes('gitlab.com')) {
    return `${url}/-/raw/${ref}`;
  }
  
  // Default fallback (may not work for all providers)
  return `${url}/raw/${ref}`;
}

/**
 * Fetch a single file via HTTPS
 */
function fetchFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirects
        if (res.headers.location) {
          fetchFile(res.headers.location).then(resolve).catch(reject);
          return;
        }
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: HTTP ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

