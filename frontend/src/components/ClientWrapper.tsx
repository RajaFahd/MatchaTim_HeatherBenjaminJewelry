'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);
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
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const savedToken = localStorage.getItem('token');
    
    if (!savedToken && !isAuthPage) {
      window.location.href = '/login';
    } else if (savedToken && isAuthPage) {
      window.location.href = '/';
    }
  }, [pathname, mounted]);

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

  const isAuthPage = pathname === '/login' || pathname === '/register';

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
          {/* Logo */}
          <a href="/" className="font-display italic text-xl font-bold tracking-wide text-primary-gold hover:opacity-85 transition">
            💎 HEATHER BENJAMIN
          </a>

          {/* Navigation Links (only for logged-in pages) */}
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
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-bg-card transition border border-border-main text-txt-muted hover:text-primary-gold"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {!isAuthPage && user && (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-txt-muted">
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
