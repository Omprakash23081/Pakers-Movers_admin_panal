"use client";

import React, { useState, useEffect } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { 
  FileText, 
  Truck, 
  TrendingUp, 
  Users, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  Package,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/services/adminApi';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        if (data.success) {
          setStats(data);
        } else {
          if (data.message?.includes('token') || data.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
          }
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Quotes', value: stats?.stats?.totalQuotes || '0', icon: FileText, change: 'Lifetime', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Active Shipments', value: stats?.stats?.activeShipments || '0', icon: Truck, change: 'Ongoing', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { name: 'Resolved', value: (stats?.stats?.statusBreakdown?.find((s:any) => s._id === 'converted')?.count || 0) + (stats?.stats?.statusBreakdown?.find((s:any) => s._id === 'resolved')?.count || 0), icon: TrendingUp, change: 'Total', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { name: 'Delivered', value: stats?.stats?.deliveredShipments || '0', icon: CheckCircle2, change: 'Completed', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const getPercentage = (value: number, total: number) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <AdminWrapper>
        <div className="h-96 flex items-center justify-center text-primary">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      </AdminWrapper>
    );
  }

  return (
    <AdminWrapper>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
            <p className="text-secondary mt-1">Manage Sunita Cargo Packers Movers operations efficiently.</p>
          </div>
          <Link href="/quotes" className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Manage Requests
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="apple-card p-6 border-white/10 group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-blue-400/10 text-blue-400 border border-current/10 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-secondary">Total Quotes</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats?.stats?.totalQuotes || 0}</h3>
            </div>
          </div>
          
          <div className="apple-card p-6 border-white/10 group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-orange-400/10 text-orange-400 border border-current/10 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-secondary">Active Shipments</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats?.stats?.activeShipments || 0}</h3>
            </div>
          </div>

          <div className="apple-card p-6 border-white/10 group">
            <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-emerald-400/10 text-emerald-400 border border-current/10 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                </div>
            </div>
            <div className="mt-6">
                <p className="text-sm font-medium text-secondary">Delivered</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats?.stats?.deliveredShipments || 0}</h3>
            </div>
          </div>

          <div className="apple-card p-6 border-white/10 group">
            <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-purple-400/10 text-purple-400 border border-current/10 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                </div>
            </div>
            <div className="mt-6">
                <p className="text-sm font-medium text-secondary">Admin Users</p>
                <h3 className="text-2xl font-bold text-white mt-1">1</h3>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Distribution */}
          <div className="apple-card p-8 border-white/10 relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-6">Service Distribution</h2>
              <div className="space-y-5">
                {stats?.stats?.serviceDistribution?.map((item: any) => (
                  <div key={item._id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-secondary font-medium capitalize">{item._id || 'Standard'}</span>
                      <span className="text-white font-bold">{item.count} ({getPercentage(item.count, stats.stats.totalQuotes)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-primary/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-out"
                        style={{ width: `${getPercentage(item.count, stats.stats.totalQuotes)}%` }}
                      />
                    </div>
                  </div>
                )) || <p className="text-secondary text-center py-4">No data available</p>}
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <TrendingUp size={120} className="text-primary" />
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="apple-card p-8 border-white/10 relative overflow-hidden group">
            <div className="relative z-10 text-center">
              <h2 className="text-xl font-bold text-white mb-6 text-left">Conversion Funnel</h2>
              <div className="flex flex-col items-center gap-2">
                {[
                  { label: 'Total Inquiries', count: stats?.stats?.totalQuotes, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                  { label: 'Approved', count: stats?.stats?.statusBreakdown?.find((s:any) => s._id === 'converted')?.count || 0, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                  { label: 'Shipments', count: (stats?.stats?.activeShipments || 0) + (stats?.stats?.deliveredShipments || 0), color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
                ].map((step, idx) => (
                  <React.Fragment key={step.label}>
                    <div 
                      className={`w-full max-w-sm p-4 rounded-2xl border ${step.color} flex justify-between items-center transform transition-transform hover:scale-[1.02]`}
                      style={{ scale: `${1 - idx * 0.05}` }}
                    >
                      <span className="font-bold text-sm tracking-tight">{step.label}</span>
                      <span className="text-xl font-black">{step.count}</span>
                    </div>
                    {idx < 2 && (
                      <div className="w-px h-6 bg-gradient-to-b from-white/10 to-transparent" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Quotes Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Latest Inquiries
              </h2>
              <Link href="/quotes" className="text-sm text-primary hover:text-white flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="apple-card overflow-hidden border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Service</th>
                      <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-secondary uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats?.recentQuotes?.length > 0 ? (
                      stats.recentQuotes.map((quote: any) => (
                        <tr key={quote._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-white font-medium text-sm">{quote.firstName} {quote.lastName}</p>
                            <p className="text-[10px] text-muted-foreground">{quote.phone}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-secondary">{quote.serviceType}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border 
                              ${quote.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                quote.status === 'converted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                              {quote.status === 'converted' ? 'Approved' : quote.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-muted-foreground font-medium whitespace-nowrap">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-secondary">No inquiries yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Stats/Health Card */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white px-2">System Health</h2>
            <div className="apple-card p-6 border-white/10 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Backend API</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary w-[98%] h-full rounded-full" />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 relative overflow-hidden group">
                  <h3 className="font-bold text-white mb-2">Pro Tip</h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Dynamic dashboard is active. All data shown is real-time from the database.
                  </p>
                  <div className="mt-4 flex items-center text-xs font-bold text-primary uppercase tracking-widest gap-1 cursor-pointer hover:text-white transition-colors">
                    Manage Shipments <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminWrapper>
  );
}
