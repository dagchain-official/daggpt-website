/**
 * ROBUST JSX Validator and Auto-Fixer
 * Uses stack-based parsing to properly fix JSX structure
 */

/**
 * Parse JSX and build a tag stack to find mismatches
 */
function parseJSXStructure(content) {
  const stack = [];
  const issues = [];
  
  // Self-closing HTML tags that don't need closing tags
  // Note: textarea is NOT void but often written without closing in JSX
  const voidElements = new Set([
    'input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 
    'col', 'embed', 'param', 'source', 'track', 'wbr'
  ]);
  
  // Match ALL opening and closing tags (including motion.*, self-closing)
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)?)[^>]*\/?>/g;
  
  let match;
  let position = 0;
  
  while ((match = tagPattern.exec(content)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const isSelfClosing = fullTag.endsWith('/>');
    const isClosing = fullTag.startsWith('</');
    const isVoidElement = voidElements.has(tagName.toLowerCase());
    
    // Skip self-closing tags and void elements
    if (isSelfClosing || isVoidElement) {
      continue;
    }
    
    if (isClosing) {
      // Closing tag - should match the last opening tag
      if (stack.length === 0) {
        issues.push({
          type: 'extra_closing',
          tag: tagName,
          position: match.index,
          text: fullTag
        });
      } else {
        const lastOpening = stack[stack.length - 1];
        if (lastOpening.tag === tagName) {
          // Correct match
          stack.pop();
        } else {
          // Mismatch!
          issues.push({
            type: 'mismatch',
            expected: lastOpening.tag,
            found: tagName,
            position: match.index,
            openingPosition: lastOpening.position
          });
          // Pop the mismatched opening
          stack.pop();
        }
      }
    } else {
      // Opening tag
      stack.push({
        tag: tagName,
        position: match.index,
        text: fullTag
      });
    }
    
    position = match.index + fullTag.length;
  }
  
  // Any remaining items in stack are unclosed tags
  for (const unclosed of stack) {
    issues.push({
      type: 'unclosed',
      tag: unclosed.tag,
      position: unclosed.position,
      text: unclosed.text
    });
  }
  
  return { issues, unclosedTags: stack };
}

/**
 * Check for adjacent JSX elements (missing wrapper)
 */
function checkAdjacentJSX(content) {
  // Look for patterns like:
  // </tag>
  // <tag> (with no wrapper)
  const adjacentPattern = /<\/[a-zA-Z][a-zA-Z0-9.]*>\s*\n\s*<[a-zA-Z][a-zA-Z0-9.]*[^/>]/g;
  const matches = content.match(adjacentPattern);
  
  if (matches && matches.length > 0) {
    console.log(`⚠️ Found ${matches.length} adjacent JSX element(s) - needs wrapper`);
    return true;
  }
  
  return false;
}

/**
 * Wrap adjacent JSX elements in a fragment
 */
function wrapAdjacentJSX(content) {
  // Find the return statement
  const returnMatch = content.match(/return\s*\(/);
  if (!returnMatch) {
    // Try return without parentheses
    const simpleReturn = content.match(/return\s+</);
    if (!simpleReturn) return content;
    
    // Wrap everything after return in fragment
    const returnIndex = simpleReturn.index + 6; // length of "return"
    const lines = content.slice(returnIndex).split('\n');
    const firstLine = lines[0].trim();
    
    // If it's a simple return, wrap it
    if (firstLine.startsWith('<') && !firstLine.startsWith('<>')) {
      console.log(`✅ Wrapping simple return in fragment`);
      return content.slice(0, returnIndex) + ' (\n    <>\n    ' + content.slice(returnIndex).trim() + '\n    </>\n  );';
    }
    return content;
  }
  
  const returnStart = returnMatch.index + returnMatch[0].length;
  
  // Find the matching closing parenthesis
  let depth = 0;
  let returnEnd = -1;
  
  for (let i = returnStart; i < content.length; i++) {
    if (content[i] === '(') depth++;
    if (content[i] === ')') {
      if (depth === 0) {
        returnEnd = i;
        break;
      }
      depth--;
    }
  }
  
  if (returnEnd === -1) return content;
  
  // Get the JSX content
  const jsxContent = content.slice(returnStart, returnEnd).trim();
  
  // Already wrapped in fragment?
  if (jsxContent.startsWith('<>') || jsxContent.startsWith('</')) {
    return content;
  }
  
  // Check if it starts with a single element
  if (!jsxContent.startsWith('<')) {
    return content;
  }
  
  // Simple heuristic: if we see multiple root-level closing tags, we need a wrapper
  const lines = jsxContent.split('\n');
  let rootClosingTags = 0;
  let indentLevel = -1;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('</')) {
      const currentIndent = line.length - line.trimStart().length;
      if (indentLevel === -1) {
        indentLevel = currentIndent;
        rootClosingTags++;
      } else if (currentIndent <= indentLevel) {
        rootClosingTags++;
      }
    }
  }
  
  // If more than 1 root closing tag, wrap in fragment
  if (rootClosingTags > 1) {
    console.log(`✅ Wrapping ${rootClosingTags} adjacent elements in fragment`);
    const indent = '      ';
    const wrapped = `\n${indent}<>\n${indent}${jsxContent.split('\n').join('\n' + indent)}\n${indent}</>\n    `;
    return content.slice(0, returnStart) + wrapped + content.slice(returnEnd);
  }
  
  return content;
}

