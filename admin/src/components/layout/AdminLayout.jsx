import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ThemeProvider } from './ThemeProvider';

export default function AdminLayout() {
  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="relative h-full">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}       