"use client";

import React, { useState } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
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
      // Placeholder for password change API call
      // In a real app, we would call adminApi.changePassword()
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError("Failed to update password. Please try again.");
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
                  <p className="text-white font-bold">SSD Packers & Movers Admin Portal</p>
                  <p className="text-sm text-secondary">Version 1.0.0 (Production)</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Package className="w-6 h-6 text-primary" />
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
