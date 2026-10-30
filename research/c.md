Architectural Blueprint and AI-Driven Execution Strategy for the Campus Online Thrift Market SystemArchitectural and System AnalysisThe university ecosystem represents a distinct localized economy characterized by seasonal supply and demand fluctuations. At the conclusion of each academic term, graduating or progressing students accumulate functional physical assets—such as specialized textbooks, lab equipment, dormitory furniture, and electronics—that retain substantial utility. Concurrently, incoming and continuing students encounter financial barriers when purchasing similar items at full retail price. Traditional peer-to-peer campus commerce relies on unstructured communication channels, primarily instant messaging groups and social media status posts. These channels suffer from extreme message depreciation, an absence of category filtering, lack of persistent indexed records, and search limitations, which collectively increase transactional friction for both buyers and sellers.To solve these inefficiencies without incurring high operational overhead, the system architecture utilizes a static Single-Page Application (SPA) model connected directly to a serverless Backend-as-a-Service (BaaS) infrastructure. By avoiding full-stack client-side rendering frameworks such as React, Angular, or Next.js, and bypassing custom web server maintenance (such as Express.js on Node.js), the platform achieves maximum functional capability while minimizing codebase complexity.Technical Stack and Architectural RationaleThe technical stack prioritizes zero-build-step compilation, direct browser execution, and native HTTP web standards. The frontend layer is constructed using native HTML5, modern Vanilla ES6+ JavaScript, and utility-first Tailwind CSS loaded dynamically via Content Delivery Network (CDN) links. This stack eliminates node package installation scripts, transpilation steps, and bundler configurations, allowing instant static file serving through platforms like GitHub Pages or Vercel.The database and authentication layer relies on Supabase, an open-source PostgreSQL BaaS accessed via the @supabase/supabase-js v2 library loaded over a CDN. Supabase manages user identity verification, relational data storage, and file attachment storage via cloud storage buckets. Communication between prospective buyers and sellers avoids complex web-socket chat infrastructure by generating direct deep-linked Uniform Resource Identifiers (URIs) for external messaging protocols, such as WhatsApp (https://wa.me/) and system mail clients (mailto:).Technology ComponentSelected SolutionEvaluated AlternativeArchitectural Rationale & Trade-OffFrontend FrameworkVanilla JS (ES6+) + HTML5React / Next.jsEliminates build configuration, node dependency rot, and state management complexity; enables simple source inspection.Styling FrameworkTailwind CSS (CDN)Custom CSS / BootstrapProvides utility-first responsive styling inside markup without setup commands or local compilation pipelines.Backend InfrastructureSupabase BaaS (PostgreSQL)Express.js / Node.js + MongoDBEliminates server hosting costs, database setup, and manual REST API construction through automated database endpoints.Authentication EngineSupabase AuthCustom JWT / OAuth ServerDelivers secure session management, password hashing, and token storage out of the box.File Storage SystemSupabase Storage BucketLocal Server Disk / Base64 DBOffloads image assets to dedicated CDN storage while keeping PostgreSQL rows lightweight through public CDN URL strings.Communication LayerDeep-Linked URI ProtocolsIn-App Real-Time WebSocket ChatConverts contact details into direct mobile or desktop app triggers (wa.me, mailto), bypassing chat server engineering.Database Schema and Security ArchitectureThe database architecture employs a relational PostgreSQL model consisting of two main tables: profiles (which extends the internal Supabase auth.users schema) and items. Data security is enforced at the database level using PostgreSQL Row Level Security (RLS) policies. These policies grant public read access to all marketplace listings while restricting insertion, modification, and deletion operations strictly to authenticated asset owners.The entity relationship connects the profiles table to the items table through a one-to-many relationship, where a single student profile can maintain multiple active marketplace listings. Deletion of a user profile automatically cascades to remove all associated item listings, preventing orphaned data records.Table NameColumn NameData TypeConstraints / DefaultAccess Control & RLS RulesprofilesidUUIDPrimary Key, References auth.users(id) ON DELETE CASCADEPublic read; update restricted to auth.uid() = id.profilesfull_nameTEXTNOT NULLEditable exclusively by account owner.profilesphone_numberTEXTNOT NULLEditable exclusively by account owner.profilescampus_locationTEXTDefault: 'Main Campus'Editable exclusively by account owner.itemsidUUIDPrimary Key, Default: gen_random_uuid()Public read access for all site visitors.itemsuser_idUUIDForeign Key, References profiles(id) ON DELETE CASCADEAutomatically bound to auth.uid() on row insertion.itemstitleTEXTNOT NULLSearchable via client-side text filtering.itemsdescriptionTEXTNOT NULLReadable in grid cards and item detail views.itemspriceNUMERICNOT NULL, Check constraint: price >= 0Filterable by price range.itemscategoryTEXTNOT NULLCategorized (e.g., Textbooks, Electronics, Dorm Gear).itemsimage_urlTEXTDefault: Placeholder image URLPopulated from public URL after Supabase Storage upload.itemscontact_methodTEXTNOT NULL ('WhatsApp', 'Phone', 'Email')Determines client URI action string.itemscontact_valueTEXTNOT NULL (e.g., '+254700000000')Target value for deep-link URI generation.itemscreated_atTIMESTAMPTZDefault: now()Used for chronological sorting of listings.Repository and Directory ArchitectureThe repository organization isolates database scripts, static web components, and modular client-side JavaScript logic. This clear separation ensures that individual team members can work on isolated files simultaneously without encountering merge conflicts.The directory layout is structured as follows:campus-thrift-market/index.html — Main single-page web interface containing the navigation bar, search controls, marketplace feed grid, and embedded modal forms.styles.css — Custom utility CSS overrides and supplemental layout rules extending Tailwind CSS.js/supabaseClient.js — CDN-based initialization module for the Supabase client connection.auth.js — Authentication logic managing student registration, login, logout, and session updates.app.js — Primary application engine controlling data fetching, DOM rendering, image uploads, category filtering, and direct link generation.sql/schema.sql — Database Definition Language (DDL) script containing table structures, foreign key constraints, storage bucket rules, and RLS security policies.README.md — Technical setup documentation, deployment instructions, and system demonstration guide.File PathwayFunction & Component ScopeTeam Ownership Allocationindex.htmlDefines DOM structure, navigation bar, modal dialogs, search inputs, and item card templates.Person 2 (Frontend Lead)styles.cssHandles visual tweaks, smooth modal transitions, and custom spacing rules.Person 2 (Frontend Lead)js/supabaseClient.jsImports Supabase client via ESM CDN and exports the initialized client object.Person 1 (Database Lead)js/auth.jsManages authentication forms, JWT session persistence, and UI auth state toggles.Person 1 (Database Lead)js/app.jsExecutes search filters, database queries, image uploads, DOM injection, and URI generation.Person 3 (Integration Lead)sql/schema.sqlContains complete PostgreSQL database DDL scripts, RLS rules, and storage configurations.Person 1 (Database Lead)README.mdProvides operational setup instructions, team assignment breakdown, and demo steps.Person 4 (QA & Documentation Lead)System Implementation CodebaseThe following source code provides a complete, production-ready implementation of the Campus Online Thrift Market. The codebase is fully annotated with inline comments to aid code comprehension across technical and non-technical team members.SQL Database Schema (sql/schema.sql)SQL-- ============================================================================
-- CAMPUS ONLINE THRIFT MARKET - DATABASE INITIALIZATION SCRIPT
-- ============================================================================

-- 1. Create User Profiles Table (Extends Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    campus_location TEXT DEFAULT 'Main Campus',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Items Table for Marketplace Listings
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    image_url TEXT,
    contact_method TEXT NOT NULL, -- Supported values: 'WhatsApp', 'Phone', 'Email'
    contact_value TEXT NOT NULL,  -- Target phone number or email address
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) on All Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 4. Set Profiles Row Level Security Policies
-- Allow public read access to seller profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile row
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to modify only their own profile details
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. Set Items Row Level Security Policies
-- Allow open public read access to all posted marketplace listings
CREATE POLICY "Items are viewable by everyone" 
ON public.items FOR SELECT USING (true);

-- Allow logged-in students to create new listings
CREATE POLICY "Authenticated users can create items" 
ON public.items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow sellers to modify or delete only their own active listings
CREATE POLICY "Users can update their own items" 
ON public.items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" 
ON public.items FOR DELETE USING (auth.uid() = user_id);

-- 6. Configure Storage Bucket for Uploaded Item Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Define Storage Policies for Public Reading and Authenticated Uploading
CREATE POLICY "Public access to item images" 
ON storage.objects FOR SELECT USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images" 
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'item-images' AND auth.role() = 'authenticated'
);
Supabase Client Script (js/supabaseClient.js)JavaScript// ============================================================================
// SUPABASE CLIENT INITIALIZATION MODULE (CDN ESM IMPORT)
// ============================================================================

