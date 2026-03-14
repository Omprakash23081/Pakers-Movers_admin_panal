"use client";

import React, { useState, useEffect } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import {
  Users,
  Loader2,
  MapPin,
  Calendar,
  Search,
  Mail,
  Phone,
  CheckCircle2,
  User as UserIcon,
  X,
  Clock,
  History as HistoryIcon,
  Package,
  ArrowRight,
  Truck
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { useRouter } from 'next/navigation';

export default function ManagementPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientHistory, setClientHistory] = useState<{ quotes: any[], shipments: any[] }>({ quotes: [], shipments: [] });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'shipped'>('active');
  const router = useRouter();

  useEffect(() => {
    fetchConvertedLeads();
  }, []);

  const fetchConvertedLeads = async () => {
    try {
      setLoading(true);
      const resp = await adminApi.getConvertedQuotes();
      console.log("Management API Response:", resp);

      if (resp.success) {
        setLeads(resp.data || []);
      } else {
        console.error("API returned success:false", resp);
        if (resp.message?.toLowerCase().includes('token')) {
          window.location.href = '/login';
        }
      }
    } catch (err) {
      console.error("Failed to fetch leads", err);
      alert("Error loading data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientHistory = async (client: any) => {
    try {
      // For now, we fetch all and filter client-side. 
      // In a larger app, we'd have a specific backend endpoint for this.
      const [quotesResp, shipmentsResp] = await Promise.all([
        adminApi.getQuotes(),
        adminApi.getShipments()
      ]);

      const filteredQuotes = quotesResp.success
        ? quotesResp.data.filter((q: any) => q.phone === client.phone || q.email === client.email)
        : [];

      const filteredShipments = shipmentsResp.success
        ? shipmentsResp.data.filter((s: any) => s.customerPhone === client.phone)
        : [];

      setClientHistory({ quotes: filteredQuotes, shipments: filteredShipments });
      setSelectedClient(client);
      setIsHistoryOpen(true);
    } catch (err) {
      console.error("Failed to fetch client history", err);
    }
  };

  // Derived state for deduplicated clients - each unique phone number is one client
  const categorizedClients = React.useMemo(() => {
    const activeMap = new Map();
    const shippedMap = new Map();

    // Sort leads by date descending
    const sortedLeads = [...leads].sort((a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );

    sortedLeads.forEach(lead => {
      const phone = lead.phone;
      if (!phone) return;

      const status = lead.status?.toLowerCase();
      // If we already have this phone in shippedMap, it's a shipped client.
      // We want to skip older records for this client.
      if (shippedMap.has(phone) || activeMap.has(phone)) return;

      if (status === 'shipped') {
        shippedMap.set(phone, lead);
      } else if (status === 'converted') {
        activeMap.set(phone, lead);
      }
    });

    console.log("Categorized Clients:", { active: activeMap.size, shipped: shippedMap.size });

    return {
      active: Array.from(activeMap.values()),
      shipped: Array.from(shippedMap.values())
    };
  }, [leads]);

  const displayLeads = activeTab === 'active' ? categorizedClients.active : categorizedClients.shipped;

  const filteredLeads = displayLeads.filter(l =>
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShipClient = (lead: any) => {
    const prefill = encodeURIComponent(JSON.stringify({
      id: lead._id,
      customerName: `${lead.firstName} ${lead.lastName}`,
      customerPhone: lead.phone,
      origin: lead.movingFrom,
      destination: lead.movingTo
    }));
    router.push(`/shipments?prefill=${prefill}`);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Client Management</h1>
            <p className="text-secondary mt-1">
              {activeTab === 'active'
                ? 'Review successfully converted leads ready for shipment.'
                : 'History of clients whose shipments have been initiated.'}
            </p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
            >
              Active Leads ({categorizedClients.active.length})
            </button>
            <button
              onClick={() => setActiveTab('shipped')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'shipped' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
            >
              Shipped/History ({categorizedClients.shipped.length})
            </button>
          </div>
        </div>

        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={activeTab === 'active' ? "Search active leads..." : "Search history..."}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="apple-card overflow-hidden border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Route</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Converted On</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/20">
                            {lead.firstName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-base">{lead.firstName} {lead.lastName}</p>
                            <div className="flex flex-col gap-1 mt-1 text-xs text-secondary opacity-60 group-hover:opacity-100 transition-opacity">
                              <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {lead.email}</span>
                              <span className="flex items-center gap-1.5 font-bold text-primary"><Phone className="w-3 h-3" /> {lead.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="font-medium text-white text-sm">{lead.serviceType}</p>
                      </td>
                      <td className="px-6 py-6 text-sm text-secondary font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          {lead.movingFrom} → {lead.movingTo}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm text-secondary font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {new Date(lead.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${lead.status === 'shipped'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                          {lead.status === 'shipped' ? <Package className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {lead.status === 'shipped' ? 'Shipped' : 'Converted'}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === 'active' && (
                            <button
                              onClick={() => handleShipClient(lead)}
                              className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20 flex items-center gap-2 text-xs font-bold"
                              title="Start Shipment"
                            >
                              <Truck className="w-4 h-4" />
                              Ship
                            </button>
                          )}
                          <button
                            onClick={() => fetchClientHistory(lead)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white transition-all border border-white/5 flex items-center gap-2 text-xs font-bold"
                            title="View Records"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-secondary">
                        <Users className="w-12 h-12 opacity-20" />
                        <p className="text-lg font-medium opacity-60">No converted clients found yet.</p>
                        <p className="text-sm opacity-40 max-w-xs mx-auto">When you update an inquiry status to "Converted" in the Quote Requests section, they will appear here automatically.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client History Slide-over */}
        {isHistoryOpen && selectedClient && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-[#0B1120] border-l border-white/10 h-full overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl">
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20">
                      {selectedClient.firstName?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{selectedClient.firstName} {selectedClient.lastName}</h2>
                      <p className="text-secondary opacity-60 text-sm">{selectedClient.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-secondary hover:text-white transition-all border border-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Quotes</p>
                    <p className="text-2xl font-black text-white">{clientHistory.quotes.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Shipments</p>
                    <p className="text-2xl font-black text-primary">{clientHistory.shipments.length}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5 text-primary" />
                    Activity History
                  </h3>

                  <div className="space-y-4">
                    {(() => {
                      const historyItems = [
                        ...clientHistory.quotes.map(q => ({ ...q, type: 'quote' })),
                        ...clientHistory.shipments.map(s => ({ ...s, type: 'shipment' }))
                      ].sort((a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime());

                      // Deduplicate identical quotes
                      const uniqueHistory: any[] = [];
                      const seenQuotes = new Set();

                      historyItems.forEach(item => {
                        if (item.type === 'quote') {
                          const key = `${item.serviceType}-${item.movingFrom}-${item.movingTo}`;
                          if (!seenQuotes.has(key)) {
                            seenQuotes.add(key);
                            uniqueHistory.push(item);
                          }
                        } else {
                          uniqueHistory.push(item);
                        }
                      });

                      return uniqueHistory.map((item: any, idx) => (
                        <div key={idx} className="apple-card p-5 border-white/5 hover:border-white/10 transition-all bg-white/[0.01]">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${item.type === 'quote' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                              {item.type}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-secondary opacity-60">
                                {new Date(item.createdAt || item.updatedAt).toLocaleDateString()}
                              </span>
                              {item.type === 'quote' && (
                                <button
                                  onClick={() => handleShipClient(item)}
                                  className="p-1 px-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black uppercase flex items-center gap-1 border border-primary/20 transition-all"
                                  title="Ship this specific request"
                                >
                                  <Truck className="w-2.5 h-2.5" />
                                  Ship
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-bold text-white">{item.type === 'quote' ? item.serviceType : `Shipment: ${item.trackingId}`}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-secondary opacity-80 font-medium">
                            <MapPin className="w-3 h-3 text-primary" />
                            {item.movingFrom || item.origin} → {item.movingTo || item.destination}
                          </div>
                          {item.type === 'shipment' && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-[9px] font-bold uppercase text-primary tracking-wider">Status: {item.currentStatus}</span>
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                    {clientHistory.quotes.length === 0 && clientHistory.shipments.length === 0 && (
                      <p className="text-center py-10 text-secondary opacity-40 text-sm italic">No history records found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminWrapper>
  );
}
