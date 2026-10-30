// ============================================================================
// STUDENT AUTHENTICATION & SESSION MANAGEMENT MODULE
// Strictly connected to Supabase Auth & PostgreSQL Profiles (No Stubs)
// ============================================================================

import { supabase, isSupabaseConfigured, logSupabase } from './supabaseClient.js';

// Module internal state
let currentUser = null;
let currentProfile = null;
let authChangeCallbacks = [];

/**
 * Initializes the Supabase authentication listener and retrieves any active session.
 */
export async function initAuth() {
    logSupabase('AUTH', 'Initializing authentication session...');

    if (!isSupabaseConfigured()) {
        logSupabase('AUTH', 'Cannot initialize auth: Supabase is not configured yet');
        currentUser = null;
        currentProfile = null;
        updateAuthUI();
        notifyAuthSubscribers();
        return null;
    }

    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            logSupabase('ERROR', 'Error fetching active Supabase session', error);
            throw error;
        }

        if (session && session.user) {
            currentUser = session.user;
            logSupabase('AUTH', 'Active student session restored', {
                id: currentUser.id,
                email: currentUser.email,
                role: currentUser.role
            });
            setTimeout(() => {
                loadUserProfile(currentUser.id);
            }, 0);
        } else {
            currentUser = null;
            currentProfile = null;
            logSupabase('AUTH', 'No active session found (student is logged out)');
        }

        // Attach real-time auth state listener
        supabase.auth.onAuthStateChange((event, session) => {
            logSupabase('AUTH', `Auth state changed: ${event}`, {
                hasSession: Boolean(session),
                userId: session?.user?.id
            });

            currentUser = session ? session.user : null;
            if (!currentUser) {
                currentProfile = null;
            }

            notifyAuthSubscribers();
            updateAuthUI();

            if (currentUser) {
                // Defer profile fetch out of auth state change handler to avoid lock contention
                setTimeout(async () => {
                    await loadUserProfile(currentUser.id);
                    notifyAuthSubscribers();
                    updateAuthUI();
                }, 0);
            }
        });
    } catch (err) {
        logSupabase('ERROR', 'Auth initialization error', { message: err.message });
    }

    updateAuthUI();
    notifyAuthSubscribers();
    return currentUser;
}

/**
 * Registers an observer callback for authentication state changes.
 * @param {Function} cb 
 */
export function onAuthStateChanged(cb) {
    if (typeof cb === 'function') {
        authChangeCallbacks.push(cb);
        cb(currentUser, currentProfile);
    }
}

function notifyAuthSubscribers() {
    authChangeCallbacks.forEach(cb => {
        try {
            cb(currentUser, currentProfile);
        } catch (e) {
            console.error('Subscriber callback error:', e);
        }
    });
}

/**
 * Returns current authenticated Supabase user or null.
 * @returns {object|null}
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Returns current student profile row or null.
 * @returns {object|null}
 */
export function getCurrentProfile() {
    return currentProfile;
}

/**
 * Loads seller profile from the `profiles` table in Supabase.
 * @param {string} userId 
 */
export async function loadUserProfile(userId) {
    if (!userId || !isSupabaseConfigured()) return null;

    try {
        logSupabase('DATABASE', 'Fetching profile row from public.profiles', { userId });
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            logSupabase('ERROR', 'Failed to retrieve profile row', error);
            return null;
        }

        currentProfile = data;
        logSupabase('DATABASE', 'Profile retrieved successfully', currentProfile);
        updateAuthUI();
        return currentProfile;
    } catch (e) {
        logSupabase('ERROR', 'Exception during profile load', { message: e.message });
        return null;
    }
}

/**
 * Signs up a new student account strictly through Supabase Auth.
 * @param {string} email 
 * @param {string} password 
 * @param {string} fullName 
 * @param {string} phoneNumber 
 * @param {string} campusLocation 
 */
