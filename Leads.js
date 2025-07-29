// Leads.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof window !== 'undefined' && window.env?.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof window !== 'undefined' && window.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let session_user = null; // {username, role}

// DEMO authentication: checks against users table (plain text password for demo only)
export async function login(username, password) {
  const { data: user, error } = await supabase
    .from('users')
    .select('username, password, role')
    .eq('username', username)
    .single();

  if (error || !user || user.password !== password) throw new Error("Incorrect username or password");
  session_user = { username: user.username, role: user.role };
  return session_user;
}

export function logout() {
  session_user = null;
}
export function isLoggedIn() {
  return !!session_user;
}
export function getSessionUser() {
  return session_user;
}

// LEADS
export async function getLeads(filters = {}) {
  let query = supabase.from('leads').select('*').order('date_added', { ascending: false });
  if (filters.assignedTo && filters.assignedTo !== 'all') query = query.eq('assigned_to', filters.assignedTo);
  if (filters.dateAdded) query = query.eq('date_added', filters.dateAdded);
  const { data, error } = await query;
  if (error) { console.error('Error fetching leads:', error); return []; }
  return data || [];
}

export async function addLead(lead) {
  const { data, error } = await supabase.from('leads').insert([lead]);
  if (error) throw error;
  return data;
}

export async function updateLeadField(leadId, field, value) {
  const { error } = await supabase.from('leads').update({ [field]: value }).eq('id', leadId);
  if (error) throw error;
}

// FOLLOWUPS
export async function getFollowups(filters = {}) {
  let query = supabase.from('followups').select('*');
  if (filters.username) query = query.eq('username', filters.username);
  if (filters.leadId) query = query.eq('lead_id', filters.leadId);
  if (filters.date) query = query.eq('date', filters.date);
  const { data, error } = await query;
  if (error) { console.error('Error fetching followups:', error); return []; }
  return data || [];
}

export async function addFollowup(followup) {
  const { data, error } = await supabase.from('followups').insert([followup]);
  if (error) throw error;
  return data;
}

export async function updateFollowupStatus(followupId, status) {
  const { error } = await supabase.from('followups').update({ status }).eq('id', followupId);
  if (error) throw error;
}

// USERS (for assigning roles, etc)
export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('username,role');
  if (error) return [];
  return data || [];
}
