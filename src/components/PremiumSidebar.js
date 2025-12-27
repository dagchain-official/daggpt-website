import React from 'react';

const PremiumSidebar = ({ modules, onModuleClick, stats }) => {
  return (
    <div className="w-1/5 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col h-full">
      {/* Content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-8 border-b border-[#1A1A1A]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white tracking-tight">Workspace</h2>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Modules</h1>
          <p className="text-sm text-gray-500">Select a module to begin</p>
        </div>

        {/* Modules */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => onModuleClick(module.route)}
              className="group w-full text-left px-4 py-4 rounded-lg bg-[#0F0F0F] hover:bg-[#151515] border border-[#1A1A1A] hover:border-[#2A2A2A] transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${module.gradient} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{module.icon}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-0.5 group-hover:text-white transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {module.description}
                  </p>
                </div>
                
                {/* Arrow */}
                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="px-4 py-6 border-t border-[#1A1A1A]">
          <div className="text-xs font-medium text-gray-500 mb-4">Overview</div>
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0F0F0F] hover:bg-[#151515] transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <span className="text-sm">{stat.icon}</span>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-300">{stat.label}</span>
                </div>
                <span className="text-sm font-semibold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSidebar;
