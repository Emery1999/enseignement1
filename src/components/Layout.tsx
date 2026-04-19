import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Layers, Heart, LogOut, BookHeadphones, Settings } from 'lucide-react';
import { useAuthStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useState } from 'react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Thèmes', path: '/themes', icon: Layers },
  { name: 'Favoris', path: '/favoris', icon: Heart },
  { name: 'Paramètres', path: '/settings', icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen flex font-sans">
      {/* ESPACE DESKTOP SIDEBAR */}
      <aside className="glass-sidebar hidden md:flex flex-col fixed inset-y-0 z-50 py-8 px-5 w-[240px]">
        <div className="flex items-center gap-3 mb-10 px-2 text-white text-xl font-extrabold tracking-tight">
          <div className="h-9 w-9 bg-[#E63946]/10 border border-[#E63946]/20 text-[#E63946] shadow-[0_4px_20px_rgba(230,57,70,0.35)] rounded-xl flex items-center justify-center">
            <BookHeadphones size={20} />
          </div>
          <span>Enseignements</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium",
                  isActive ? "active-nav-item" : "nav-item-hover"
                )}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-sm font-bold">
              {user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email.split('@')[0]}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Déconnexion">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 w-full h-[64px] bg-white/90 backdrop-blur-md border-b border-[#F1F5F9] z-50 flex items-center justify-between px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#E63946]/10 text-[#E63946] rounded-lg flex items-center justify-center shadow-[0_2px_10px_rgba(230,57,70,0.15)]">
            <BookHeadphones size={18} />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">Enseignements</span>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={logout} className="p-2 text-gray-400" title="Déconnexion">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-[240px] pb-[82px] md:pb-0 pt-[64px] md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav id="mobile-nav" className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#F1F5F9] flex items-center px-2 z-50 h-[64px]">
        <div className="flex items-center justify-around w-full">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-2xl transition-colors",
                  isActive ? "text-[#E63946] bg-red-50" : "text-gray-400"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