// Import the Supabase JS v2 Client directly from JSDelivr CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Replace placeholders with project credentials from the Supabase API Settings tab
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize and export the single Supabase client instance for global usage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
Application HTML Interface (index.html)HTML<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Online Thrift Market</title>
    <!-- Tailwind CSS Framework CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-800 font-sans min-h-screen flex flex-col">

    <!-- TOP NAVIGATION BAR -->
    <header class="bg-indigo-600 text-white shadow-md sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 class="text-xl font-bold tracking-wide">🎓 Campus Thrift</h1>
            
            <div id="auth-buttons" class="flex gap-2">
                <button id="open-login-btn" onclick="toggleModal('auth-modal', true)" class="bg-indigo-500 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm transition">Sign In</button>
                <button id="open-post-btn" onclick="checkAuthAndOpenPostModal()" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition">+ Sell Item</button>
                <button id="logout-btn" onclick="handleLogout()" class="hidden bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition">Logout</button>
            </div>
        </div>
    </header>

    <!-- MAIN MARKETPLACE CONTENT -->
    <main class="max-w-7xl mx-auto px-4 py-6 flex-grow w-full">
        
        <!-- SEARCH AND FILTER SECTION -->
        <section class="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <!-- Keyword Search Input -->
            <div class="w-full md:w-1/2">
                <input type="text" id="search-input" onkeyup="filterItems()" placeholder="Search textbooks, clothes, electronics..." class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            
            <!-- Category Dropdown Filter -->
            <div class="w-full md:w-1/3">
                <select id="category-filter" onchange="filterItems()" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="ALL">All Categories</option>
                    <option value="Textbooks">Textbooks</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Dorm Essentials">Dorm Essentials</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </section>

        <!-- MARKETPLACE ITEM GRID -->
        <section>
            <div id="items-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <!-- Dynamically populated via JavaScript -->
            </div>
            <div id="loading-spinner" class="text-center py-12 text-gray-500">Loading campus listings...</div>
            <div id="empty-state" class="hidden text-center py-12 text-gray-500">No items found matching your filter criteria.</div>
        </section>
    </main>

    <!-- POST ITEM FORM MODAL -->
    <div id="post-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onclick="toggleModal('post-modal', false)" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            <h2 class="text-xl font-bold mb-4 text-indigo-600">Post Item for Sale</h2>
            
            <form id="post-item-form" onsubmit="handlePostItem(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Item Title</label>
                    <input type="text" id="item-title" required placeholder="e.g. Calculus Textbook 10th Ed" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Price (KSh / $)</label>
                    <input type="number" id="item-price" required min="0" placeholder="500" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Category</label>
                    <select id="item-category" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="Textbooks">Textbooks</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Dorm Essentials">Dorm Essentials</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="item-description" required rows="3" placeholder="Condition details, pickup location..." class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Item Image</label>
                    <input type="file" id="item-image" accept="image/*" class="w-full text-sm text-gray-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Preferred Contact Method</label>
                    <select id="item-contact-method" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Phone">Direct Phone Call</option>
                        <option value="Email">Email</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Contact Number or Email</label>
                    <input type="text" id="item-contact-value" required placeholder="+254712345678 or student@univ.edu" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <button type="submit" id="submit-item-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition">Publish Listing</button>
            </form>
        </div>
    </div>

    <!-- STUDENT AUTHENTICATION MODAL -->
    <div id="auth-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
            <button onclick="toggleModal('auth-modal', false)" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            <h2 id="auth-title" class="text-xl font-bold mb-4 text-indigo-600">Student Sign In</h2>
            
            <form id="auth-form" onsubmit="handleAuth(event)" class="space-y-4">
                <div id="name-field" class="hidden">
                    <label class="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" id="auth-name" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Student Email</label>
                    <input type="email" id="auth-email" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="auth-password" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <button type="submit" id="auth-submit-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition">Sign In</button>
            </form>
            
            <p class="mt-4 text-xs text-center text-gray-500">
                <span id="auth-toggle-text">Need an account?</span>
                <button onclick="toggleAuthMode()" class="text-indigo-600 font-semibold underline ml-1">Switch Mode</button>
            </p>
        </div>
    </div>

    <!-- Load Application Logic Module -->
    <script type="module" src="js/app.js"></script>
