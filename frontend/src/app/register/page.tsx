'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center py-16">
      <div className="w-full max-w-md bg-bg-card border border-border-main rounded-card p-8 shadow-sm transition-colors duration-300">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-display text-txt-main">Create Account</h1>
          <p className="text-txt-muted text-xs uppercase tracking-wider mt-1.5">Join Heather Benjamin Portal</p>
        </div>

        {error && (
          <div className="bg-error-red/10 border border-error-red/30 text-error-red text-sm rounded-btn p-3 mb-6 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-txt-muted text-xs uppercase tracking-wider block mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 border border-border-main rounded-btn bg-bg-main px-3 text-sm text-txt-main focus:border-primary-gold focus:outline-none transition"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="text-txt-muted text-xs uppercase tracking-wider block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 border border-border-main rounded-btn bg-bg-main px-3 text-sm text-txt-main focus:border-primary-gold focus:outline-none transition"
              placeholder="e.g. manager@heatherbenjamin.com"
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

          <div>
            <label className="text-txt-muted text-xs uppercase tracking-wider block mb-1.5">Role / Position</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 border border-border-main rounded-btn bg-bg-main px-3 text-sm text-txt-main focus:border-primary-gold focus:outline-none transition appearance-none"
            >
              <option value="manager">Operations Manager</option>
              <option value="artisan">Bali Artisan Partner</option>
              <option value="fulfillment">Fulfillment / Packing Team</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wide uppercase transition duration-300 disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-txt-muted">
          <span>Already have an account? </span>
          <a href="/login" className="text-primary-gold hover:underline font-semibold transition">
            Login
          </a>
        </div>
      </div>
    </main>
  );
}