/**
 * Smart fix for JSX structure issues
 */
function smartFixJSX(content, parseResult) {
  let fixed = content;
  const { issues, unclosedTags } = parseResult;
  
  if (issues.length === 0) {
    // Still check for adjacent JSX
    if (checkAdjacentJSX(fixed)) {
      fixed = wrapAdjacentJSX(fixed);
    }
    return fixed;
  }
  
  console.log(`🔍 Found ${issues.length} JSX issue(s)`);
  
  // Strategy 1: If we have mismatches, try to remove extra closing tags first
  const extraClosingIssues = issues.filter(i => i.type === 'extra_closing');
  if (extraClosingIssues.length > 0) {
    console.log(`⚠️ Removing ${extraClosingIssues.length} extra closing tag(s)`);
    
    // Find all closing tags and remove duplicates
    const lines = fixed.split('\n');
    const linesToRemove = new Set();
    
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i].trim();
      const nextLine = lines[i + 1].trim();
      
      // Check for duplicate closing tags (same tag on consecutive lines with only whitespace between)
      if (currentLine.match(/^<\/\w+>$/) && currentLine === nextLine) {
        console.log(`⚠️ Found duplicate closing tag on lines ${i + 1} and ${i + 2}: ${currentLine}`);
        linesToRemove.add(i + 1); // Remove the second occurrence
      }
      
      // Check for extra closing tags (closing tag with no matching opening)
      const closingMatch = currentLine.match(/^<\/(\w+)>$/);
      if (closingMatch) {
        const tag = closingMatch[1];
        // Count opening and closing tags up to this point
        const upToHere = lines.slice(0, i + 1).join('\n');
        const openCount = (upToHere.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
        const closeCount = (upToHere.match(new RegExp(`</${tag}>`, 'g')) || []).length;
        
        if (closeCount > openCount) {
          console.log(`⚠️ Extra closing </${tag}> on line ${i + 1} (${closeCount} close vs ${openCount} open)`);
          linesToRemove.add(i);
        }
      }
    }
    
    if (linesToRemove.size > 0) {
      fixed = lines.filter((_, index) => !linesToRemove.has(index)).join('\n');
      console.log(`✅ Removed ${linesToRemove.size} extra closing tag line(s)`);
      
      // Re-parse after removing extra tags
      const newParseResult = parseJSXStructure(fixed);
      if (newParseResult.issues.length === 0) {
        console.log(`✅ Fixed by removing extra closing tags`);
        return fixed;
      }
    }
  }
  
  // Strategy 2: Fix unclosed tags by adding closing tags
  if (unclosedTags.length > 0) {
    console.log(`⚠️ Unclosed tags: ${unclosedTags.map(t => t.tag).join(', ')}`);
    
    // Find the end of the return statement (before the final );)
    const returnMatch = content.match(/return\s*\(/);
    if (returnMatch) {
      // Find the matching closing parenthesis
      let depth = 0;
      let returnEnd = -1;
      
      for (let i = returnMatch.index + returnMatch[0].length; i < content.length; i++) {
        if (content[i] === '(') depth++;
        if (content[i] === ')') {
          if (depth === 0) {
            returnEnd = i;
            break;
          }
          depth--;
        }
      }
      
      if (returnEnd > 0) {
        // Add closing tags before the final )
        const indent = '    '; // 4 spaces
        const closingTags = unclosedTags.reverse().map(t => `${indent}</${t.tag}>`).join('\n');
        fixed = fixed.slice(0, returnEnd) + '\n' + closingTags + '\n' + fixed.slice(returnEnd);
        console.log(`✅ Added ${unclosedTags.length} closing tag(s)`);
      }
    }
  }
  
  // Strategy 3: Check for adjacent JSX (but only if we haven't already wrapped)
  const hasFragment = fixed.includes('<>') && fixed.includes('</>');
  if (!hasFragment && checkAdjacentJSX(fixed)) {
    fixed = wrapAdjacentJSX(fixed);
  }
  
  return fixed;
}

