/**
 * Bolt Chat Panel Component
 * AI chat interface for generating and modifying code
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Save, History } from 'lucide-react';
import { useBoltStore } from '../../stores/boltStore';
import { generateCode } from '../../services/boltAI';
import { setupAndRunProject } from '../../services/boltWebContainer';
import { createInstantPreview } from '../../services/instantPreview';
import { fixAllImports } from '../../services/fixImports';
import { fixTailwindSetup } from '../../services/fixTailwind';
import { detectPlaceholderComponents, fixPlaceholderComponents } from '../../services/validation/placeholderDetector';
import { fixDependencyVersions, createNpmrcFile } from '../../services/validation/dependencyFixer';
import { fixAllReactImports } from '../../services/validation/reactImportFixer';
import { fixAllJSXFiles } from '../../services/realJsxFixer';
import { createProjectPlan, generateEnhancedPrompt } from '../../services/ai/projectPlanner';
import { selectTemplate } from '../../services/templates/templateSelector';
import { customizeTemplateForUser } from '../../services/templates/templateCustomizer';
import { generateWithMultiStage, validateGeneratedCode } from '../../services/ai/multiStageGenerator';
import { generateIncremental } from '../../services/ai/incrementalGenerator';
import { generateDesignSystemPrompt } from '../../services/ai/designSystem';
import { checkProjectQuality, generateQualityReport } from '../../services/ai/codeQualityChecker';
import { saveProject, getRecentProjects } from '../../services/history/projectHistory';
import ExportButton from './ExportButton';

const BoltChatPanel = ({ isWebApp = false }) => {
  const { 
    messages, 
    isTyping, 
    addMessage, 
    setIsTyping,
    setFiles,
    addLog,
    setIsGenerating,
    setPreviewUrl
  } = useBoltStore();
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [currentProjectName, setCurrentProjectName] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, streamingContent]);

  // Save project to history
  const handleSaveProject = () => {
    const files = useBoltStore.getState().files;
    if (!files || files.length === 0) {
      alert('No project to save!');
      return;
    }

    const projectName = currentProjectName || prompt('Enter project name:', 'My Project');
    if (!projectName) return;

    const saved = saveProject({
      name: projectName,
      type: 'website',
      files: files,
      description: `Generated with DAGGPT`
    });

    if (saved) {
      setCurrentProjectName(projectName);
      addLog({
        type: 'success',
        message: `💾 Project "${projectName}" saved to history!`
      });
    }
  };
  
  // Helper function to process generated files (ENHANCED with Quality Checks)
  const processGeneratedFiles = (fileTree, projectPlan = null) => {
    if (!fileTree || fileTree.length === 0) return;
    
    // Step 0: Fix dependency versions (NEW!)
    const { files: depsFixed, fixed: depsWereFixed, fixes: depFixes } = fixDependencyVersions(fileTree);
    
    if (depsWereFixed) {
      addLog({
        type: 'success',
        message: `📦 Fixed dependency conflicts: ${depFixes.join(', ')}`
      });
      
      // Add .npmrc file for legacy peer deps
      const hasNpmrc = depsFixed.some(node => node.name === '.npmrc');
      if (!hasNpmrc) {
        depsFixed.push(createNpmrcFile());
        addLog({
          type: 'info',
          message: '📝 Added .npmrc for compatibility'
        });
      }
    }
    
    // Step 1: Fix Tailwind setup
    const { files: tailwindFixed, fixCount: tailwindFixCount, fixes: tailwindFixes } = fixTailwindSetup(depsFixed);
    
    if (tailwindFixCount > 0) {
      addLog({
        type: 'info',
        message: `🎨 Fixed Tailwind setup: ${tailwindFixes.join(', ')}`
      });
    }
    
    // Step 2: Fix placeholder components (NEW!)
    const userDetails = projectPlan?.userDetails || null;
    const { files: noPlaceholders, fixedCount: placeholderCount, fixedComponents, createdComponents } = fixPlaceholderComponents(tailwindFixed, userDetails);
    
    if (placeholderCount > 0) {
      const allFixed = [...fixedComponents, ...createdComponents];
      addLog({
        type: 'success',
        message: `🔧 Fixed ${placeholderCount} component(s): ${allFixed.join(', ')}`
      });
    }
    
    // Step 3: Fix React imports
    const { files: reactFixed, fixedCount: reactFixCount, fixedFiles: reactFixedFiles } = fixAllReactImports(noPlaceholders);
    
    if (reactFixCount > 0) {
      addLog({
        type: 'success',
        message: `⚛️ Fixed React imports in ${reactFixCount} file(s)`
      });
    }
    
    // Step 4: Fix JSX structure (REAL FIXER!)
    addLog({
      type: 'info',
      message: '🔧 Fixing JSX structure...'
    });
    
    const { files: jsxFixed, fixedCount: jsxFixCount, fixedFiles: jsxFixedFiles } = fixAllJSXFiles(reactFixed);
    
    if (jsxFixCount > 0) {
      addLog({
        type: 'success',
        message: `✅ Fixed JSX in ${jsxFixCount} file(s): ${jsxFixedFiles.join(', ')}`
      });
    } else {
      addLog({
        type: 'success',
        message: '✅ JSX structure is valid'
      });
    }
    
    // Step 5: Fix import paths
    const fixedFileTree = fixAllImports(jsxFixed);
    
    // Step 5: Quality Check
    addLog({
      type: 'info',
      message: '🔍 Running quality checks...'
    });
    
    const qualityCheck = checkProjectQuality(fixedFileTree);
    const qualityReport = generateQualityReport(qualityCheck);
    
    addLog({
      type: qualityReport.grade === 'A' || qualityReport.grade === 'B' ? 'success' : 'warning',
      message: `📊 Code Quality: ${qualityReport.grade} (${qualityReport.score}/100) - ${qualityReport.status}`
    });
    
    if (qualityCheck.criticalIssues > 0) {
      addLog({
        type: 'warning',
        message: `⚠️ Found ${qualityCheck.criticalIssues} critical issues - Review recommended`
      });
    }
    
    // Step 5: Validation against plan (if available)
    if (projectPlan) {
      const validation = validateGeneratedCode(fixedFileTree, projectPlan);
      if (!validation.valid) {
        addLog({
          type: 'warning',
          message: `⚠️ Validation: ${validation.issues.length} issues found`
        });
      }
    }
    
    setFiles(fixedFileTree);
    addLog({
      type: 'success',
      message: `✅ Generated ${countFiles(fixedFileTree)} files`
    });

    // Auto-save project to history
    if (!currentProjectName) {
      const projectType = projectPlan?.projectType || 'website';
      const autoName = `${projectType}-${Date.now()}`;
      setCurrentProjectName(autoName);
      
      saveProject({
        name: autoName,
        type: projectType,
        files: fixedFileTree,
        description: 'Auto-saved by DAGGPT'
      });

      addLog({
        type: 'info',
        message: `💾 Auto-saved as "${autoName}"`
      });
    }
    
    // Always use WebContainer for proper React apps
    addLog({
      type: 'info',
      message: `🚀 Setting up development environment...`
    });
    
    // Small delay to ensure all files are ready before WebContainer starts
    setTimeout(() => {
      setupAndRunProject(
        fixedFileTree,
        (log) => addLog(log),
        (url) => setPreviewUrl(url)
      ).catch(error => {
        addLog({
          type: 'error',
          message: `❌ Failed to run project: ${error.message}`
        });
      });
    }, 1000); // 1 second delay to ensure files are fully processed
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userMessage = input;
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage
    });
    
    setInput('');
    setIsTyping(true);
    setIsGenerating(true);
    setStreamingContent('');
    
    // Add log
    addLog({
      type: 'info',
      message: '🤖 DAGGPT is generating code...'
    });
    
    try {
      // Step 1: Create project plan (with AI component analysis!)
      addLog({
        type: 'info',
        message: '🧠 Analyzing your request with AI...'
      });
      
      const projectPlan = await createProjectPlan(userMessage);
      
      addLog({
        type: 'success',
        message: `📋 Smart Analysis: ${projectPlan.projectType} with ${projectPlan.summary.totalComponents} custom components`
      });

      // Show personalization info (CRITICAL!)
      if (projectPlan.userDetails && projectPlan.userDetails.hasRealData) {
        const { name, profession } = projectPlan.userDetails;
        addLog({
          type: 'success',
          message: `👤 Personalized for: ${name} - ${profession}`
        });
      }

      // Show library recommendations
      if (projectPlan.libraries && projectPlan.libraries.recommendations.length > 0) {
        const libNames = projectPlan.libraries.recommendations
          .slice(0, 2)
          .map(lib => lib.library)
          .join(', ');
        
        addLog({
          type: 'info',
          message: `📚 Smart libraries: ${libNames} (${projectPlan.libraries.recommendations.length} total)`
        });
      }
      
      // Step 2: Check if template is available
      const template = selectTemplate(userMessage, projectPlan.projectType);
      
      if (template) {
        // Use template for instant generation!
        addLog({
          type: 'success',
          message: `⚡ Template found: ${template.name} - Using instant generation!`
        });
        
        addLog({
          type: 'info',
          message: `🎨 Customizing template with your content...`
        });
        
        // Customize template
        const customized = customizeTemplateForUser(template, userMessage);
        
        addLog({
          type: 'success',
          message: `✅ Template customized! Skipping AI generation.`
        });
        
        // Skip AI generation and go straight to file processing
        const fileTree = customized.files;
        
        // Process files immediately
        setStreamingContent('');
        setIsTyping(false);
        setIsGenerating(false);
        
        // Add assistant message
        addMessage({
          role: 'assistant',
          content: `I've created a ${template.name} for you using our optimized template! This was instant - no AI generation needed.`
        });
        
        // Process the template files (pass projectPlan for validation)
        processGeneratedFiles(fileTree, projectPlan);
        
        return; // Exit early - no AI generation needed
      }
      
      // No template available - use INCREMENTAL generation (NEW!)
      addLog({
        type: 'info',
        message: `⏱️ Estimated time: 3-5 minutes (high quality generation)`
      });
      
      // Step 3: Incremental generation with Claude Sonnet 4.5
      addLog({
        type: 'info',
        message: '🎯 Using incremental generation for higher quality...'
      });
      
      const result = await generateIncremental(projectPlan, (progress) => {
        addLog(progress);
      });
      
      if (result.success) {
        setStreamingContent('');
        setIsTyping(false);
        setIsGenerating(false);
        
        // Add assistant message
        addMessage({
          role: 'assistant',
          content: `I've created your ${projectPlan.projectType} with ${result.fileCount} files using incremental generation. Each file was carefully crafted with Claude Sonnet 4.5 for maximum quality!`
        });
        
        // Process generated files (pass projectPlan for validation)
        processGeneratedFiles(result.files, projectPlan);
      } else {
        throw new Error('Incremental generation failed');
      }
      
    } catch (error) {
      console.error('Generation error:', error);
      setIsTyping(false);
      setIsGenerating(false);
      setStreamingContent('');
      
      addMessage({
        role: 'assistant',
        content: `❌ Failed to generate code: ${error.message}`
      });
      
      addLog({
        type: 'error',
        message: `❌ Error: ${error.message}`
      });
    }
  };
  
  // Helper to count files in tree
  const countFiles = (tree) => {
    let count = 0;
    tree.forEach(item => {
      if (item.type === 'file') count++;
      if (item.children) count += countFiles(item.children);
    });
    return count;
  };
  
  const examplePrompts = isWebApp ? [
    "Build a task management app with drag-and-drop",
    "Create a CRM dashboard with customer data tables",
    "Make a note-taking app with rich text editor",
    "Design an analytics dashboard with real-time charts"
  ] : [
    "Build a modern landing page with hero section and features",
    "Create a dashboard with charts and data tables",
    "Make a portfolio website with project gallery",
    "Design a blog with article cards and sidebar"
  ];
  
  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#c9d1d9] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2188ff]" />
          AI Assistant
        </h2>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveProject}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-md transition"
            title="Save Project"
          >
            <Save size={14} />
            Save
          </button>
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-md transition"
            title="Project History"
          >
            <History size={14} />
            History
          </button>
          
          {useBoltStore.getState().files?.length > 0 && (
            <ExportButton 
              files={useBoltStore.getState().files} 
              projectName={currentProjectName || 'my-project'}
            />
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2188ff] to-[#58a6ff] flex items-center justify-center mb-4 shadow-lg shadow-[#2188ff]/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#c9d1d9] mb-2">
              What would you like to build?
            </h3>
            <p className="text-sm text-[#8b949e] mb-6">
              Describe your project and I'll generate the code for you
            </p>
            
            {/* Example Prompts */}
            <div className="w-full space-y-2">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left px-3 py-2 text-xs text-[#8b949e] bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {streamingContent && (
              <MessageBubble 
                message={{ 
                  role: 'assistant', 
                  content: streamingContent,
                  timestamp: new Date()
                }} 
                isStreaming={true}
              />
            )}
            {isTyping && !streamingContent && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#30363d]">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe what you want to build..."
            className="flex-1 min-h-[80px] px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#2188ff] resize-none scrollbar-thin"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="h-10 w-10 flex items-center justify-center bg-gradient-to-r from-[#2188ff] to-[#58a6ff] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg shadow-[#2188ff]/30"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-[#2188ff] text-white'
            : 'bg-[#161b22] text-[#c9d1d9] border border-[#30363d]'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div className="flex items-center gap-2 mt-1">
          {isStreaming && (
            <Loader2 className="w-3 h-3 animate-spin opacity-60" />
          )}
          <span className="text-xs opacity-60">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-[#8b949e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#8b949e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#8b949e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default BoltChatPanel;