export async function signUpStudent(email, password, fullName, phoneNumber = '', campusLocation = 'Main Campus') {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please enter your project URL and Anon key first.');
    }

    if (!email || !password) {
        throw new Error('Please enter both student email and password.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Proactively check if the email already exists in the database
    try {
        const { data: alreadyExists, error: rpcError } = await supabase.rpc('check_email_exists', {
            email_to_check: cleanEmail
        });
        if (alreadyExists) {
            logSupabase('AUTH', 'Sign-up blocked: email already registered in Supabase', { email: cleanEmail });
            throw new Error('Email already exists. Please sign in instead.');
        }
    } catch (err) {
        if (err.message && err.message.includes('already exists')) {
            throw err;
        }
        // Fallback: proceed to Supabase auth signup
    }

    logSupabase('AUTH', 'Initiating Supabase student registration', { email: cleanEmail, fullName, campusLocation });

    const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
            data: {
                full_name: fullName,
                phone_number: phoneNumber,
                campus_location: campusLocation
            }
        }
    });

    if (error) {
        logSupabase('ERROR', 'Supabase registration failed', error);
        if (error.message && error.message.toLowerCase().includes('rate limit')) {
            throw new Error('Supabase email rate limit reached. Fix: In your Supabase Dashboard -> Authentication -> Providers -> Email, turn off "Confirm email".');
        }
        if (error.message && (
            error.message.toLowerCase().includes('already registered') || 
            error.message.toLowerCase().includes('already exists') || 
            error.message.toLowerCase().includes('unique') ||
            error.status === 400 || 
            error.status === 422 || 
            error.code === 'user_already_exists'
        )) {
            throw new Error('Email already exists. Please sign in instead.');
        }
        throw error;
    }

    // 2. Check for Supabase Email Enumeration Protection:
    // When a duplicate email is signed up and protection is enabled, Supabase returns data.user with an empty identities array!
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        logSupabase('AUTH', 'Supabase returned empty identities (user already registered)', { email: cleanEmail });
        throw new Error('Email already exists. Please sign in instead.');
    }

    logSupabase('AUTH', 'Supabase user registration created', {
        userId: data.user?.id,
        email: data.user?.email,
        confirmationSent: !data.session
    });

    if (data.user) {
        currentUser = data.user;
        
        // Ensure profile row exists in public.profiles
        try {
            logSupabase('DATABASE', 'Upserting profile row in public.profiles', {
                id: data.user.id,
                full_name: fullName,
                phone_number: phoneNumber,
                campus_location: campusLocation
            });

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    full_name: fullName || 'Campus Student',
                    phone_number: phoneNumber || '',
                    campus_location: campusLocation || 'Main Campus'
                });

            if (profileError) {
                logSupabase('ERROR', 'Profile upsert returned error', profileError);
            } else {
                logSupabase('DATABASE', 'Profile upsert succeeded');
            }
        } catch (err) {
            logSupabase('ERROR', 'Profile creation exception', { message: err.message });
        }

        await loadUserProfile(currentUser.id);
    }

    updateAuthUI();
    notifyAuthSubscribers();
    return data;
}

/**
 * Authenticates an existing student strictly through Supabase Auth.
 * @param {string} email 
 * @param {string} password 
 */
export async function signInStudent(email, password) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please enter your project URL and Anon key first.');
    }

    if (!email || !password) {
        throw new Error('Please enter both email and password.');
    }

    logSupabase('AUTH', 'Attempting student sign-in with password', { email });

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        logSupabase('ERROR', 'Supabase sign-in failed', error);
        throw error;
    }

    currentUser = data.user;
    logSupabase('AUTH', 'Student successfully signed in to Supabase', {
        userId: currentUser.id,
        email: currentUser.email
    });

    await loadUserProfile(currentUser.id);

    updateAuthUI();
    notifyAuthSubscribers();
    return data;
}

/**
 * Signs out the current student session from Supabase.
 */
export async function signOutStudent() {
    if (isSupabaseConfigured()) {
        logSupabase('AUTH', 'Signing out student session from Supabase...');
        try {
            const { error } = await supabase.auth.signOut();
            if (error) logSupabase('ERROR', 'Supabase sign-out warning', error);
        } catch (e) {
            logSupabase('ERROR', 'Sign-out exception', { message: e.message });
        }
    }

    currentUser = null;
    currentProfile = null;
    logSupabase('AUTH', 'Session cleared, student signed out');

    updateAuthUI();
    notifyAuthSubscribers();
}

/**
 * Dynamically updates UI control buttons in navigation.
 */
export function updateAuthUI() {
    const openLoginBtn = document.getElementById('open-login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userBadge = document.getElementById('user-badge');
    const userNameSpan = document.getElementById('user-name-display');
    const navMyListingsBtn = document.getElementById('nav-my-listings-btn');

    if (currentUser) {
        if (openLoginBtn) openLoginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (userBadge) userBadge.classList.remove('hidden');
        if (navMyListingsBtn) navMyListingsBtn.classList.remove('hidden');
        if (userNameSpan) {
            const displayName = currentProfile?.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Student';
            userNameSpan.textContent = displayName;
        }
    } else {
        if (openLoginBtn) openLoginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (userBadge) userBadge.classList.add('hidden');
        if (navMyListingsBtn) navMyListingsBtn.classList.add('hidden');
    }

    const mobileAccountText = document.getElementById('mobile-account-text');
    const mobileAccountIcon = document.getElementById('mobile-account-icon');
    if (mobileAccountText) {
        mobileAccountText.textContent = currentUser ? 'Logout' : 'Account';
    }
    if (mobileAccountIcon) {
        mobileAccountIcon.innerHTML = currentUser 
            ? `<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>`
            : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
    }
}
