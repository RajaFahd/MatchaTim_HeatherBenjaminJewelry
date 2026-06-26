'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Load theme and auth status from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  // Handle Authentication Redirects
  useEffect(() => {
    if (!mounted) return;
    const isAuthPage = pathname === '/login';
    const savedToken = localStorage.getItem('token');
    
    if (!savedToken && !isAuthPage) {
      window.location.href = '/login';
    } else if (savedToken && isAuthPage) {
      window.location.href = '/';
    }
  }, [pathname, mounted]);

  // Close sidebar on page change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const isAuthPage = pathname === '/login';

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-main text-txt-main transition-colors duration-300 font-sans flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main text-txt-main transition-colors duration-300 font-sans flex flex-col">
      {/* Premium Navbar */}
      <header className="border-b border-border-main bg-bg-main transition-colors duration-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger (only logged-in pages) */}
            {!isAuthPage && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-btn hover:bg-bg-card transition border border-border-main text-txt-muted hover:text-primary-gold cursor-pointer"
                aria-label="Open Sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Logo */}
            <a href="/" className="font-display italic text-sm sm:text-xl font-bold tracking-wide text-primary-gold hover:opacity-85 transition">
              💎 <span className="hidden sm:inline">HEATHER BENJAMIN</span><span className="sm:hidden">HB JEWELRY</span>
            </a>
          </div>

          {/* Navigation Links - Desktop Only */}
          {!isAuthPage && (
            <nav className="hidden md:flex space-x-8 text-sm font-medium">
              <a 
                href="/" 
                className={`transition-colors ${pathname === '/' ? 'text-primary-gold font-semibold' : 'text-txt-muted hover:text-primary-gold'}`}
              >
                Upload PO
              </a>
              <a 
                href="/dashboard" 
                className={`transition-colors ${pathname.startsWith('/dashboard') ? 'text-primary-gold font-semibold' : 'text-txt-muted hover:text-primary-gold'}`}
              >
                Dashboard
              </a>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-full hover:bg-bg-card transition border border-border-main text-txt-muted hover:text-primary-gold cursor-pointer"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Desktop Actions Only */}
            {!isAuthPage && user && (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-xs text-txt-muted">
                  Hi, <span className="font-semibold text-txt-main">{user.name}</span> ({user.role})
                </span>
                <button 
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 border border-border-main hover:border-primary-gold hover:text-primary-gold rounded-btn text-xs font-semibold tracking-wide uppercase transition duration-300 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {!isAuthPage && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Content */}
      {!isAuthPage && (
        <aside className={`fixed inset-y-0 left-0 w-64 bg-bg-card border-r border-border-main z-50 p-6 flex flex-col justify-between md:hidden transition-transform duration-300 ease-in-out transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div>
            {/* Sidebar Header */}
            <div className="flex justify-between items-center mb-8 border-b border-border-main pb-4">
              <span className="font-display italic text-lg font-bold text-primary-gold">
                💎 HB JEWELRY
              </span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-btn hover:bg-bg-main transition border border-border-main text-txt-muted hover:text-primary-gold cursor-pointer"
                aria-label="Close Sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar Links */}
            <nav className="flex flex-col space-y-4">
              <a 
                href="/" 
                className={`px-4 py-3 rounded-btn transition-colors text-sm font-semibold flex items-center gap-3
                  ${pathname === '/' ? 'bg-primary-gold/10 text-primary-gold font-bold' : 'text-txt-main hover:bg-bg-main'}`}
              >
                <span>📥</span> Upload PO
              </a>
              <a 
                href="/dashboard" 
                className={`px-4 py-3 rounded-btn transition-colors text-sm font-semibold flex items-center gap-3
                  ${pathname.startsWith('/dashboard') ? 'bg-primary-gold/10 text-primary-gold font-bold' : 'text-txt-main hover:bg-bg-main'}`}
              >
                <span>📋</span> Dashboard
              </a>
            </nav>
          </div>

          {/* Sidebar Footer */}
          {user && (
            <div className="border-t border-border-main pt-6">
              <div className="mb-4">
                <p className="text-xs text-txt-muted">Logged in as</p>
                <p className="text-sm font-semibold text-txt-main mt-0.5">{user.name}</p>
                <p className="text-[10px] text-txt-muted uppercase tracking-wider mt-0.5">{user.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 bg-error-red/10 hover:bg-error-red/20 text-error-red border border-error-red/20 rounded-btn text-xs font-semibold tracking-wider uppercase transition duration-300 cursor-pointer text-center"
              >
                Logout
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-border-main bg-bg-card transition-colors duration-300 py-6 mt-12 text-center text-xs text-txt-muted">
        <p className="font-display italic text-sm text-primary-gold mb-1">Heather Benjamin Jewelry</p>
        <p>&copy; {new Date().getFullYear()} Heather Benjamin Jewelry. All rights reserved.</p>
      </footer>
    </div>
  );
}
