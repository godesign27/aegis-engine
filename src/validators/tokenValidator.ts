/**
 * Token validator - checks for hardcoded hex colors
 */
import { Violation, TokensConfig } from '../types';

/**
 * Validate that code doesn't contain hardcoded hex colors
 * Recommends using CSS variables with allowed prefixes
 */
export function validateTokens(
  content: string,
  tokensConfig: TokensConfig | undefined,
  enforce: boolean
): Violation[] {
  const violations: Violation[] = [];
  
  // If not enforcing, skip
  if (!enforce) {
    return violations;
  }
  
  // Find hardcoded hex colors
  const hexColors = findHexColors(content);
  
  for (const hexColor of hexColors) {
    const allowedPrefixes = tokensConfig?.allowed_prefixes || ['--color-', '--theme-'];
    const prefixList = allowedPrefixes.join(', ');
    
    violations.push({
      rule_id: 'tokens.enforcement',
      severity: 'ERROR',
      message: `Hardcoded hex color "${hexColor.value}" found. Use CSS variables with allowed prefixes: ${prefixList}`,
      line: hexColor.line,
      context: hexColor.context,
    });
  }
  
  return violations;
}

interface HexColor {
  value: string;
  line?: number;
  context?: string;
}

/**
 * Find hardcoded hex colors in code
 * Matches #RRGGBB and #RGB patterns
 */
function findHexColors(content: string): HexColor[] {
  const hexColors: HexColor[] = [];
  const lines = content.split('\n');
  
  // Regex to match hex colors: #RGB or #RRGGBB
  const hexColorRegex = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = hexColorRegex.exec(line)) !== null) {
      hexColors.push({
        value: match[0],
        line: index + 1,
        context: line.trim(),
      });
    }
  });
  
  return hexColors;
}

