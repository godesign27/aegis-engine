/**
 * Component validator - checks if JSX/TSX components are in the allowlist
 */
import { Violation, ComponentInventory } from '../types';

/**
 * Validate that all JSX components used are in the allowed components list
 */
export function validateComponents(
  content: string,
  allowedComponents: ComponentInventory | undefined,
  enforce: boolean
): Violation[] {
  const violations: Violation[] = [];
  
  // If not enforcing or no allowlist provided, skip
  if (!enforce || !allowedComponents) {
    return violations;
  }
  
  // Extract JSX tag names from content
  const usedComponents = extractJSXComponents(content);
  
  // Check each component against allowlist
  const allowedSet = new Set(allowedComponents.allowed_components || []);
  
  for (const component of usedComponents) {
    if (!allowedSet.has(component.name)) {
      violations.push({
        rule_id: 'components.allowlist',
        severity: 'ERROR',
        message: `Component "${component.name}" is not in the allowed components list`,
        line: component.line,
        context: component.context,
      });
    }
  }
  
  return violations;
}

interface ExtractedComponent {
  name: string;
  line?: number;
  context?: string;
}

/**
 * Extract JSX component names from code content
 * MVP: Simple regex-based extraction
 * Matches opening tags like <ComponentName or <ComponentName>
 */
function extractJSXComponents(content: string): ExtractedComponent[] {
  const components: ExtractedComponent[] = [];
  const lines = content.split('\n');
  
  // Regex to match JSX opening tags with capital letters (custom components)
  // Matches: <ComponentName, <ComponentName>, <ComponentName />, <ComponentName attr="value"
  const jsxTagRegex = /<([A-Z][A-Za-z0-9_]*)/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = jsxTagRegex.exec(line)) !== null) {
      const componentName = match[1];
      
      // Avoid duplicates on same line
      const existing = components.find(
        (c) => c.name === componentName && c.line === index + 1
      );
      
      if (!existing) {
        components.push({
          name: componentName,
          line: index + 1,
          context: line.trim(),
        });
      }
    }
  });
  
  // Remove duplicates across lines (keep only first occurrence)
  const seen = new Set<string>();
  return components.filter((comp) => {
    if (seen.has(comp.name)) {
      return false;
    }
    seen.add(comp.name);
    return true;
  });
}

