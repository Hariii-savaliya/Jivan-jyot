import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Home, Heart, UserCheck, Calendar,
  Star, FileText, Award, QrCode, BarChart3, ChevronLeft, ChevronRight,
  LogOut, Menu, X, HandCoins, UserPlus, MessageSquare
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Staff', icon: Users, path: '/staff' },
  { label: 'Residents', icon: Home, path: '/residents' },
  { label: 'Discharge Management', icon: LogOut, path: '/discharge' },
  { label: 'Donations', icon: Heart, path: '/donations' },
  { label: 'Donors', icon: UserPlus, path: '/donors' },
  { label: 'Volunteers', icon: UserCheck, path: '/volunteers' },
  { label: 'Events', icon: Calendar, path: '/events' },
  { label: 'Wish Wall', icon: Star, path: '/wish-wall' },
  { label: 'Messages', icon: MessageSquare, path: '/messages' },
  { label: 'Reports', icon: FileText, path: '/reports' },
  { label: 'Certificates', icon: Award, path: '/certificates' },
  { label: 'QR Donations', icon: QrCode, path: '/qr-donations' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <img src="/logo.png" alt="Jivan Jyot Logo" className="w-8 h-8 object-contain rounded bg-white p-0.5" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-xs font-bold text-sidebar-foreground truncate">Jivan Jyot</h1>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">Ashram Admin</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/25'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
              {!collapsed && <span className="truncate font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:text-red-400 hover:bg-sidebar-accent w-full transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="font-medium">Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card shadow-md border border-border"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-300 h-full ${collapsed ? 'w-16' : 'w-60'}`}>
        <NavContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}