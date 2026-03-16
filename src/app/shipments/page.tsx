"use client";

import React, { useState, useEffect, Suspense } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { 
  Package, 
  MapPin, 
  Plus, 
  Edit3, 
  History,
  Loader2,
  X,
  Truck,
  CheckCircle2,
  Trash2,
  Phone
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { useSearchParams } from 'next/navigation';

function ShipmentsContent() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Form states for new shipment
  const [newShipment, setNewShipment] = useState({
    trackingId: '',
    customerName: '',
    customerPhone: '',
    origin: '',
    destination: '',
    estimatedDelivery: '',
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    locationLink: ''
  });

  // Form states for update
  const [updateData, setUpdateData] = useState({
    location: '',
    status: '',
    currentStatus: '',
    locationLink: ''
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    fetchShipments();
    const prefill = searchParams.get('prefill');
    if (prefill) {
      try {
        const data = JSON.parse(decodeURIComponent(prefill));
        setNewShipment(prev => ({
          ...prev,
          customerName: data.customerName || '',
          customerPhone: data.customerPhone || '',
          origin: data.origin || '',
          destination: data.destination || '',
          trackingId: `RP-${Math.floor(1000 + Math.random() * 9000)}` // Auto-generate a temp ID
        }));
        setIsModalOpen(true);
      } catch (err) {
        console.error("Failed to parse prefill data", err);
      }
    }
  }, [searchParams]);

  const fetchShipments = async () => {
    try {
      const resp = await adminApi.getShipments(true); // Fetch all including deleted for history
      if (resp.success) {
        setShipments(resp.data);
      }
    } catch (err) {
      console.error("Failed to fetch shipments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prefillData = searchParams.get('prefill') ? JSON.parse(decodeURIComponent(searchParams.get('prefill')!)) : null;
      const payload = {
        ...newShipment,
        quoteId: prefillData?.id // Add quoteId if available from prefill
      };
      const resp = await adminApi.createShipment(payload);
      if (resp.success) {
        setShipments([resp.data, ...shipments]);
        setIsModalOpen(false);
        // Clear query params after successful creation
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (err) {
      alert("Error creating shipment");
    }
  };

  const handleDeleteShipment = async (id: string) => {
    const shipment = shipments.find(s => s._id === id);
    const isAlreadyInHistory = shipment?.isDeleted || shipment?.currentStatus === 'delivered';
    
    const message = isAlreadyInHistory 
      ? "Permanently delete this shipment record? This action cannot be undone."
      : "Move this shipment to history?";
      
    if (!confirm(message)) return;
    
    try {
      const resp = await adminApi.deleteShipment(id, isAlreadyInHistory);
      if (resp.success) {
        if (isAlreadyInHistory) {
          setShipments(shipments.filter(s => s._id !== id));
        } else {
          setShipments(shipments.map(s => s._id === id ? { ...s, isDeleted: true } : s));
        }
      } else {
        alert(resp.message || "Something went wrong");
      }
    } catch (err: any) {
      alert("Error: " + (err.message || "Unknown error"));
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await adminApi.updateShipmentStatus(selectedShipment._id, updateData);
      if (resp.success) {
        setShipments(shipments.map(s => s._id === selectedShipment._id ? resp.data : s));
        setIsUpdateModalOpen(false);
        setUpdateData({ location: '', status: '', currentStatus: '', locationLink: '' });
      }
    } catch (err) {
      alert("Error updating shipment");
    }
  };

  const getStatusProgress = (status: string) => {
    switch(status) {
      case 'booked': return 10;
      case 'packing': return 30;
      case 'in_transit': return 65;
      case 'out_for_delivery': return 90;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const activeShipments = shipments.filter(s => s.currentStatus !== 'delivered' && !s.isDeleted);
  const historyShipments = shipments.filter(s => s.currentStatus === 'delivered' || s.isDeleted);

  const displayShipments = activeTab === 'active' ? activeShipments : historyShipments;

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
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {activeTab === 'active' ? 'Active Shipments' : 'Shipment History'}
            </h1>
            <p className="text-secondary mt-1">
              {activeTab === 'active' 
                ? 'Track and update the status of ongoing moves.' 
                : 'Review completed shipments and delivery history.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
              >
                History ({historyShipments.length})
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayShipments.length > 0 ? (
            displayShipments.map((shipment) => (
              <div key={shipment._id} className="apple-card p-6 border-white/10 group hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-colors">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary tracking-widest uppercase">{shipment.trackingId}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-white/10 text-muted-foreground">{shipment.currentStatus}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{shipment.customerName}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeleteShipment(shipment._id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all border border-red-500/10"
                      title={activeTab === 'active' ? "Move to History" : "Permanently Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedShipment(shipment);
                        setUpdateData({ 
                          location: '', 
                          status: '', 
                          currentStatus: shipment.currentStatus,
                          locationLink: shipment.locationLink || ''
                        });
                        setIsUpdateModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all border border-white/5"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Route</p>
                      <p className="font-bold text-white text-sm">{shipment.origin} → {shipment.destination}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-secondary">Progress</span>
                      <span className="text-primary">{getStatusProgress(shipment.currentStatus)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000"
                        style={{ width: `${getStatusProgress(shipment.currentStatus)}%` }}
                      />
                    </div>
                  </div>

                  {/* Visual Timeline component */}
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                       <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Recent Updates</p>
                       {shipment.driverName && (
                         <div className="flex items-center gap-2">
                           <div className="text-right">
                             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">Driver</p>
                             <p className="text-[11px] font-bold text-white mt-1">{shipment.driverName}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">Vehicle</p>
                             <p className="text-[11px] font-bold text-primary mt-1">{shipment.vehicleNumber || 'N/A'}</p>
                           </div>
                           {shipment.driverPhone && (
                             <a 
                               href={`tel:${shipment.driverPhone}`}
                               className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                               title="Call Driver"
                             >
                               <Phone className="w-3.5 h-3.5" />
                             </a>
                           )}
                           {shipment.locationLink && (
                             <a 
                               href={shipment.locationLink}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                               title="Live Location"
                             >
                               <MapPin className="w-3.5 h-3.5" />
                             </a>
                           )}
                         </div>
                       )}
                    </div>
                    <div className="space-y-4">
                      {shipment.updates.slice(-2).reverse().map((update: any, idx: number) => (
                        <div key={idx} className="flex gap-3 relative">
                          {idx === 0 && shipment.updates.length > 1 && (
                            <div className="absolute left-[7px] top-4 bottom-[-16px] w-0.5 bg-white/5" />
                          )}
                          <div className="w-4 h-4 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mt-0.5 relative z-10">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-none">{update.location}</p>
                            <p className="text-[10px] text-secondary mt-1">{update.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {shipment.currentStatus !== 'delivered' && (
                    <div className="flex gap-2 pt-2">
                      {['in_transit', 'out_for_delivery', 'delivered'].filter(s => s !== shipment.currentStatus).slice(0, 2).map(status => (
                        <button
                          key={status}
                          onClick={async () => {
                            try {
                              const resp = await adminApi.updateShipmentStatus(shipment._id, {
                                currentStatus: status,
                                location: shipment.destination,
                                status: `Status updated to ${status.replace(/_/g, ' ')}`
                              });
                              if (resp.success) {
                                setShipments(shipments.map(s => s._id === shipment._id ? resp.data : s));
                              }
                            } catch (err) {
                              alert("Quick update failed");
                            }
                          }}
                          className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-primary/10 hover:text-primary text-[10px] font-bold uppercase tracking-wider border border-white/10 transition-all"
                        >
                          Mark as {status.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
                    <History className="w-4 h-4" />
                    {shipment.updates.length} Updates
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase">
                    Last: {shipment.updates[shipment.updates.length-1]?.location}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="lg:col-span-2 text-center py-20 text-secondary apple-card border-white/10 border-dashed">
              {activeTab === 'active' 
                ? 'No active shipments found. Create your first shipment to start tracking.' 
                : 'No delivery history found yet.'}
            </div>
          )}
        </div>

        {/* Create Shipment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="apple-card w-full max-w-lg p-8 border-white/20 bg-[#0B1120]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">New Shipment</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-white"><X /></button>
              </div>
              <form onSubmit={handleCreateShipment} className="space-y-4">
                {/* 1. Primary Transit ID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary uppercase">Tracking ID (Required)</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-primary/30 rounded-xl py-3 px-4 text-white outline-none focus:border-primary text-lg font-mono tracking-wider"
                    placeholder="e.g. RP-8408"
                    value={newShipment.trackingId}
                    onChange={e => setNewShipment({...newShipment, trackingId: e.target.value.toUpperCase()})}
                    required
                  />
                </div>

                {/* 2. Driver & Vehicle Group (Priority) */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Transit Assets</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-secondary uppercase">Driver Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                        placeholder="John Doe"
                        value={newShipment.driverName}
                        onChange={e => setNewShipment({...newShipment, driverName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-secondary uppercase">Driver Phone</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                        placeholder="9876543210"
                        value={newShipment.driverPhone}
                        onChange={e => setNewShipment({...newShipment, driverPhone: e.target.value})}
                      />
                    </div>
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-secondary uppercase">Vehicle / Car Number</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                        placeholder="e.g. MH-31-AB-1234"
                        value={newShipment.vehicleNumber}
                        onChange={e => setNewShipment({...newShipment, vehicleNumber: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-secondary uppercase">Live Location Link</label>
                      <input 
                        type="url" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                        placeholder="https://maps.app.goo.gl/..."
                        value={newShipment.locationLink}
                        onChange={e => setNewShipment({...newShipment, locationLink: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Customer & Route Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-secondary uppercase font-bold">Customer Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                      placeholder="Name"
                      value={newShipment.customerName}
                      onChange={e => setNewShipment({...newShipment, customerName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-secondary uppercase font-bold">Customer Phone</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                      placeholder="Phone"
                      value={newShipment.customerPhone}
                      onChange={e => setNewShipment({...newShipment, customerPhone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-secondary uppercase font-bold">Origin</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                      placeholder="From"
                      value={newShipment.origin}
                      onChange={e => setNewShipment({...newShipment, origin: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-secondary uppercase font-bold">Destination</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                      placeholder="To"
                      value={newShipment.destination}
                      onChange={e => setNewShipment({...newShipment, destination: e.target.value})}
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-primary text-white font-black rounded-xl mt-6 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">Create Shipment & Notify Customer</button>
              </form>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {isUpdateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="apple-card w-full max-md p-8 border-white/20 bg-[#0B1120]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Update Tracking</h2>
                <button onClick={() => setIsUpdateModalOpen(false)} className="text-secondary hover:text-white"><X /></button>
              </div>
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-secondary uppercase">Overall Status</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary [&>option]:bg-[#111827]"
                    value={updateData.currentStatus}
                    onChange={e => setUpdateData({...updateData, currentStatus: e.target.value})}
                  >
                    <option value="booked" className="bg-[#111827] text-white">Booked</option>
                    <option value="packing" className="bg-[#111827] text-white">Packing</option>
                    <option value="in_transit" className="bg-[#111827] text-white">In Transit</option>
                    <option value="out_for_delivery" className="bg-[#111827] text-white">Out for Delivery</option>
                    <option value="delivered" className="bg-[#111827] text-white">Delivered</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-secondary uppercase">New Location</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                    placeholder="Where is the cargo now?"
                    value={updateData.location}
                    onChange={e => setUpdateData({...updateData, location: e.target.value})}
                  />
                </div>
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-secondary uppercase">Activity Update</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                    placeholder="e.g. Arrived at Pune Hub"
                    value={updateData.status}
                    onChange={e => setUpdateData({...updateData, status: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-secondary uppercase">Update Live Location Link</label>
                  <input 
                    type="url" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:border-primary"
                    placeholder="New tracking link..."
                    value={updateData.locationLink}
                    onChange={e => setUpdateData({...updateData, locationLink: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl mt-6">Update Journey</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminWrapper>
  );
}

export default function ShipmentsPage() {
  return (
    <Suspense fallback={
      <AdminWrapper>
        <div className="h-96 flex items-center justify-center text-primary">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      </AdminWrapper>
    }>
      <ShipmentsContent />
    </Suspense>
  );
}