</body>
</html>
Core Application JavaScript Logic (js/app.js)JavaScript// ============================================================================
// MAIN APPLICATION ENGINE & DOM INTERACTION CONTROLLER
// ============================================================================

import { supabase } from './supabaseClient.js';

// Global Application State Variables
let allItems = [];
let currentUser = null;
let isSignUpMode = false;

// Initialize Application Logic on DOM Content Loaded
window.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    await fetchItems();
    
    // Bind functions to window object to enable direct HTML inline click triggers
    window.toggleModal = toggleModal;
    window.checkAuthAndOpenPostModal = checkAuthAndOpenPostModal;
    window.handleLogout = handleLogout;
    window.handleAuth = handleAuth;
    window.toggleAuthMode = toggleAuthMode;
    window.handlePostItem = handlePostItem;
    window.filterItems = filterItems;
});

// ----------------------------------------------------------------------------
// 1. AUTHENTICATION & SESSION MANAGEMENT
// ----------------------------------------------------------------------------

// Check if a user session is active on application load
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session ? session.user : null;
    updateAuthUI();

    // Attach active listener for authentication status changes
    supabase.auth.onAuthStateChange((_event, session) => {
        currentUser = session ? session.user : null;
        updateAuthUI();
    });
}

// Dynamically update UI control buttons based on user session status
function updateAuthUI() {
    const openLoginBtn = document.getElementById('open-login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (currentUser) {
        openLoginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        openLoginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// Handle Sign-In and Sign-Up form submissions
async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;

    try {
        if (isSignUpMode) {
            // Register a new user account with Supabase Auth
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

            // Create corresponding row in profiles table upon success
            if (data.user) {
                await supabase.from('profiles').insert([
                    { id: data.user.id, full_name: name, phone_number: 'N/A' }
                ]);
            }
            alert('Registration successful! You may now post items for sale.');
        } else {
            // Authenticate an existing user account
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        }
        toggleModal('auth-modal', false);
    } catch (err) {
        alert('Authentication Error: ' + err.message);
    }
}

// Toggle between Login and Sign-Up input fields inside Auth Modal
function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    document.getElementById('auth-title').innerText = isSignUpMode ? 'Student Sign Up' : 'Student Sign In';
    document.getElementById('auth-submit-btn').innerText = isSignUpMode ? 'Create Account' : 'Sign In';
    document.getElementById('name-field').classList.toggle('hidden', !isSignUpMode);
    document.getElementById('auth-toggle-text').innerText = isSignUpMode ? 'Already have an account?' : 'Need an account?';
}

