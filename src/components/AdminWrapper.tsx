"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Truck, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Package,
  Banknote
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Quote Requests', href: '/quotes', icon: FileText },
  { name: 'Shipments', href: '/shipments', icon: Truck },
  { name: 'Pricing', href: '/pricing', icon: Banknote },
  { name: 'Management', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  // Don't show sidebar on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen z-40
        transition-all duration-300 ease-in-out
        border-r border-white/10 glass-panel
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
        overflow-hidden flex flex-col
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Package className="w-6 h-6 text-primary" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">Raj Admin</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Packers & Movers</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'hover:bg-white/5 text-secondary hover:text-foreground'}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                {isSidebarOpen && isActive && <ChevronRight className="ml-auto w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 text-secondary hover:text-red-400 transition-colors group">
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <header className="lg:hidden p-4 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                <span className="font-bold">Raj Admin</span>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
                {isSidebarOpen ? <X /> : <Menu />}
            </button>
        </header>

        <main className="p-4 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 lg:hidden z-30" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
