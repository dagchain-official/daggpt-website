import React, { useState, useEffect } from 'react';

const MultiFileProjectViewer = ({ project }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [iframeContent, setIframeContent] = useState('');

  useEffect(() => {
    if (project && project.files) {
      // Set default selected file to preview file
      const previewFile = project.files.find(f => f.path === project.preview) || project.files[0];
      setSelectedFile(previewFile);
      
      // Generate iframe content with all files
      generateIframeContent();
    }
  }, [project]);

  const generateIframeContent = () => {
    if (!project || !project.files) return;

    // Find index.html
    const indexFile = project.files.find(f => f.path === 'index.html');
    if (!indexFile) return;

    let html = indexFile.content;

    // Replace CSS file references with inline styles
    const cssFiles = project.files.filter(f => f.path.endsWith('.css'));
    cssFiles.forEach(cssFile => {
      const styleTag = `<style>/* ${cssFile.path} */\n${cssFile.content}\n</style>`;
      html = html.replace(`<link rel="stylesheet" href="${cssFile.path}">`, styleTag);
      html = html.replace(`<link rel="stylesheet" href="./${cssFile.path}">`, styleTag);
      html = html.replace(`<link href="${cssFile.path}" rel="stylesheet">`, styleTag);
    });

    // Replace JS file references with inline scripts
    const jsFiles = project.files.filter(f => f.path.endsWith('.js'));
    jsFiles.forEach(jsFile => {
      const scriptTag = `<script>/* ${jsFile.path} */\n${jsFile.content}\n</script>`;
      html = html.replace(`<script src="${jsFile.path}"></script>`, scriptTag);
      html = html.replace(`<script src="./${jsFile.path}"></script>`, scriptTag);
    });

    setIframeContent(html);
  };

  const handleDownloadProject = () => {
    if (!project || !project.files) return;

    // Create a simple text file with all files
    let content = '=== COMPLETE PROJECT FILES ===\n\n';
    
    project.files.forEach(file => {
      content += `\n\n========== ${file.path} ==========\n\n`;
      content += file.content;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website-project.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (path) => {
    if (path.endsWith('.html')) return '📄';
    if (path.endsWith('.css')) return '🎨';
    if (path.endsWith('.js')) return '⚡';
    if (path.endsWith('.json')) return '📦';
    if (path.endsWith('.md')) return '📝';
    return '📁';
  };

  if (!project || !project.files) {
    return <div className="text-white">No project data</div>;
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0A0F]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'preview'
                ? 'bg-brand-purple text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            👁️ Preview
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'code'
                ? 'bg-brand-purple text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            💻 Code
          </button>
        </div>
        <button
          onClick={handleDownloadProject}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>📥</span>
          <span>Download Project</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        <div className="w-64 border-r border-white/10 overflow-y-auto bg-[#0F0F14]">
          <div className="p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Project Files ({project.files.length})
            </div>
            <div className="space-y-1">
              {project.files.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    selectedFile?.path === file.path
                      ? 'bg-brand-purple/20 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span>{getFileIcon(file.path)}</span>
                  <span className="text-sm truncate">{file.path}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'preview' ? (
            <iframe
              key={iframeContent}
              srcDoc={iframeContent}
              className="w-full h-full border-none bg-white"
              title="Website Preview"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          ) : (
            <div className="h-full overflow-auto p-6 bg-[#0A0A0F]">
              {selectedFile && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">{getFileIcon(selectedFile.path)}</span>
                    <h3 className="text-xl font-bold text-white">{selectedFile.path}</h3>
                  </div>
                  <pre className="bg-[#1A1A1F] p-6 rounded-xl overflow-x-auto">
                    <code className="text-sm text-gray-300 font-mono">
                      {selectedFile.content}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiFileProjectViewer;
