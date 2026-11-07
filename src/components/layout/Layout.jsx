import React, { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { TopNav } from './TopNav.jsx';

export function Layout({ 
  currentSection, 
  onSelectSection, 
  pageTitle, 
  pageSubtitle,
  searchQuery, 
  onSearchChange, 
  children 
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172B4D] flex flex-col lg:flex-row antialiased font-sans">
      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={onSelectSection}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
