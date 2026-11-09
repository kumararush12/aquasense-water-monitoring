/**
 * AquaSense Top Navigation Bar
 * Follows the 3-Zone Top Bar Contract with responsive mobile drawer
 */

import React, { useState } from 'react';
import {
  Droplets,
  Sun,
  Moon,
  SlidersHorizontal,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  onToggleTheme,
  onOpenSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Overview' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'test', label: 'New Test' },
    { id: 'history', label: 'History' },
    { id: 'compare', label: 'Compare' },
    { id: 'education', label: 'Learning' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-md"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">AquaSense</span>
        </button>

        {/* Zone 2: Navigation Links (Single-line, quiet hover) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors relative ${
                  isActive
                    ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600 dark:bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Theme, Settings, Primary Test Button) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Screening Settings */}
          <button
            onClick={onOpenSettings}
            title="Configure Screening References"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            aria-label="Screening Reference Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            aria-label="Toggle Color Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Primary Quick CTA */}
          <button
            onClick={() => handleNavClick('test')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 rounded-lg shadow-sm shadow-cyan-600/20 transition-all hover:shadow whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Sample</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('test')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log New Water Sample</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
