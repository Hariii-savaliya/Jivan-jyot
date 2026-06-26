import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import moment from 'moment';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const initials = (user?.full_name || 'A').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('mock_access_token') || localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const host = window.location.hostname;
        const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
        const apiHost = isLocal ? `http://${host}:5000` : 'https://donate-me-j4ha.onrender.com';
        
        const res = await fetch(`${apiHost}/api/dashboard`, { headers });
        const data = await res.json();
        if (data && data.success && data.recentActivities) {
          setActivities(data.recentActivities);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 pl-12 lg:pl-0" />

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors relative"
            aria-label="Toggle notifications"
          >
            <Bell className="w-4 h-4" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 p-4">
              <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                <h4 className="font-heading font-semibold text-sm text-foreground">Recent Activities</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                {activities.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No recent activity logs.</p>
                ) : (
                  activities.map(act => (
                    <div key={act._id} className="text-xs pb-2 border-b border-border last:border-0 text-left">
                      <p className="font-medium text-foreground leading-snug">{act.action}</p>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                        <span>By {act.user?.name || 'System'}</span>
                        <span>{moment(act.timestamp).fromNow()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 ml-2 pl-3 border-l border-border">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-tight">{user?.full_name || 'Admin'}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{user?.role || 'Super Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}