/**
 * Try to auto-fix JSX tag mismatches
 */
function autoFixJSXTags(content, issues) {
  let fixed = content;
  
  for (const issue of issues) {
    const { tag, difference } = issue;
    
    if (difference > 0) {
      // More opening tags than closing - add closing tags at the end
      console.log(`⚠️ JSX Fix: Adding ${difference} closing </${tag}> tag(s)`);
      
      // Find the last occurrence of the tag and add closing tags before the final closing tag
      const lastReturn = fixed.lastIndexOf('return (');
      const lastClosingParen = fixed.lastIndexOf(');', fixed.lastIndexOf('export default'));
      
      if (lastClosingParen > lastReturn) {
        // Add closing tags before the final );
        const closingTags = `\n${'  '.repeat(difference)}${Array(difference).fill(`</${tag}>`).join('\n  ')}`;
        fixed = fixed.slice(0, lastClosingParen) + closingTags + fixed.slice(lastClosingParen);
      }
    } else if (difference < 0) {
      // More closing tags than opening - remove extra closing tags
      console.log(`⚠️ JSX Fix: Removing ${Math.abs(difference)} extra </${tag}> tag(s)`);
      
      // Remove the last N closing tags
      for (let i = 0; i < Math.abs(difference); i++) {
        const lastClosing = fixed.lastIndexOf(`</${tag}>`);
        if (lastClosing !== -1) {
          fixed = fixed.slice(0, lastClosing) + fixed.slice(lastClosing + `</${tag}>`.length);
        }
      }
    }
  }
  
  return fixed;
}

/**
 * Validate and fix JSX in a file (ROBUST VERSION)
 */
export function validateAndFixJSX(content, fileName) {
  if (!content) return { content, fixed: false, issues: [] };
  
  // Only process JSX files
  if (!fileName.endsWith('.jsx') && !fileName.endsWith('.tsx')) {
    return { content, fixed: false, issues: [] };
  }
  
  // Parse JSX structure
  const parseResult = parseJSXStructure(content);
  
  if (parseResult.issues.length === 0) {
    return { content, fixed: false, issues: [] };
  }
  
  console.log(`🔍 JSX Validation: Found ${parseResult.issues.length} issue(s) in ${fileName}`);
  parseResult.issues.forEach(issue => {
    if (issue.type === 'unclosed') {
      console.log(`  - Unclosed <${issue.tag}> at position ${issue.position}`);
    } else if (issue.type === 'mismatch') {
      console.log(`  - Mismatch: expected </${issue.expected}>, found </${issue.found}>`);
    } else if (issue.type === 'extra_closing') {
      console.log(`  - Extra closing </${issue.tag}>`);
    }
  });
  
  // Try to auto-fix using smart parser
  const fixedContent = smartFixJSX(content, parseResult);
  
  // Verify the fix worked
  const verifyResult = parseJSXStructure(fixedContent);
  
  if (verifyResult.issues.length < parseResult.issues.length) {
    console.log(`✅ JSX Auto-Fix: Fixed ${parseResult.issues.length - verifyResult.issues.length} issue(s) in ${fileName}`);
    return { content: fixedContent, fixed: true, issues: verifyResult.issues };
  }
  
  return { content: fixedContent, fixed: false, issues: parseResult.issues };
}

/**
 * Validate and fix all JSX files in the tree
 */
export function validateAndFixAllJSX(files) {
  let totalFixed = 0;
  const fixedFiles = [];
  
  function processNode(node) {
    if (node.type === 'file' && node.content) {
      if (node.name.endsWith('.jsx') || node.name.endsWith('.tsx')) {
        const result = validateAndFixJSX(node.content, node.name);
        
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
