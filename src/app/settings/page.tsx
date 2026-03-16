"use client";

import React, { useState } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { adminApi } from '@/services/adminApi';
import { 
  Settings, 
  Lock, 
  ShieldCheck, 
  Save, 
  Loader2,
  AlertCircle,
  Package
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.success || res.message === 'Password updated successfully') {
        setSuccess(true);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(res.message || "Failed to update password. Incorrect current password?");
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminWrapper>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
          <p className="text-secondary mt-1">Configure your administrative preferences and security.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Security Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">Security & Password</h2>
            </div>
            
            <div className="apple-card p-8 border-white/10">
              <form onSubmit={handlePasswordChange} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex gap-3">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    Password updated successfully!
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">Current Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">New Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* System Info Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">System Information</h2>
            </div>
            
            <div className="apple-card p-8 border-white/10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">Sunita Cargo Packers Movers Admin Portal</p>
                  <p className="text-sm text-secondary">Version 1.0.1 (Production)</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <svg viewBox="0 0 40 40" className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 18H3M21 18h-2M5 22H3M21 22h-2m1 1h4l3 7h-11l1-3m1-4l1-3h4l2 5m-7-5v-1a2 2 0 012-2h1a2 2 0 012 2v1m-6 1h6" />
                    <rect x="7" y="15" width="12" height="10" rx="1" />
                    <circle cx="10" cy="30" r="3" />
                    <circle cx="16" cy="30" r="3" />
                  </svg>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Environment</span>
                  <span className="text-white font-medium">Production</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Database Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">API Latency</span>
                  <span className="text-white font-medium">24ms</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-secondary leading-relaxed">
                  <strong>Note:</strong> Most system configurations are managed via environment variables. For deep changes, contact the system developer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminWrapper>
  );
}
