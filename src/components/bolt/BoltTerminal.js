/**
 * Bolt Terminal Component
 * Terminal with logs and command input
 */

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Minus, Maximize2, X, ChevronRight } from 'lucide-react';
import { useBoltStore } from '../../stores/boltStore';

const BoltTerminal = () => {
  const { logs, isTerminalMinimized, setTerminalMinimized, addLog, clearLogs } = useBoltStore();
  const [command, setCommand] = useState('');
  const logsEndRef = useRef(null);
  
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [logs]);
  
  const handleCommand = (e) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    // Add command to logs
    addLog({
      type: 'command',
      message: `$ ${command}`
    });
    
    // TODO: Execute command
    addLog({
      type: 'info',
      message: 'Command execution not yet implemented'
    });
    
    setCommand('');
  };
  
  const getLogColor = (type) => {
    const colors = {
      info: 'text-[#8b949e]',
      success: 'text-[#3fb950]',
      warning: 'text-[#d29922]',
      error: 'text-[#f85149]',
      command: 'text-[#58a6ff]',
    };
    return colors[type] || 'text-[#c9d1d9]';
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  
  return (
    <div 
      className={`flex flex-col border-t border-[#30363d] bg-[#0d1117] transition-all duration-300 ${
        isTerminalMinimized ? 'h-10' : 'h-48'
      }`}
    >
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-[#8b949e]" />
          <span className="text-sm font-medium text-[#c9d1d9]">Terminal</span>
          {logs.length > 0 && (
            <span className="text-xs text-[#8b949e]">
              ({logs.length} {logs.length === 1 ? 'log' : 'logs'})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={clearLogs}
            className="h-7 px-2 text-xs text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9] rounded transition-colors"
            title="Clear logs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setTerminalMinimized(!isTerminalMinimized)}
            className="h-7 w-7 flex items-center justify-center text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9] rounded transition-colors"
            title={isTerminalMinimized ? 'Maximize' : 'Minimize'}
          >
            {isTerminalMinimized ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
      
      {!isTerminalMinimized && (
        <>
          {/* Logs */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs scrollbar-thin">
            {logs.length === 0 ? (
              <div className="flex items-center gap-2 text-[#8b949e]">
                <ChevronRight className="w-3 h-3" />
                <span>Terminal ready. Type a command or start generating code...</span>
              </div>
            ) : (
              <>
                {logs.map((log) => (
                  <div key={log.id} className={`flex gap-2 mb-1 ${getLogColor(log.type)}`}>
                    <span className="text-[#6e7781]">[{formatTime(log.timestamp)}]</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </>
            )}
          </div>
          
          {/* Input */}
          <form 
            onSubmit={handleCommand}
            className="flex items-center gap-2 px-3 py-2 border-t border-[#30363d] bg-[#161b22]"
          >
            <ChevronRight className="w-4 h-4 text-[#2188ff] flex-shrink-0" />
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="flex-1 bg-transparent text-xs font-mono text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none"
              placeholder="Enter command..."
            />
          </form>
        </>
      )}
    </div>
  );
};

export default BoltTerminal;
