import { type ReactNode } from 'react';
import { ModernSidebar } from './Sidebar'; // Fixed: Changed from ../ to ./

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-ink font-sans flex overflow-hidden">

      {/* 1. The Floating Sidebar */}
      <ModernSidebar />

      {/* 2. The Main Content Area */}
      <main className="flex-1 ml-[80px] xl:ml-[240px] p-6 lg:p-10 transition-all duration-300 w-full h-screen overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">

          {/* 3. This magically renders whichever page App.tsx tells it to! */}
          {children}

        </div>
      </main>
    </div>
  );
}