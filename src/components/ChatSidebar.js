// ChatGPT-style Sidebar Component
import React from 'react';

const ChatSidebar = ({ 
  currentUser, 
  conversations, 
  activeConversationId, 
  onNewChat, 
  onSelectConversation,
  onLogout,
  onMyCreations
}) => {
  return (
    <div className="w-64 sm:w-64 h-full bg-white border-r border-gray-200 text-gray-800 flex flex-col fixed sm:relative inset-y-0 left-0 z-50 sm:z-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <img src="/images/logo8.jpg" alt="DAG GPT" className="w-6 h-6 rounded" />
          </div>
          <span className="font-bold text-sm text-gray-800" style={{ fontFamily: 'Nasalization, sans-serif' }}>
            DAG GPT
          </span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium text-gray-700">New chat</span>
        </button>
      </div>

      {/* My Creations Button */}
      <div className="px-3 pb-2">
        <button 
          onClick={onMyCreations}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors text-left"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">My Creations</span>
        </button>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="text-xs text-gray-500 px-3 py-2 font-semibold">Recent</div>
        {conversations.length === 0 ? (
          <div className="text-xs text-gray-400 px-3 py-2">No conversations yet</div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                  activeConversationId === conv.id
                    ? 'bg-orange-50 border border-orange-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm truncate flex-1 text-gray-700">{conv.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-3 space-y-2">
        {/* Upgrade Button - Full Width */}
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity text-white rounded-lg shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-semibold">Upgrade Plan</span>
        </button>

        {/* Notifications & Profile Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Notifications */}
          <button className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Notification Badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex-1">
            <img 
              src={currentUser?.photoURL || 'https://via.placeholder.com/32'} 
              alt="Profile" 
              className="w-7 h-7 rounded-full ring-2 ring-gray-200"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/32';
              }}
            />
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-xs font-medium text-gray-700 truncate">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-gray-500">Free Plan</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
