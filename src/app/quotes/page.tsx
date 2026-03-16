"use client";

import React, { useState, useEffect } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Truck,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/services/adminApi';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const resp = await adminApi.getQuotes();
      if (resp.success) {
        setQuotes(resp.data);
      } else {
        if (resp.message?.includes('token') || resp.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
        }
        console.error("Fetch failed:", resp.message);
      }
    } catch (err) {
      console.error("Failed to fetch quotes", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const resp = await adminApi.updateQuoteStatus(id, status);
      if (resp.success) {
        setQuotes(quotes.map(q => q._id === id ? resp.data : q));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const deleteQuote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const resp = await adminApi.deleteQuote(id);
      if (resp.success) {
        setQuotes(quotes.filter(q => q._id !== id));
      }
    } catch (err) {
      alert("Failed to delete quote");
    }
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = 
      `${q.firstName} ${q.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}`, '_blank');
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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Quote Requests</h1>
            <p className="text-secondary mt-1">Review and manage incoming customer inquiries.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search quotes by name, phone, email or service..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white min-w-[160px]">
            <Filter className="w-4 h-4 text-primary" />
            <select 
              className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all" className="bg-[#0B1120]">All Status</option>
              <option value="pending" className="bg-[#0B1120]">Pending</option>
              <option value="contacted" className="bg-[#0B1120]">Contacted</option>
              <option value="converted" className="bg-[#0B1120]">Approved</option>
              <option value="cancelled" className="bg-[#0B1120]">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Mobile View: Card Layout */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredQuotes.length > 0 ? (
            filteredQuotes.map((quote) => (
              <div key={quote._id} className="apple-card p-5 border-white/10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                      {quote.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight">{(quote.firstName + ' ' + quote.lastName).replace(/\s+Customer$/i, '')}</p>
                      <p className="text-xs text-primary font-bold">{quote.phone}</p>
                    </div>
                  </div>
                  <div className="relative flex flex-col items-end gap-1.5 min-w-[80px]">
                    <span className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border shadow-sm transition-all active:scale-95
                      ${quote.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                        quote.status === 'converted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        quote.status === 'contacted' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-white/5 text-secondary border-white/10'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse
                        ${quote.status === 'pending' ? 'bg-yellow-500' : 
                          quote.status === 'converted' ? 'bg-emerald-500' : 
                          quote.status === 'contacted' ? 'bg-blue-500' : 'bg-secondary'}`} />
                      {quote.status === 'converted' ? 'Approved' : quote.status}
                    </span>
                    <select 
                      value={quote.status} 
                      onChange={(e) => updateStatus(quote._id, e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    >
                      <option value="pending" className="bg-[#0B1120] text-white">Pending</option>
                      <option value="contacted" className="bg-[#0B1120] text-white">Contacted</option>
                      <option value="converted" className="bg-[#0B1120] text-white">Approved</option>
                      <option value="cancelled" className="bg-[#0B1120] text-white">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 py-2 border-y border-white/5">
                  <div className="flex items-center justify-between transition-all">
                    <div className="flex items-center gap-2 text-xs text-secondary font-medium">
                      <Truck className="w-3.5 h-3.5 text-primary" />
                      {quote.serviceType}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground italic font-medium">
                      <Calendar className="w-3 h-3" />
                      {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} | {new Date(quote.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary font-medium">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {quote.movingFrom} → {quote.movingTo}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex gap-2">
                    <a href={`tel:${quote.phone}`} className="p-2.5 rounded-xl bg-white/5 text-primary border border-white/10">
                      <Phone className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleWhatsApp(quote.phone)} className="p-2.5 rounded-xl bg-white/5 text-emerald-400 border border-white/10">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {quote.status === 'converted' && (
                      <button 
                        onClick={() => {
                          const prefillData = encodeURIComponent(JSON.stringify({
                            customerName: `${quote.firstName} ${quote.lastName}`,
                            customerPhone: quote.phone,
                            origin: quote.movingFrom,
                            destination: quote.movingTo
                          }));
                          router.push(`/shipments?prefill=${prefillData}`);
                        }}
                        className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20"
                      >
                        <Truck className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={() => deleteQuote(quote._id)} className="p-2.5 rounded-xl bg-white/5 text-red-500 border border-white/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-secondary apple-card border-white/10">No matching inquiries found.</div>
          )}
        </div>

        {/* Desktop View: Table Layout */}
        <div className="apple-card overflow-hidden border-white/10 hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Route</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredQuotes.length > 0 ? (
                  filteredQuotes.map((quote) => (
                    <tr key={quote._id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                            {quote.firstName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-base">{(quote.firstName + ' ' + (quote.lastName || '')).replace(/\s+Customer$/i, '')}</p>
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="flex items-center gap-2 opacity-60 text-[10px] uppercase font-bold tracking-widest text-secondary group-hover:opacity-100 transition-opacity">
                                <Mail className="w-3 h-3" /> {quote.email}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-primary group-hover:text-primary transition-colors">
                                <Phone className="w-3.5 h-3.5" /> {quote.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1">
                          <p className="font-medium text-white text-sm">{quote.serviceType}</p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                            <Calendar className="w-3 h-3" /> {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} | {new Date(quote.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm text-secondary font-medium">
                          <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {quote.movingFrom} → {quote.movingTo}
                          </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="relative inline-block group/status">
                          <div className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm transition-all duration-300 group-hover/status:scale-105
                            ${quote.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-yellow-500/5' : 
                              quote.status === 'converted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5' : 
                              quote.status === 'contacted' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5' :
                              'bg-white/5 text-secondary border-white/10'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse
                              ${quote.status === 'pending' ? 'bg-yellow-500' : 
                                quote.status === 'converted' ? 'bg-emerald-500' : 
                                quote.status === 'contacted' ? 'bg-blue-500' : 'bg-secondary'}`} />
                            {quote.status === 'converted' ? 'Approved' : quote.status}
                          </div>
                          <select 
                            value={quote.status} 
                            onChange={(e) => updateStatus(quote._id, e.target.value)}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                          >
                            <option value="pending" className="bg-[#0B1120] text-white">Pending</option>
                            <option value="contacted" className="bg-[#0B1120] text-white">Contacted</option>
                            <option value="converted" className="bg-[#0B1120] text-white">Approved</option>
                            <option value="cancelled" className="bg-[#0B1120] text-white">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={`tel:${quote.phone}`}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/30 group/btn"
                            title="Call Customer"
                          >
                            <Phone className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </a>
                          <button 
                            onClick={() => handleWhatsApp(quote.phone)}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/30 group/btn"
                            title="WhatsApp Customer"
                          >
                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                          </button>
                          {quote.status === 'converted' && (
                            <button 
                              onClick={() => {
                                const prefillData = encodeURIComponent(JSON.stringify({
                                  customerName: `${quote.firstName} ${quote.lastName}`,
                                  customerPhone: quote.phone,
                                  origin: quote.movingFrom,
                                  destination: quote.movingTo
                                }));
                                router.push(`/shipments?prefill=${prefillData}`);
                              }}
                              className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/10 hover:border-primary/30 group/btn"
                              title="Create Shipment"
                            >
                              <Truck className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteQuote(quote._id)}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all border border-transparent hover:border-red-500/30 group/btn"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-secondary">No matching inquiries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminWrapper>
  );
}
