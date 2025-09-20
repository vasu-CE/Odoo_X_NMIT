import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const Sidebar = ({ className = '', children, ...props }) => {
  const { isOpen } = useSidebar();
  
  return (
    <div
      className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarTrigger = ({ className = '', ...props }) => {
  const { setIsOpen } = useSidebar();
  
  return (
    <button
      className={`p-2 rounded-md hover:bg-gray-100 ${className}`}
      onClick={() => setIsOpen(prev => !prev)}
      {...props}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};

export const SidebarHeader = ({ className = '', children, ...props }) => (
  <div className={`p-4 border-b ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarContent = ({ className = '', children, ...props }) => (
  <div className={`flex-1 overflow-y-auto ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarFooter = ({ className = '', children, ...props }) => (
  <div className={`p-4 border-t ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarGroup = ({ className = '', children, ...props }) => (
  <div className={`p-2 ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarGroupLabel = ({ className = '', children, ...props }) => (
  <div className={`px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarGroupContent = ({ className = '', children, ...props }) => (
  <div className={`space-y-1 ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarMenu = ({ className = '', children, ...props }) => (
  <ul className={`space-y-1 ${className}`} {...props}>
    {children}
  </ul>
);

export const SidebarMenuItem = ({ className = '', children, ...props }) => (
  <li className={className} {...props}>
    {children}
  </li>
);

export const SidebarMenuButton = ({ className = '', children, asChild = false, ...props }) => {
  const Component = asChild ? 'div' : 'button';
  
  return (
    <Component
      className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};