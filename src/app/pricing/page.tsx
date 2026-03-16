"use client";

import React, { useState, useEffect } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Truck,
  Home,
  Building2,
  Car,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';

const categories = [
  { id: 'house', label: 'House Shifting', icon: <Home size={18} /> },
  { id: 'office', label: 'Office Relocation', icon: <Building2 size={18} /> },
  { id: 'vehicle', label: 'Car & Bike', icon: <Car size={18} /> }
];

export default function PricingManagement() {
  const [pricing, setPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // Category being saved
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [expandedTiers, setExpandedTiers] = useState<{ [key: string]: number[] }>({});

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const resp = await adminApi.getPricing();
      if (Array.isArray(resp)) {
        // Ensure all categories exist in the local state
        const localPricing = categories.map(cat => {
          const cloudData = resp.find(p => p.category === cat.id);
          return cloudData || { category: cat.id, tiers: [] };
        });
        setPricing(localPricing);
        
        // Auto-expand the first tier of 'house' category by default on mobile
        const initialExpanded: { [key: string]: number[] } = {};
        const houseCategory = localPricing.find(p => p.category === 'house');
        if (houseCategory && houseCategory.tiers && houseCategory.tiers.length > 0) {
          initialExpanded['house'] = [0];
        }
        setExpandedTiers(initialExpanded);
      }
    } catch (err) {
      console.error("Failed to fetch pricing", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTier = (catId: string, tierIndex: number, field: string, value: string, subField?: string) => {
    setPricing(prevPricing => {
      return prevPricing.map(p => {
        if (p.category !== catId) return p;

        const newTiers = [...p.tiers];
        const newTier = { ...newTiers[tierIndex] };

        if (subField) {
          newTier.costs = { ...newTier.costs, [subField]: value };
        } else {
          newTier[field] = value;
        }

        newTiers[tierIndex] = newTier;
        return { ...p, tiers: newTiers };
      });
    });
  };

  const handleAddTier = (catId: string) => {
    setPricing(prevPricing => {
      return prevPricing.map(p => {
        if (p.category !== catId) return p;
        return {
          ...p,
          tiers: [
            ...p.tiers,
            { 
              type: 'New Tier', 
              costs: { 
                upTo50km: '₹0', 
                upTo500km: '₹0', 
                upTo1000km: '₹0', 
                upTo1500km: '₹0', 
                upTo2500km: '₹0' 
              } 
            }
          ]
        };
      });
    });
  };

  const handleRemoveTier = (catId: string, tierIndex: number) => {
    setPricing(prevPricing => {
      return prevPricing.map(p => {
        if (p.category !== catId) return p;
        const newTiers = p.tiers.filter((_: any, idx: number) => idx !== tierIndex);
        return { ...p, tiers: newTiers };
      });
    });
  };

  const handleSaveCategory = async (catId: string) => {
    const categoryData = pricing.find(p => p.category === catId);
    if (!categoryData) return;

    setSaving(catId);
    setMessage(null);
    try {
      const resp = await adminApi.updatePricing(catId, categoryData.tiers);
      if (resp._id) {
        setMessage({ type: 'success', text: `${categories.find(c => c.id === catId)?.label} updated successfully!` });
      } else {
        setMessage({ type: 'error', text: 'Failed to update pricing.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSeed = async () => {
    if (!confirm("This will reset all pricing to default values. Continue?")) return;
    setLoading(true);
    try {
      await adminApi.seedPricing();
      await fetchPricing();
      setMessage({ type: 'success', text: 'Pricing reset to defaults.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reset pricing.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
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
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Pricing Management</h1>
            <p className="text-secondary mt-2 text-lg">Update all service rates in one place with the table template.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSeed}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All to Defaults
            </button>
          </div>
        </div>

        {message && (
          <div className={`fixed top-8 right-8 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        <div className="space-y-16">
          {categories.map((category) => {
            const data = pricing.find(p => p.category === category.id) || { tiers: [] };
            return (
              <div key={category.id} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{category.label}</h2>
                      <p className="text-xs text-secondary font-bold tracking-widest uppercase mt-0.5">Edit relocation table tiers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAddTier(category.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-sm font-bold"
                    >
                      <Plus className="w-4 h-4" />
                      Add Row
                    </button>
                    <button
                      onClick={() => handleSaveCategory(category.id)}
                      disabled={saving === category.id}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all font-bold disabled:opacity-50"
                    >
                      {saving === category.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Update {category.label} Prices
                    </button>
                  </div>
                </div>

                {/* Mobile View: Accordion-style Card Layout */}
                <div className="md:hidden space-y-3 -mx-4">
                  {data.tiers.map((tier: any, idx: number) => {
                    const isExpanded = expandedTiers[category.id]?.includes(idx);
                    const toggleExpand = () => {
                      setExpandedTiers(prev => {
                        const current = prev[category.id] || [];
                        const next = current.includes(idx) 
                          ? current.filter(i => i !== idx)
                          : [...current, idx];
                        return { ...prev, [category.id]: next };
                      });
                    };

                    return (
                      <div key={idx} className={`apple-card overflow-hidden border-white/10 mx-4 transition-all duration-300 ${isExpanded ? 'bg-white/5 ring-1 ring-primary/30' : 'bg-white/[0.02]'}`}>
                        {/* Accordion Header */}
                        <div 
                          onClick={toggleExpand}
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${isExpanded ? 'bg-primary text-white' : 'bg-white/5 text-primary'}`}>
                              {idx + 1}
                            </div>
                            <span className="font-bold text-white">{tier.type || 'Unnamed Tier'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTier(category.id, idx);
                              }}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              <Truck className={`w-5 h-5 text-primary ${isExpanded ? 'hidden' : 'block'}`} />
                              <RotateCcw className={`w-5 h-5 text-primary ${isExpanded ? 'block' : 'hidden'} rotate-45`} />
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 border-t border-white/10' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                          <div className="p-5 space-y-5">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Tier Name</label>
                              <input
                                type="text"
                                value={tier.type}
                                onChange={(e) => handleUpdateTier(category.id, idx, 'type', e.target.value)}
                                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none text-base font-bold transition-all"
                                placeholder="e.g. 1BHK / Small Office"
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-2">
                              {[
                                { id: 'upTo50km', label: 'Up to 50 KM' },
                                { id: 'upTo500km', label: 'Up to 500 KM' },
                                { id: 'upTo1000km', label: 'Up to 1000 KM' },
                                { id: 'upTo1500km', label: 'Up to 1500 KM' },
                                { id: 'upTo2500km', label: 'Up to 2500 KM' }
                              ].map((dist) => (
                                <div key={dist.id} className="relative group">
                                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-primary/80 tracking-widest pointer-events-none">
                                    {dist.label}
                                  </div>
                                  <input
                                    type="text"
                                    value={tier.costs[dist.id]}
                                    onChange={(e) => handleUpdateTier(category.id, idx, 'costs', e.target.value, dist.id)}
                                    className="w-full bg-[#0B1120]/80 border border-white/20 rounded-xl pl-28 pr-4 py-4 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono text-base transition-all text-right shadow-lg"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {data.tiers.length === 0 && (
                    <div className="p-10 text-center mx-4 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                      <p className="text-secondary font-bold">No tiers defined.</p>
                      <button
                        onClick={() => handleAddTier(category.id)}
                        className="mt-4 px-6 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl text-sm font-bold transition-all"
                      >
                        Add First Row
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop View: Horizontal Table */}
                <div className="hidden md:block overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.01]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="sticky left-0 z-20 bg-[#0c0c0c] px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-primary/60 border-b border-white/10 min-w-[180px]">Shifting Type</th>
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-secondary border-b border-white/10 whitespace-nowrap">Up to 50 KM</th>
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-secondary border-b border-white/10 whitespace-nowrap">Up to 500 KM</th>
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-secondary border-b border-white/10 whitespace-nowrap">Up to 1000 KM</th>
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-secondary border-b border-white/10 whitespace-nowrap">Up to 1500 KM</th>
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-secondary border-b border-white/10 whitespace-nowrap">Within 2500 KM</th>
                        <th className="px-6 py-4 border-b border-white/10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.tiers.map((tier: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="sticky left-0 z-10 bg-[#0c0c0c]/95 backdrop-blur-sm px-4 py-3 min-w-[180px] border-r border-white/5">
                            <input
                              type="text"
                              value={tier.type}
                              onChange={(e) => handleUpdateTier(category.id, idx, 'type', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-xs"
                            />
                          </td>
                          {['upTo50km', 'upTo500km', 'upTo1000km', 'upTo1500km', 'upTo2500km'].map((dist) => (
                            <td key={dist} className="px-2 py-3 min-w-[140px]">
                              <input
                                type="text"
                                value={tier.costs[dist]}
                                onChange={(e) => handleUpdateTier(category.id, idx, 'costs', e.target.value, dist)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-[10px]"
                              />
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRemoveTier(category.id, idx)}
                              className="p-1.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Remove Row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {data.tiers.length === 0 && (
                    <div className="text-center py-20 bg-white/[0.01]">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <Plus className="w-8 h-8 text-secondary" />
                      </div>
                      <p className="text-secondary font-bold text-lg">No tiers defined for {category.label}.</p>
                      <button
                        onClick={() => handleAddTier(category.id)}
                        className="mt-6 px-8 py-3 bg-primary rounded-2xl text-white font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                      >
                        Add First Row
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminWrapper>
  );
}