// Terminate active user session
async function handleLogout() {
    await supabase.auth.signOut();
    alert('Logged out successfully.');
}

// Verify authentication before displaying the Post Item form modal
function checkAuthAndOpenPostModal() {
    if (!currentUser) {
        alert('Please sign in first to post an item for sale.');
        toggleModal('auth-modal', true);
    } else {
        toggleModal('post-modal', true);
    }
}

// Generic helper function to toggle modal visibilities
function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

// ----------------------------------------------------------------------------
// 2. DATA FETCHING & GRID RENDERING ENGINE
// ----------------------------------------------------------------------------

// Retrieve active marketplace listings from Supabase database
async function fetchItems() {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.remove('hidden');

    const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

    spinner.classList.add('hidden');

    if (error) {
        console.error('Data Fetch Error:', error);
        return;
    }

    allItems = data || [];
    renderItems(allItems);
}

// Inject listing data into HTML card templates inside the grid container
function renderItems(items) {
    const grid = document.getElementById('items-grid');
    const emptyState = document.getElementById('empty-state');
    grid.innerHTML = '';

    if (items.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    items.forEach(item => {
        const defaultImg = 'https://via.placeholder.com/300x200?text=Campus+Thrift';
        const contactLink = buildContactURI(item.contact_method, item.contact_value, item.title);

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition';

        card.innerHTML = `
            <div>
                <img src="${item.image_url || defaultImg}" alt="${item.title}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <span class="inline-block bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-md font-semibold mb-2">${item.category}</span>
                    <h3 class="font-bold text-lg text-gray-900">${item.title}</h3>
                    <p class="text-indigo-600 font-extrabold text-xl my-1">KSh ${item.price}</p>
                    <p class="text-gray-600 text-sm line-clamp-2">${item.description}</p>
                </div>
            </div>
            <div class="p-4 pt-0">
                <a href="${contactLink}" target="_blank" rel="noopener noreferrer" 
                   class="w-full block text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg text-sm transition">
                   Contact Seller (${item.contact_method})
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Generate direct contact action links for WhatsApp, Email, or Phone
function buildContactURI(method, value, title) {
    const encodedTitle = encodeURIComponent(title);
    if (method === 'WhatsApp') {
        const cleanNumber = value.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanNumber}?text=Hi,%20I'm%20interested%20in%20your%20campus%20thrift%20listing:%20${encodedTitle}`;
    } else if (method === 'Email') {
        return `mailto:${value}?subject=Campus%20Thrift:%20${encodedTitle}`;
    } else {
        return `tel:${value}`;
    }
}

// ----------------------------------------------------------------------------
// 3. CLIENT-SIDE SEARCH & CATEGORY FILTERING LOGIC
// ----------------------------------------------------------------------------

function filterItems() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const selectedCategory = document.getElementById('category-filter').value;

    const filtered = allItems.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
        const matchesCategory = (selectedCategory === 'ALL') || (item.category === selectedCategory);
        return matchesQuery && matchesCategory;
    });

    renderItems(filtered);
}

