"use client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pakers-movers-backend.onrender.com/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const adminApi = {
  // Auth
  login: async (credentials: any) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // Stats
  getStats: async () => {
    const res = await fetch(`${BASE_URL}/stats`, { headers: getHeaders() });
    return res.json();
  },

  // Quotes
  getQuotes: async () => {
    const res = await fetch(`${BASE_URL}/quotes`, { headers: getHeaders() });
    return res.json();
  },
  
  getConvertedQuotes: async () => {
    const res = await fetch(`${BASE_URL}/quotes/converted`, { headers: getHeaders() });
    return res.json();
  },
  
  updateQuoteStatus: async (id: string, status: string) => {
    const res = await fetch(`${BASE_URL}/quotes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  deleteQuote: async (id: string) => {
    const res = await fetch(`${BASE_URL}/quotes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Shipments
  getShipments: async (includeDeleted = false) => {
    const res = await fetch(`${BASE_URL}/shipments${includeDeleted ? '?includeDeleted=true' : ''}`, { headers: getHeaders() });
    const data = await res.json();
    return data;
  },

  deleteShipment: async (id: string, permanent = false) => {
    const res = await fetch(`${BASE_URL}/shipments/${id}${permanent ? '?permanent=true' : ''}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { success: false, message: data?.message || `Server error: ${res.status}` };
    }
    return data || { success: true };
  },

  trackShipment: async (id: string) => {
    const res = await fetch(`${BASE_URL}/shipments/track/${id}`);
    return res.json();
  },

  createShipment: async (shipmentData: any) => {
    const res = await fetch(`${BASE_URL}/shipments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(shipmentData),
    });
    return res.json();
  },

  updateShipmentStatus: async (id: string, updateData: any) => {
    const res = await fetch(`${BASE_URL}/shipments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });
    return res.json();
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`, { headers: getHeaders() });
    return res.json();
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Pricing
  getPricing: async () => {
    const res = await fetch(`${BASE_URL}/pricing`, { headers: getHeaders() });
    return res.json();
  },

  updatePricing: async (category: string, tiers: any) => {
    const res = await fetch(`${BASE_URL}/pricing/${category}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ tiers }),
    });
    return res.json();
  },

  seedPricing: async () => {
    const res = await fetch(`${BASE_URL}/pricing/seed`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Security
  changePassword: async (passwordData: any) => {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(passwordData),
    });
    return res.json();
  }
};
