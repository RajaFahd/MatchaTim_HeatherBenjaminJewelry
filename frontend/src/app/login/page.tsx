'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token and user details to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Force page reload to trigger root wrappers
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center py-20">
      <div className="w-full max-w-md bg-bg-card border border-border-main rounded-card p-8 shadow-sm transition-colors duration-300">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-display text-txt-main">Portal Sign In</h1>
          <p className="text-txt-muted text-xs uppercase tracking-wider mt-1.5">Enter details to access portal</p>
        </div>

        {error && (
          <div className="bg-error-red/10 border border-error-red/30 text-error-red text-sm rounded-btn p-3 mb-6 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-txt-muted text-xs uppercase tracking-wider block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 border border-border-main rounded-btn bg-bg-main px-3 text-sm text-txt-main focus:border-primary-gold focus:outline-none transition"
              placeholder="manager@heatherbenjamin.com"
            />
          </div>

          <div>
            <label className="text-txt-muted text-xs uppercase tracking-wider block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 border border-border-main rounded-btn bg-bg-main px-3 text-sm text-txt-main focus:border-primary-gold focus:outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wide uppercase transition duration-300 disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-txt-muted">
          <span>Don't have an account? </span>
          <a href="/register" className="text-primary-gold hover:underline font-semibold transition">
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
