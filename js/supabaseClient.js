// ============================================================================
// SUPABASE CLIENT INITIALIZATION & LIVE AUDIT LOGGING MODULE
// Campus Online Thrift Market System
// ============================================================================

import { SUPABASE_CONFIG } from './config.js';

// Support both local pre-bundled client and ESM CDN fallback
let createClientFn = window.supabase?.createClient;
if (!createClientFn) {
    try {
        const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        createClientFn = mod.createClient;
    } catch (e) {
        console.error('Failed to load Supabase from CDN:', e);
    }
}

// Default live project credentials
export const DEFAULT_SUPABASE_URL = 'https://opcoqdoobwnoskdttifx.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY29xZG9vYndub3NrZHR0aWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNjM2MDQsImV4cCI6MjEwODgzOTYwNH0.gL97VkbipCPNP49tE7LpIDdsuKJv7FXtX3V_WrZEsS4';

/**
 * Retrieves the active Supabase URL.
 * Checks localStorage first, then config.js, then default.
 * Safe against cross-origin iframe security restrictions.
 * @returns {string}
 */
export function getSupabaseUrl() {
    try {
        const local = localStorage.getItem('CAMPUS_THRIFT_SUPABASE_URL');
        if (local && local.trim().length > 0) return local.trim();
    } catch (e) {
        // Storage access restricted in some iframes
    }
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.url.trim().length > 0) return SUPABASE_CONFIG.url.trim();
    return DEFAULT_SUPABASE_URL;
}

/**
 * Retrieves the active Supabase Anon Key.
 * Checks localStorage first, then config.js, then default.
 * Safe against cross-origin iframe security restrictions.
 * @returns {string}
 */
export function getSupabaseAnonKey() {
    try {
        const local = localStorage.getItem('CAMPUS_THRIFT_SUPABASE_ANON_KEY');
        if (local && local.trim().length > 0) return local.trim();
    } catch (e) {
        // Storage access restricted in some iframes
    }
    if (SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.anonKey.trim().length > 0) return SUPABASE_CONFIG.anonKey.trim();
    return DEFAULT_SUPABASE_ANON_KEY;
}

/**
 * Validates that current credentials represent a real Supabase endpoint.
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    return (
        Boolean(url) &&
        Boolean(key) &&
        !url.includes('YOUR_SUPABASE_PROJECT_ID') &&
        !key.includes('YOUR_SUPABASE_ANON_KEY') &&
        url.startsWith('https://') &&
        url.includes('.supabase.co') &&
        key.length > 20
    );
}

/**
 * Saves customized Supabase credentials to localStorage.
 * @param {string} url 
 * @param {string} key 
 */
export function saveSupabaseConfig(url, key) {
    try {
        if (url) localStorage.setItem('CAMPUS_THRIFT_SUPABASE_URL', url.trim());
        if (key) localStorage.setItem('CAMPUS_THRIFT_SUPABASE_ANON_KEY', key.trim());
        logSupabase('CONFIG', 'Credentials updated in localStorage', { url: getSupabaseUrl() });
    } catch (e) {
        logSupabase('ERROR', 'Unable to write to localStorage (iframe sandbox restricted)', e);
    }
}

/**
 * Clears custom credentials from localStorage.
 */
export function clearSupabaseConfig() {
    try {
        localStorage.removeItem('CAMPUS_THRIFT_SUPABASE_URL');
        localStorage.removeItem('CAMPUS_THRIFT_SUPABASE_ANON_KEY');
        logSupabase('CONFIG', 'Credentials cleared from localStorage', {});
    } catch (e) {
        logSupabase('ERROR', 'Unable to clear localStorage', e);
    }
}

/**
 * Structured console audit logger for all live Supabase interactions.
 * @param {'AUTH'|'DATABASE'|'STORAGE'|'CONFIG'|'ERROR'} category 
 * @param {string} action 
 * @param {any} details 
 */
export function logSupabase(category, action, details = {}) {
    const timestamp = new Date().toISOString().split('T')[1].replace('Z', '');
    const colorMap = {
        AUTH: '#6366f1',
        DATABASE: '#10b981',
        STORAGE: '#f59e0b',
        CONFIG: '#06b6d4',
        ERROR: '#ef4444'
    };
    const color = colorMap[category] || '#64748b';
    console.log(
        `%c[SUPABASE ${category}] %c${timestamp} - ${action}`,
        `background: ${color}; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: bold;`,
        'color: inherit; font-weight: 600;',
        details
    );
}

// Active connection parameters
const activeUrl = isSupabaseConfigured() ? getSupabaseUrl() : 'https://placeholder-project.supabase.co';
const activeKey = isSupabaseConfigured() ? getSupabaseAnonKey() : 'placeholder-anon-key';

// Initialize the Supabase client
export const supabase = createClientFn ? createClientFn(activeUrl, activeKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
}) : null;

// Audit initial connection status
if (isSupabaseConfigured()) {
    logSupabase('CONFIG', 'Connected to real Supabase instance', { endpoint: getSupabaseUrl() });
} else {
    logSupabase('CONFIG', 'Supabase credentials missing or using placeholders', {
        activeUrl,
        isConfigured: false,
        hint: 'Please provide your Supabase Project URL and Anon Key.'
    });
}