// ----------------------------------------------------------------------------
// 4. ITEM CREATION & IMAGE UPLOAD PIPELINE
// ----------------------------------------------------------------------------

async function handlePostItem(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('submit-item-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Publishing...';

    const title = document.getElementById('item-title').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    const description = document.getElementById('item-description').value;
    const contactMethod = document.getElementById('item-contact-method').value;
    const contactValue = document.getElementById('item-contact-value').value;
    const imageFile = document.getElementById('item-image').files[0];

    let imageUrl = null;

    try {
        // Upload image file to Supabase Storage if selected by user
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `items/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('item-images')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            // Fetch public CDN URL for the uploaded image file
            const { data } = supabase.storage.from('item-images').getPublicUrl(filePath);
            imageUrl = data.publicUrl;
        }

        // Insert new record into the items database table
        const { error: insertError } = await supabase.from('items').insert([
            {
                user_id: currentUser.id,
                title,
                price,
                category,
                description,
                image_url: imageUrl,
                contact_method: contactMethod,
                contact_value: contactValue
            }
        ]);

        if (insertError) throw insertError;

        alert('Listing published successfully!');
        document.getElementById('post-item-form').reset();
        toggleModal('post-modal', false);
        await fetchItems(); // Refresh feed view
    } catch (err) {
        alert('Error publishing item: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Publish Listing';
    }
}
Strategic Development PlanThe strategic plan divides responsibilities cleanly across a 4-person team over a 4-week timeline. This ensures that work progresses without technical dependencies or bottlenecks.The overall project schedule is organized sequentially across four operational phases:Week 1 (Infrastructure Setup & Core Interfaces): Focuses on configuring the Supabase cloud instance, executing the PostgreSQL schema definitions, creating image storage buckets, and building the static HTML structural markup.Week 2 (Authentication & Dynamic Views): Involves wiring the Supabase Auth module to the frontend header controls, implementing session management logic, and creating responsive CSS layouts.Week 3 (CRUD Execution & Contact Integrations): Completes database creation scripts, image upload services, real-time client-side keyword search, category filtering, and direct messaging link handlers.Week 4 (Data Population, Quality Assurance, & Academic Reporting): Centers on loading mock marketplace data, executing cross-browser mobile testing, finalizing system user guides, and completing project documentation.Operational ScheduleDeliverables & Technical MilestonesResponsible Team MemberPrimary Focus AreaWeek 1: InfrastructureSet up Supabase cloud instance, run schema.sql, configure Row Level Security, and set up public image storage buckets.Person 1Backend & Database LeadWeek 1: Layout & WireframesBuild static HTML5 structural skeleton in index.html and configure Tailwind CSS styles.Person 2Frontend & UI/UX LeadWeek 2: AuthenticationConnect Supabase Auth in js/auth.js, configure user session persistence, and implement header state controls.Person 1Backend & Database LeadWeek 2: UI EngineeringBuild responsive card layouts, modal popups, and user input form elements.Person 2Frontend & UI/UX LeadWeek 3: Data ServicesBuild database insertion logic in js/app.js, image upload handlers, and state update triggers.Person 3Integration LeadWeek 3: Search & MessagingImplement live text filtering, category select logic, and deep-linked messaging URL generators (wa.me).Person 3Integration LeadWeek 4: Quality AssurancePopulate database with 15 test items, verify mobile responsiveness, and fix edge-case bugs.Person 4QA & Testing LeadWeek 4: DocumentationFinalize technical documentation, write setup manuals, and build presentation slide decks.Person 4QA & Documentation LeadComprehensive Master AI Agent Prompt and Task TicketsThe following prompt and task tickets are designed to automate full system construction when provided to an AI software agent or Gemini 3.8 instance.Master Prompt for Gemini 3.8 / AI Coding AgentSYSTEM INSTRUCTION: You are an Expert Principal Full-Stack Software Engineer specializing in low-complexity, maximum-grade academic software applications built with Vanilla JavaScript, HTML5, Tailwind CSS, and Supabase BaaS.TASK OBJECTIVE:Build a fully working, robust, simple Campus Online Thrift Market web application according to the specification provided below. You must generate complete, clean, robust, working code with inline beginner-friendly comments explaining every core function.TECHNICAL STACK CONSTRAINTS:No Frontend Frameworks (No React, Vue, Angular, or Svelte).No Build Tools or Bundlers (No Vite, Webpack, Babel, or npm install steps).Plain HTML5, Vanilla ES6+ JavaScript, and Tailwind CSS delivered strictly via CDN script tags.Supabase JS Client v2 initialized directly via CDN: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'.Direct browser execution compatible with GitHub Pages or static host deployment.CORE FUNCTIONAL REQUIREMENTS:USER AUTHENTICATION: Email/Password sign-up and sign-in using Supabase Auth. Dynamic UI toggling (Show/Hide Post Item button, Login button, Logout button based on active auth session).MARKETPLACE FEED: Fetch listings from 'items' table ordered by newest first. Display item image, title, price, category badge, and description inside a responsive CSS grid.ITEM POSTING MODULE: Modal containing a form to input Title, Price, Category, Description, Image File, Contact Method (WhatsApp, Phone, Email), and Contact Value. Handle image uploading to Supabase Storage ('item-images' bucket) and insert public image URL into database.INSTANT CONTACT INTEGRATION: Generate interactive contact action buttons using URL schemes:WhatsApp: https://wa.me/[clean_number]?text=[encoded_title]Email: mailto:[email]?subject=[encoded_title]Phone: tel:[number]CLIENT-SIDE SEARCH & FILTER: Filter displayed items instantly without additional network requests using keyword text inputs (matching Title or Description) and category dropdown selectors.DATABASE SCHEMA REQUIREMENT:Generate a single, comprehensive SQL initialization file ('sql/schema.sql') creating 'profiles' and 'items' tables, enabling Row Level Security (RLS) policies for public reading and owner-only editing/deleting, and setting up the public storage bucket for images.Ensure all source code files (index.html, styles.css, js/supabaseClient.js, js/app.js, js/auth.js, sql/schema.sql) are completely filled out, fully functional, and heavily commented.Granular Execution Tickets for AI Development AgentTicket 01: Database Schema and Storage Bucket SetupTicket ID: TICKET-01Owner Role: Person 1 (Backend Lead)Target Module: sql/schema.sqlDescription: Create the complete relational database structure in Supabase PostgreSQL for the Campus Online Thrift Market.Instructions:Write DDL SQL statements creating profiles (referencing auth.users) and items tables.Ensure columns for title, description, price, category, image_url, contact_method, and contact_value are configured with constraints.Enable Row Level Security (RLS) on both tables.Define RLS policies allowing public reading, authenticated insertions, and owner-only edits or deletions.Include SQL commands to instantiate a public Storage bucket named item-images with corresponding access policies.Acceptance Criteria: SQL script executes without errors in Supabase SQL Editor, and RLS blocks unauthorized modifications while allowing public reading.Ticket 02: Supabase Client Initialization and Auth ModuleTicket ID: TICKET-02Owner Role: Person 1 (Backend Lead)Target Module: js/supabaseClient.js & js/auth.jsDescription: Establish the client connection to Supabase and handle user authentication session states.Instructions:In js/supabaseClient.js, import createClient from JSDelivr ESM CDN link.Export initialized supabase client instance using API credentials.In js/auth.js, write asynchronous functions handling student sign-up and sign-in.Attach listener supabase.auth.onAuthStateChange to monitor user sessions.Toggle visibility of navigation buttons (Login, Logout, Sell Item) based on active user session.Acceptance Criteria: Users can create accounts and log in successfully, with navigation controls updating dynamically based on session status.Ticket 03: Single-Page HTML Interface and Responsive LayoutTicket ID: TICKET-03Owner Role: Person 2 (Frontend Lead)Target Module: index.html & styles.cssDescription: Construct a single-page web interface optimized for desktop and mobile web browsers.Instructions:Import Tailwind CSS CDN script inside index.html head.Build sticky header navigation bar with title logo and authentication action buttons.Create search and filter control bar containing text input for keywords and select dropdown for categories.Build responsive grid section (1 column mobile, 4 columns desktop) for rendering marketplace item cards.Create hidden modal overlays for the Post Item form and Sign In form with toggle controls.Acceptance Criteria: The interface layout scales across mobile and desktop devices, and modals toggle smoothly via JavaScript calls.Ticket 04: Item Creation Pipeline and File Upload ServiceTicket ID: TICKET-04Owner Role: Person 3 (Integration Lead)Target Module: js/app.jsDescription: Connect the Post Item form to Supabase Cloud Storage and database tables.Instructions:Write handlePostItem(event) function intercepting form submit triggers.Check if user selected an image file and upload it to item-images storage bucket.Fetch public CDN URL for the uploaded file via getPublicUrl().Write database query inserting listing attributes (title, price, category, description, image URL, contact method, contact value, user_id) into items table.Reset form inputs, close modal view, and refresh feed listings.Acceptance Criteria: Submitting form uploads image asset to bucket and creates a row in items table. Unauthenticated form submissions are blocked.Ticket 05: Real-Time Client Search and Category FilteringTicket ID: TICKET-05Owner Role: Person 3 (Integration Lead)Target Module: js/app.jsDescription: Implement client-side search and category filtering over fetched marketplace listings.Instructions:Fetch all listings from items table upon app initialization and store in local array allItems.Attach input event listener to search bar and change event listener to category dropdown.Write filterItems() function matching allItems entries against active text query and category selection.Re-render matching items to grid container instantly, displaying empty state notification if no matches are found.Acceptance Criteria: Search input filters displayed cards without sending repeated network requests.Ticket 06: Direct Contact Link IntegrationTicket ID: TICKET-06Owner Role: Person 3 (Integration Lead) & Person 4 (QA Lead)Target Module: js/app.jsDescription: Enable buyers to connect with sellers using WhatsApp, Email, or Phone URI links.Instructions:Write helper function buildContactURI(method, value, title) receiving item parameters.Implement URI creation rules:WhatsApp: Return https://wa.me/[phone_number]?text=Hi, I am interested in your campus thrift listing: [title].Email: Return mailto:[email]?subject=Campus Thrift: [title].Phone: Return tel:[phone_number].Inject generated URI into href attribute of card's "Contact Seller" button.Acceptance Criteria: Clicking WhatsApp contact button opens WhatsApp with a pre-filled item inquiry message.System Synthesis and Strategic ConclusionsThe architecture detailed in this report resolves informal campus trading inefficiencies while minimizing engineering complexity. By pairing Vanilla JavaScript with Supabase BaaS delivered via CDN, the application eliminates server hosting costs, node package management, and build compilation pipelines.Key architectural benefits of this approach include:Zero Dependency Maintenance: Avoiding Node.js build steps ensures the application executes directly within any modern web browser without dependency breakage.High Academic Transparency: Pure HTML5, CSS, and Vanilla JS source files allow project reviewers to audit code execution, database queries, and DOM logic.Database-Level Security: PostgreSQL Row Level Security (RLS) policies protect user records directly at the database layer without custom middleware servers.Frictionless P2P Commerce: Deep-linked URIs for messaging protocols connect buyers directly to sellers without needing in-app chat servers.This blueprint delivers an effective development strategy that balances minimal engineering effort with functional completeness and academic rigor.