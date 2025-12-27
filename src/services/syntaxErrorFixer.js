/**
 * SYNTAX ERROR FIXER
 * Fixes common syntax errors that break the build
 */

/**
 * Fix SVG data URLs in className attributes
 * These often have unescaped quotes that break JSX parsing
 */
function fixSVGDataURLs(content) {
  let fixed = content;
  let changesMade = false;
  
  // Find all bg-[url('data:image/svg+xml,...')] patterns
  const svgUrlPattern = /className="[^"]*bg-\[url\('data:image\/svg\+xml,[^']*'\)\][^"]*"/g;
  
  const matches = content.match(svgUrlPattern);
  if (matches) {
    for (const match of matches) {
      // Extract the SVG data URL
      const urlMatch = match.match(/bg-\[url\('(data:image\/svg\+xml,[^']*)'\)\]/);
      if (urlMatch) {
        const originalUrl = urlMatch[1];
        
        // Check if it has unescaped quotes
        if (originalUrl.includes('"')) {
          console.log(`⚠️ Found unescaped quotes in SVG data URL`);
          
          // Replace all " with %22 (URL encoded quote)
          const fixedUrl = originalUrl.replace(/"/g, '%22');
          
          // Replace in the original match
          const fixedMatch = match.replace(originalUrl, fixedUrl);
          
          // Replace in content
          fixed = fixed.replace(match, fixedMatch);
          changesMade = true;
          
          console.log(`✅ Fixed SVG data URL quotes`);
        }
      }
    }
  }
  
  return { content: fixed, changed: changesMade };
}

/**
 * Fix unescaped quotes in template literals
 */
function fixTemplateStringQuotes(content) {
  let fixed = content;
  let changesMade = false;
  
  // Find template literals with unescaped quotes
  const lines = fixed.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for className with nested quotes
    if (line.includes('className=') && line.includes('url(')) {
      // Count quotes
      const doubleQuotes = (line.match(/"/g) || []).length;
      
      // If odd number of quotes, there's likely an escaping issue
      if (doubleQuotes % 2 !== 0) {
        console.log(`⚠️ Potential quote issue on line ${i + 1}`);
        
        // Try to fix by using template literal instead
        const classNameMatch = line.match(/className="([^"]*)"/);
        if (classNameMatch && classNameMatch[1].includes('url(')) {
          const className = classNameMatch[1];
          const fixedLine = line.replace(`className="${className}"`, `className={\`${className}\`}`);
          lines[i] = fixedLine;
          changesMade = true;
          console.log(`✅ Converted to template literal on line ${i + 1}`);
        }
      }
    }
  }
  
  if (changesMade) {
    fixed = lines.join('\n');
  }
  
  return { content: fixed, changed: changesMade };
}

/**
 * Fix all syntax errors in a file
 */
export function fixSyntaxErrors(content, fileName) {
  if (!content || (!fileName.endsWith('.jsx') && !fileName.endsWith('.tsx'))) {
    return { content, fixed: false };
  }
  
  console.log(`🔍 Checking syntax in ${fileName}`);
  
  let fixed = content;
  let totalChanges = false;
  
  // Fix 1: SVG data URLs
  const svgResult = fixSVGDataURLs(fixed);
  if (svgResult.changed) {
    fixed = svgResult.content;
    totalChanges = true;
  }
  
  // Fix 2: Template string quotes
  const templateResult = fixTemplateStringQuotes(fixed);
  if (templateResult.changed) {
    fixed = templateResult.content;
    totalChanges = true;
  }
  
  if (totalChanges) {
    console.log(`✅ Fixed syntax errors in ${fileName}`);
  }
  
  return { content: fixed, fixed: totalChanges };
}

/**
 * Fix syntax errors in all files
 */
export function fixAllSyntaxErrors(files) {
  let totalFixed = 0;
  const fixedFiles = [];
  
  function processNode(node) {
    if (node.type === 'file' && node.content) {
      if (node.name.endsWith('.jsx') || node.name.endsWith('.tsx')) {
        const result = fixSyntaxErrors(node.content, node.name);
        
        if (result.fixed) {
          node.content = result.content;
          totalFixed++;
          fixedFiles.push(node.name);
        }
      }
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => processNode(child));
    }
  }
  
  files.forEach(node => processNode(node));
  
  return {
    files,
    fixedCount: totalFixed,
    fixedFiles
  };
}
