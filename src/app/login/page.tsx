"use client";

import React, { useState } from 'react';
import { Package, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        router.push('/');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Failed to connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md z-10">
        <div className="glass-panel apple-card p-8 lg:p-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 mb-4 shadow-lg shadow-primary/20">
              <svg viewBox="0 0 40 40" className="w-10 h-10 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 18H3M21 18h-2M5 22H3M21 22h-2m1 1h4l3 7h-11l1-3m1-4l1-3h4l2 5m-7-5v-1a2 2 0 012-2h1a2 2 0 012 2v1m-6 1h6" />
                <rect x="7" y="15" width="12" height="10" rx="1" />
                <circle cx="10" cy="30" r="3" />
                <circle cx="16" cy="30" r="3" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-secondary mt-1">Sunita Cargo Packers Movers</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary ml-1">Username</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="admin_username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
