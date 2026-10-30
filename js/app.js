// ============================================================================
// MAIN APPLICATION ENGINE & DOM INTERACTION CONTROLLER
// Strict Supabase Integration (No Stubs, 100% Real PostgreSQL & Storage Data)
// ============================================================================

import { 
    supabase, 
    isSupabaseConfigured, 
    getSupabaseUrl, 
    getSupabaseAnonKey, 
    saveSupabaseConfig, 
    clearSupabaseConfig,
    logSupabase 
} from './supabaseClient.js';

import { 
    initAuth, 
    getCurrentUser, 
    getCurrentProfile, 
    signUpStudent, 
    signInStudent, 
    signOutStudent, 
    onAuthStateChanged 
} from './auth.js';

// ----------------------------------------------------------------------------
// GLOBAL APPLICATION STATE
// ----------------------------------------------------------------------------
let allItems = [];
let activeCategory = 'ALL';
let isSignUpMode = false;
let editingItemId = null;
let pendingDeleteItemId = null;

// ----------------------------------------------------------------------------
// INITIALIZATION ON DOM LOAD
// ----------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    logSupabase('CONFIG', 'DOM loaded. Initializing Campus Online Thrift Market application...');

    // 1. Update Backend Status indicator pill immediately
    updateBackendStatusBadge();

    // 2. Fetch Marketplace Items Feed strictly from Supabase immediately
    fetchItems().catch(err => {
        logSupabase('ERROR', 'Error fetching marketplace items', err);
    });

    // 3. Initialize Authentication concurrently without blocking feed rendering
    initAuth().catch(err => {
        logSupabase('ERROR', 'Error initializing auth', err);
    });

    // 4. Register auth state observer
    onAuthStateChanged((user, profile) => {
        // Refresh My Listings overlay if open
        const myListingsModal = document.getElementById('my-listings-modal');
        if (myListingsModal && !myListingsModal.classList.contains('hidden')) {
            renderMyListings();
        }
    });

    // 5. Expose functions to window object for inline HTML event triggers
    window.toggleModal = toggleModal;
    window.checkAuthAndOpenPostModal = checkAuthAndOpenPostModal;
    window.openEditItemModal = openEditItemModal;
    window.openMyListingsModal = openMyListingsModal;
    window.renderMyListings = renderMyListings;
    window.handleLogout = handleLogout;
    window.handleAuth = handleAuth;
    window.toggleAuthMode = toggleAuthMode;
    window.handlePostItem = handlePostItem;
    window.filterItems = filterItems;
    window.setCategory = setCategory;
    window.clearSearch = clearSearch;
    window.resetAllFilters = resetAllFilters;
    window.openItemDetail = openItemDetail;
    window.handleDeleteItem = handleDeleteItem;
    window.previewImage = previewImage;
    window.removeImagePreview = removeImagePreview;
    window.updateContactPlaceholder = updateContactPlaceholder;
    window.openConfigModal = openConfigModal;
    window.handleSaveConfig = handleSaveConfig;
    window.handleClearConfig = handleClearConfig;
    window.copyToClipboard = copyToClipboard;
    window.togglePhoneFrame = togglePhoneFrame;
    window.scrollToFeed = scrollToFeed;
    window.focusSearchInput = focusSearchInput;
    window.handleMobileAuthAction = handleMobileAuthAction;
    window.closeAllModals = closeAllModals;
    window.openDeleteConfirmModal = openDeleteConfirmModal;
    window.closeDeleteConfirmModal = closeDeleteConfirmModal;
    window.executeDeleteConfirmedItem = executeDeleteConfirmedItem;

    const confirmDeleteBtn = document.getElementById('confirm-delete-action-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', executeDeleteConfirmedItem);
    }

    // 6. Global Escape key and backdrop-click dismiss handlers for all modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            closeAllModals();
        }
    });

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                toggleModal(modal.id, false);
            }
        });
    });
});

// ----------------------------------------------------------------------------
// 1. DATA FETCHING & RENDERING ENGINE (STRICT SUPABASE POSTGRESQL)
// ----------------------------------------------------------------------------

/**
 * Retrieves marketplace listings strictly from the Supabase `items` table.
 */
export async function fetchItems() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('hidden');

    if (!isSupabaseConfigured()) {
        logSupabase('DATABASE', 'Supabase credentials not configured. Skipping remote fetch.');
        if (spinner) spinner.classList.add('hidden');
        allItems = [];
        updateStats(0);
        renderItems([]);
        showUnconfiguredNotice();
        return;
    }

    try {
        logSupabase('DATABASE', 'Querying public.items (SELECT * ORDER BY created_at DESC)...');
        const startTime = performance.now();

        const { data, error } = await supabase
            .from('items')
            .select('*')
            .order('created_at', { ascending: false });

        const duration = Math.round(performance.now() - startTime);

        if (error) {
            logSupabase('ERROR', `Supabase query failed after ${duration}ms`, error);
            showToast('Database error: ' + error.message, 'error');
            allItems = [];
        } else {
            allItems = data || [];
            logSupabase('DATABASE', `Successfully fetched ${allItems.length} listings in ${duration}ms`, {
                itemCount: allItems.length,
                records: allItems
            });
        }
    } catch (err) {
        logSupabase('ERROR', 'Unexpected exception during fetchItems', { message: err.message });
        allItems = [];
    } finally {
        if (spinner) spinner.classList.add('hidden');
        updateStats();
        filterItems();
    }
}

/**
 * Renders real marketplace cards into the DOM.
 * @param {Array} items 
 */
function renderItems(items) {
    const grid = document.getElementById('items-grid');
    const emptyState = document.getElementById('empty-state');
    const currentUser = getCurrentUser();

    if (!grid) return;
    grid.innerHTML = '';

    if (!items || items.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    items.forEach(item => {
        const defaultImg = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
        const contactLink = buildContactURI(item.contact_method, item.contact_value, item.title);
        const isOwner = currentUser && (currentUser.id === item.user_id);
        const categoryBadgeClass = getCategoryBadgeClass(item.category);
        const formattedPrice = Number(item.price).toLocaleString();

        const card = document.createElement('article');
        card.className = 'item-card bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between shadow-sm relative group';
        card.setAttribute('data-id', item.id);

        card.innerHTML = `
            <div>
                <!-- Image Container with Zoom effect -->
                <div class="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer" onclick="openItemDetail('${item.id}')">
                    <img src="${item.image_url || defaultImg}" 
                         alt="${escapeHTML(item.title)}" 
                         loading="lazy"
                         onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80';"
                         class="card-img-zoom w-full h-full object-cover">
                    
                    <!-- Category Badge -->
                    <span class="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm ${categoryBadgeClass}">
                        ${escapeHTML(item.category)}
                    </span>

                    <!-- Condition Badge -->
                    ${item.condition ? `
                        <span class="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900/75 text-white backdrop-blur-sm">
                            ${escapeHTML(item.condition)}
                        </span>
                    ` : ''}

                    <!-- Campus Location Ribbon -->
                    ${item.campus_location ? `
                        <div class="absolute bottom-2 left-3 right-3 flex items-center gap-1 text-[11px] text-white bg-slate-900/60 backdrop-blur-md px-2 py-0.5 rounded-md font-medium truncate">
                            <span>📍</span> <span class="truncate">${escapeHTML(item.campus_location)}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Card Body -->
                <div class="p-4 sm:p-5">
                    <div class="flex items-start justify-between gap-2 mb-1">
                        <h3 class="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors cursor-pointer" onclick="openItemDetail('${item.id}')" title="${escapeHTML(item.title)}">
                            ${escapeHTML(item.title)}
                        </h3>
                    </div>

                    <p class="text-xl font-extrabold text-indigo-600 mb-2 brand-font tracking-tight">
                        KSh ${formattedPrice}
                    </p>

                    <p class="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                        ${escapeHTML(item.description)}
                    </p>
                </div>
            </div>

            <!-- Card Actions Footer -->
            <div class="p-4 sm:p-5 pt-0 space-y-2">
                <div class="flex items-center gap-2">
                    <button onclick="copyToClipboard('${escapeHTML(item.contact_value)}', this)" 
                            class="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition shadow-sm shadow-indigo-200 flex items-center justify-center gap-1.5"
                            title="Copy seller's ${escapeHTML(item.contact_method)}: ${escapeHTML(item.contact_value)}">
                        <span>📋</span>
                        <span>Copy ${escapeHTML(item.contact_method)}</span>
                    </button>

                    <button onclick="openItemDetail('${item.id}')" 
                            class="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                            title="View full item details">
                        View
                    </button>
                </div>

                ${isOwner ? `
                    <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button onclick="openEditItemModal('${item.id}')" class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition flex items-center gap-1" title="Edit this listing">
                            <span>✏️</span>
                            <span>Edit</span>
                        </button>
                        <button onclick="handleDeleteItem('${item.id}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition flex items-center gap-1" title="Delete this listing">
                            <span>🗑️</span>
                            <span>Delete</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        grid.appendChild(card);
    });
}

function getCategoryBadgeClass(category) {
    switch (category) {
        case 'Textbooks': return 'badge-textbooks';
        case 'Electronics': return 'badge-electronics';
        case 'Clothing': return 'badge-clothing';
        case 'Dorm Essentials': return 'badge-dorm';
        default: return 'badge-other';
    }
}

function getContactIcon(method) {
    switch (method) {
        case 'WhatsApp': return '💬';
        case 'Phone': return '📞';
        default: return '📞';
    }
}

// ----------------------------------------------------------------------------
// 2. CLIENT-SIDE SEARCH, CATEGORY & SORT FILTERING
// ----------------------------------------------------------------------------

export function filterItems() {
    const searchInput = document.getElementById('search-input');
    const query = (searchInput?.value || '').toLowerCase().trim();
    const clearBtn = document.getElementById('clear-search-btn');
    const sortFilter = document.getElementById('sort-filter')?.value || 'newest';
    const currentUser = getCurrentUser();

    if (clearBtn) {
        clearBtn.classList.toggle('hidden', query.length === 0);
    }

    let filtered = allItems.filter(item => {
        const titleMatch = (item.title || '').toLowerCase().includes(query);
        const descMatch = (item.description || '').toLowerCase().includes(query);
        const locationMatch = (item.campus_location || '').toLowerCase().includes(query);
        const matchesQuery = !query || titleMatch || descMatch || locationMatch;

        const matchesCategory = (activeCategory === 'ALL') || (item.category === activeCategory);

        return matchesQuery && matchesCategory;
    });

    if (sortFilter === 'price-asc') {
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortFilter === 'price-desc') {
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    renderItems(filtered);
    updateStats(filtered.length);
}

export function setCategory(category) {
    activeCategory = category;

    document.querySelectorAll('.category-pill').forEach(btn => {
        const cat = btn.getAttribute('data-category');
        if (cat === category) {
            btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
            btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
        } else {
            btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
            btn.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
        }
    });

    filterItems();
}

/**
 * Opens the dedicated My Listings overlay.
 */
export function openMyListingsModal() {
    renderMyListings();
    toggleModal('my-listings-modal', true);
}

/**
 * Dynamically populates the My Listings overlay.
 */
export function renderMyListings() {
    const body = document.getElementById('my-listings-body');
    const countBadge = document.getElementById('my-listings-count-badge');
    if (!body) return;

    const currentUser = getCurrentUser();
    if (!currentUser) {
        if (countBadge) countBadge.textContent = '0 Items';
        body.innerHTML = `
            <div class="py-12 px-4 text-center">
                <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                    🔒
                </div>
                <h3 class="text-base font-bold text-slate-900 brand-font">Student Sign-In Required</h3>
                <p class="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Please sign in with your student account to manage your listings, edit prices, or mark items as sold.
                </p>
                <div class="mt-5">
                    <button onclick="toggleModal('my-listings-modal', false); toggleModal('auth-modal', true)" class="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition">
                        Sign In Now
                    </button>
                </div>
            </div>
        `;
        return;
    }

    const myListings = allItems.filter(item => String(item.user_id) === String(currentUser.id));
    if (countBadge) {
        countBadge.textContent = `${myListings.length} Item${myListings.length === 1 ? '' : 's'}`;
    }

    if (myListings.length === 0) {
        body.innerHTML = `
            <div class="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4">
                    📦
                </div>
                <h3 class="text-base font-bold text-slate-900 brand-font">No Active Listings Yet</h3>
                <p class="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    You haven't posted any items on the campus market yet. Turn your textbooks, electronics, and dorm items into cash!
                </p>
                <div class="mt-5">
                    <button onclick="checkAuthAndOpenPostModal()" class="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition inline-flex items-center gap-1.5">
                        <span>+</span>
                        <span>Post Your First Item</span>
                    </button>
                </div>
            </div>
        `;
        return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';

    body.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            ${myListings.map(item => {
                const categoryBadgeClass = getCategoryBadgeClass(item.category);
                const formattedPrice = Number(item.price).toLocaleString();
                const dateFormatted = new Date(item.created_at || Date.now()).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                });

                return `
                    <div class="bg-white rounded-xl border border-slate-200/90 p-3.5 flex flex-col justify-between hover:border-indigo-300 transition shadow-sm group">
                        <div>
                            <div class="flex gap-3">
                                <!-- Thumbnail -->
                                <div class="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer" onclick="openItemDetail('${item.id}')">
                                    <img src="${item.image_url || defaultImg}" 
                                         alt="${escapeHTML(item.title)}" 
                                         class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                                </div>

                                <!-- Summary -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-1.5 mb-1">
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded ${categoryBadgeClass}">
                                            ${escapeHTML(item.category)}
                                        </span>
                                        ${item.condition ? `
                                            <span class="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                ${escapeHTML(item.condition)}
                                            </span>
                                        ` : ''}
                                    </div>
                                    <h4 class="font-bold text-sm text-slate-900 truncate hover:text-indigo-600 cursor-pointer" onclick="openItemDetail('${item.id}')" title="${escapeHTML(item.title)}">
                                        ${escapeHTML(item.title)}
                                    </h4>
                                    <p class="text-sm font-extrabold text-indigo-600 brand-font mt-0.5">
                                        KSh ${formattedPrice}
                                    </p>
                                    <p class="text-[11px] text-slate-400 truncate mt-0.5">
                                        📍 ${escapeHTML(item.campus_location || 'Main Campus')} • ${dateFormatted}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Action Controls -->
                        <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button onclick="openItemDetail('${item.id}')" class="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition">
                                View
                            </button>

                            <div class="flex items-center gap-1.5">
                                <button onclick="openEditItemModal('${item.id}')" class="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition shadow-sm active:scale-95" title="Edit listing details">
                                    <span>✏️</span>
                                    <span>Edit</span>
                                </button>
                                <button onclick="handleDeleteItem('${item.id}')" class="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition active:scale-95" title="Delete listing permanently">
                                    <span>🗑️</span>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

export function clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        filterItems();
    }
}

export function resetAllFilters() {
    clearSearch();
    setCategory('ALL');
    const sort = document.getElementById('sort-filter');
    if (sort) sort.value = 'newest';
    filterItems();
    showToast('Filters reset.', 'info');
}

function updateStats(count = allItems.length) {
    const statListing = document.getElementById('stat-active-listings');
    const badge = document.getElementById('items-count-badge');
    if (statListing) statListing.textContent = allItems.length;
    if (badge) badge.textContent = `${count} active item${count === 1 ? '' : 's'}`;
}

// ----------------------------------------------------------------------------
// 3. CONTACT URI GENERATION (WhatsApp, Email, Phone)
// ----------------------------------------------------------------------------

export function buildContactURI(method, value, title) {
    const safeTitle = title || 'your campus thrift listing';
    const encodedTitle = encodeURIComponent(safeTitle);

    if (method === 'WhatsApp') {
        const cleanNumber = (value || '').replace(/[^0-9]/g, '');
        const message = encodeURIComponent(`Hi! I'm a student interested in your campus thrift listing: "${safeTitle}". Is it still available?`);
        return `https://wa.me/${cleanNumber}?text=${message}`;
    } else if (method === 'Email') {
        const subject = encodeURIComponent(`Campus Thrift Inquiry: ${safeTitle}`);
        const body = encodeURIComponent(`Hi,\n\nI saw your listing for "${safeTitle}" on Campus Thrift Market and would like to arrange purchase and campus handover.\n\nThanks!`);
        return `mailto:${value}?subject=${subject}&body=${body}`;
    } else {
        const cleanPhone = (value || '').trim();
        return `tel:${cleanPhone}`;
    }
}

// ----------------------------------------------------------------------------
// 4. ITEM CREATION PIPELINE & STORAGE UPLOAD (STRICT SUPABASE)
// ----------------------------------------------------------------------------

export async function handlePostItem(event) {
    event.preventDefault();

    if (!isSupabaseConfigured()) {
        showToast('Supabase is not configured yet. Please enter your project credentials.', 'error');
        openConfigModal();
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Please sign in before posting or editing an item.', 'error');
        toggleModal('post-modal', false);
        toggleModal('auth-modal', true);
        return;
    }

    const submitBtn = document.getElementById('submit-item-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            ${editingItemId ? 'Saving Changes...' : 'Uploading to Supabase...'}
        `;
    }

    const title = document.getElementById('item-title').value.trim();
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    const condition = document.getElementById('item-condition').value;
    const location = document.getElementById('item-location').value.trim() || 'Main Campus';
    const description = document.getElementById('item-description').value.trim();
    const contactMethod = document.getElementById('item-contact-method').value;
    const contactValue = document.getElementById('item-contact-value').value.trim();
    const imageInput = document.getElementById('item-image');
    const imageFile = imageInput && imageInput.files ? imageInput.files[0] : null;

    let imageUrl = null;

    try {
        // Step 1: Upload Image to Supabase Cloud Storage bucket 'item-images' if a new file was chosen
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
            const filePath = `items/${fileName}`;

            logSupabase('STORAGE', `Uploading item image to Supabase Storage bucket 'item-images'`, {
                filePath,
                fileSize: imageFile.size,
                fileType: imageFile.type
            });

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('item-images')
                .upload(filePath, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                logSupabase('ERROR', 'Supabase image upload failed', uploadError);
                throw new Error(`Storage upload failed: ${uploadError.message}. Make sure 'item-images' bucket is created.`);
            }

            const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(filePath);
            imageUrl = urlData.publicUrl;
            logSupabase('STORAGE', 'Image uploaded successfully. Public URL generated', { imageUrl });
        }

        if (editingItemId) {
            // Step 2A: Update existing row in Supabase PostgreSQL 'items' table
            const updatePayload = {
                title,
                price,
                category,
                condition,
                campus_location: location,
                description,
                contact_method: contactMethod,
                contact_value: contactValue
            };
            if (imageUrl) {
                updatePayload.image_url = imageUrl;
            }

            logSupabase('DATABASE', `Updating item ${editingItemId} in public.items`, updatePayload);

            const { data: updatedData, error: updateError } = await supabase
                .from('items')
                .update(updatePayload)
                .eq('id', editingItemId)
                .eq('user_id', currentUser.id)
                .select()
                .single();

            if (updateError) {
                logSupabase('ERROR', 'Supabase item update failed', updateError);
                throw updateError;
            }

            logSupabase('DATABASE', 'Item successfully updated in Supabase items table', updatedData);
            showToast('✅ Listing updated successfully!', 'success');
            editingItemId = null;
        } else {
            // Step 2B: Insert new row into Supabase PostgreSQL 'items' table
            const itemRecord = {
                user_id: currentUser.id,
                title,
                price,
                category,
                condition,
                campus_location: location,
                description,
                image_url: imageUrl,
                contact_method: contactMethod,
                contact_value: contactValue
            };

            logSupabase('DATABASE', 'Inserting item row into public.items', itemRecord);

            const { data: insertedData, error: insertError } = await supabase
                .from('items')
                .insert([itemRecord])
                .select()
                .single();

            if (insertError) {
                logSupabase('ERROR', 'Supabase item insertion failed', insertError);
                throw insertError;
            }

            logSupabase('DATABASE', 'Item successfully persisted in Supabase items table', insertedData);
            showToast('🎉 Listing published live to Supabase!', 'success');
        }

        document.getElementById('post-item-form').reset();
        removeImagePreview();
        toggleModal('post-modal', false);
        await fetchItems();
        renderMyListings();
    } catch (err) {
        logSupabase('ERROR', 'Error during item creation/update pipeline', { message: err.message });
        showToast('Error saving listing: ' + err.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span id="submit-item-btn-text">${editingItemId ? 'Save Changes' : 'Publish Listing'}</span>`;
        }
    }
}

/**
 * Opens custom delete confirmation dialog for a listing (replaces browser confirm).
 * @param {string} itemId 
 */
export function openDeleteConfirmModal(itemId) {
    const item = allItems.find(i => String(i.id) === String(itemId));
    if (!item) return;

    pendingDeleteItemId = itemId;

    const titleEl = document.getElementById('delete-modal-item-title');
    if (titleEl) {
        titleEl.textContent = `"${item.title}"`;
    }

    const confirmBtn = document.getElementById('confirm-delete-action-btn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<span>Delete</span>`;
    }

    toggleModal('delete-confirm-modal', true);
}

export function closeDeleteConfirmModal() {
    pendingDeleteItemId = null;
    toggleModal('delete-confirm-modal', false);
}

export async function executeDeleteConfirmedItem() {
    if (!pendingDeleteItemId) return;
    const itemId = pendingDeleteItemId;

    const confirmBtn = document.getElementById('confirm-delete-action-btn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Deleting...
        `;
    }

    try {
        logSupabase('DATABASE', `Executing DELETE FROM public.items WHERE id = '${itemId}'`);
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', itemId);

        if (error) {
            logSupabase('ERROR', 'Supabase item deletion failed', error);
            throw error;
        }

        logSupabase('DATABASE', `Item ${itemId} deleted successfully from Supabase`);
        showToast('Listing removed permanently.', 'info');

        closeDeleteConfirmModal();
        toggleModal('detail-modal', false);

        await fetchItems();
        renderMyListings();
    } catch (err) {
        showToast('Could not delete listing: ' + err.message, 'error');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = `<span>Delete</span>`;
        }
    }
}

/**
 * Handles deleting an item strictly from Supabase via custom UI confirmation dialog.
 * @param {string} itemId 
 */
export function handleDeleteItem(itemId) {
    openDeleteConfirmModal(itemId);
}

// ----------------------------------------------------------------------------
// 5. ITEM DETAIL MODAL VIEW
// ----------------------------------------------------------------------------

export function openItemDetail(itemId) {
    const item = allItems.find(i => String(i.id) === String(itemId));
    if (!item) return;

    const modalBody = document.getElementById('detail-modal-body');
    if (!modalBody) return;

    const currentUser = getCurrentUser();
    const isOwner = currentUser && (currentUser.id === item.user_id);
    const contactLink = buildContactURI(item.contact_method, item.contact_value, item.title);
    const categoryBadgeClass = getCategoryBadgeClass(item.category);
    const formattedPrice = Number(item.price).toLocaleString();
    const dateFormatted = new Date(item.created_at || Date.now()).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    modalBody.innerHTML = `
        <div class="space-y-5">
            <!-- Full Item Image -->
            <div class="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                <img src="${item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}" 
                     alt="${escapeHTML(item.title)}" 
                     class="w-full h-full object-cover">
                
                <!-- Badges (Grouped on top-left, max 70% width to stay completely clear of close button) -->
                <div class="absolute top-3.5 left-3.5 flex items-center gap-2 max-w-[70%] flex-wrap z-20 pointer-events-none">
                    <span class="text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-md shadow-sm ${categoryBadgeClass}">
                        ${escapeHTML(item.category)}
                    </span>

                    ${item.condition ? `
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900/80 text-white backdrop-blur-sm shadow-sm">
                            ${escapeHTML(item.condition)}
                        </span>
                    ` : ''}
                </div>

                <!-- Floating Close Button (Top-Right: High contrast, elevated, floating squarely inside photo with 14px inset) -->
                <button onclick="toggleModal('detail-modal', false)" 
                        class="modal-close-floating-btn" 
                        title="Close (Esc)" 
                        aria-label="Close modal">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <!-- Details Header -->
            <div>
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 class="text-2xl font-bold text-slate-900 brand-font">${escapeHTML(item.title)}</h2>
                    <span class="text-2xl font-extrabold text-indigo-600 brand-font">KSh ${formattedPrice}</span>
                </div>
                
                <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                    <span class="flex items-center gap-1">
                        <span>📍</span> ${escapeHTML(item.campus_location || 'Main Campus')}
                    </span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                        <span>🕒</span> Posted ${dateFormatted}
                    </span>
                </div>
            </div>

            <!-- Item Description -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description & Condition</h4>
                <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">${escapeHTML(item.description)}</p>
            </div>

            <!-- Seller & Contact Channel Box -->
            <div class="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <span class="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">Seller Contact Number</span>
                    <p class="text-sm font-bold text-slate-800 mt-1 flex items-center gap-2">
                        <span>${item.contact_method === 'WhatsApp' ? '💬 WhatsApp:' : '📞 Phone:'}</span>
                        <span class="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200/60">${escapeHTML(item.contact_value)}</span>
                    </p>
                </div>

                <button onclick="copyToClipboard('${escapeHTML(item.contact_value)}', this)" 
                        class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
                    <span>📋</span>
                    <span>Copy ${escapeHTML(item.contact_method)} Number</span>
                </button>
            </div>

            ${isOwner ? `
                <div class="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                            <span>👑</span> You Own This Listing
                        </span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="openEditItemModal('${item.id}')" 
                                class="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm shadow-indigo-200 flex items-center justify-center gap-1.5">
                            <span>✏️</span>
                            <span>Edit Listing</span>
                        </button>
                        <button onclick="handleDeleteItem('${item.id}')" 
                                class="bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-rose-200 flex items-center justify-center gap-1.5">
                            <span>🗑️</span>
                            <span>Delete Listing</span>
                        </button>
                    </div>
                </div>
            ` : ''}

            <!-- Bottom Modal Footer Navigation -->
            <div class="pt-2 flex items-center justify-between border-t border-slate-100">
                <button onclick="toggleModal('detail-modal', false)" 
                        class="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5 active:scale-95">
                    <span>✕</span>
                    <span>Close Details</span>
                </button>
                <span class="text-[11px] text-slate-400">Click outside or press Esc</span>
            </div>
        </div>
    `;

    toggleModal('detail-modal', true);
}

// ----------------------------------------------------------------------------
// 6. STUDENT AUTHENTICATION FLOW
// ----------------------------------------------------------------------------

export async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value.trim();
    const phone = document.getElementById('auth-phone').value.trim();
    const submitBtn = document.getElementById('auth-submit-btn');

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = isSignUpMode ? 'Registering with Supabase...' : 'Signing in with Supabase...';
    }

    try {
        if (isSignUpMode) {
            await signUpStudent(email, password, name, phone);
            showToast('Student account registered in Supabase! You can now post listings.', 'success');
        } else {
            await signInStudent(email, password);
            showToast('Welcome back! Signed in to Supabase successfully.', 'success');
        }
        toggleModal('auth-modal', false);
        await fetchItems();
    } catch (err) {
        showToast(err.message, 'error');
        // If email already exists during sign up, switch to Sign In mode for seamless experience
        if (isSignUpMode && err.message && err.message.toLowerCase().includes('already exists')) {
            toggleAuthMode();
            const emailInput = document.getElementById('auth-email');
            const pwdInput = document.getElementById('auth-password');
            if (emailInput) emailInput.value = email;
            if (pwdInput) {
                pwdInput.value = '';
                pwdInput.focus();
            }
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = isSignUpMode ? 'Create Account' : 'Sign In';
        }
    }
}

export function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('auth-submit-btn');
    const signupFields = document.getElementById('signup-fields');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleBtn = document.getElementById('toggle-auth-btn');

    if (isSignUpMode) {
        if (title) title.innerText = 'Student Registration';
        if (subtitle) subtitle.innerText = 'Create your free account to sell items on campus';
        if (submitBtn) submitBtn.innerText = 'Create Account';
        if (signupFields) signupFields.classList.remove('hidden');
        if (toggleText) toggleText.innerText = 'Already have an account?';
        if (toggleBtn) toggleBtn.innerText = 'Sign In';
    } else {
        if (title) title.innerText = 'Student Sign In';
        if (subtitle) subtitle.innerText = 'Sign in with your student credentials to post items';
        if (submitBtn) submitBtn.innerText = 'Sign In';
        if (signupFields) signupFields.classList.add('hidden');
        if (toggleText) toggleText.innerText = 'Need a student account?';
        if (toggleBtn) toggleBtn.innerText = 'Create Account';
    }
}

export async function handleLogout() {
    await signOutStudent();
    showToast('Signed out of Supabase successfully.', 'info');
    filterItems();
}

export function checkAuthAndOpenPostModal() {
    if (!isSupabaseConfigured()) {
        showToast('Please configure your Supabase connection first.', 'error');
        openConfigModal();
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        showToast('Please sign in or create an account to post items.', 'info');
        toggleModal('auth-modal', true);
        return;
    }

    // Reset edit state to create new item
    editingItemId = null;
    const form = document.getElementById('post-item-form');
    if (form) form.reset();
    removeImagePreview();

    // Auto-fill student contact number if available from profile
    const profile = getCurrentProfile();
    const contactValueInput = document.getElementById('item-contact-value');
    if (profile && profile.phone_number && contactValueInput && !contactValueInput.value) {
        contactValueInput.value = profile.phone_number;
    }
    const locationInput = document.getElementById('item-location');
    if (profile && profile.campus_location && locationInput && !locationInput.value) {
        locationInput.value = profile.campus_location;
    }

    const titleEl = document.getElementById('post-modal-title');
    const subtitleEl = document.getElementById('post-modal-subtitle');
    const btnTextEl = document.getElementById('submit-item-btn-text');

    if (titleEl) titleEl.textContent = 'List an Item for Sale';
    if (subtitleEl) subtitleEl.textContent = 'Connect directly with students on campus via WhatsApp, Phone, or Email.';
    if (btnTextEl) btnTextEl.textContent = 'Publish Listing';

    // Close My Listings overlay if open so user can post cleanly
    toggleModal('my-listings-modal', false);
    toggleModal('post-modal', true);
}

/**
 * Opens the post/edit modal in Edit Mode for an existing listing.
 * @param {string} itemId 
 */
export function openEditItemModal(itemId) {
    const item = allItems.find(i => String(i.id) === String(itemId));
    if (!item) {
        showToast('Item not found', 'error');
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.id !== item.user_id) {
        showToast('Only the seller who created this listing can edit it.', 'error');
        return;
    }

    editingItemId = itemId;

    // Prepopulate form fields
    const titleInput = document.getElementById('item-title');
    const priceInput = document.getElementById('item-price');
    const categoryInput = document.getElementById('item-category');
    const conditionInput = document.getElementById('item-condition');
    const locationInput = document.getElementById('item-location');
    const descriptionInput = document.getElementById('item-description');
    const contactMethodInput = document.getElementById('item-contact-method');
    const contactValueInput = document.getElementById('item-contact-value');

    if (titleInput) titleInput.value = item.title || '';
    if (priceInput) priceInput.value = item.price || '';
    if (categoryInput) categoryInput.value = item.category || 'Other';
    if (conditionInput) conditionInput.value = item.condition || 'Gently Used';
    if (locationInput) locationInput.value = item.campus_location || '';
    if (descriptionInput) descriptionInput.value = item.description || '';
    if (contactMethodInput) contactMethodInput.value = item.contact_method || 'WhatsApp';
    if (contactValueInput) contactValueInput.value = item.contact_value || '';

    // Image preview handling
    const previewContainer = document.getElementById('image-preview-container');
    const previewImageEl = document.getElementById('image-preview');
    const uploadPrompt = document.getElementById('upload-prompt');
    const imageInput = document.getElementById('item-image');
    if (imageInput) imageInput.value = '';

    if (item.image_url && previewContainer && previewImageEl && uploadPrompt) {
        previewImageEl.src = item.image_url;
        previewContainer.classList.remove('hidden');
        uploadPrompt.classList.add('hidden');
    } else {
        removeImagePreview();
    }

    // Update modal headings and submit button text
    const titleEl = document.getElementById('post-modal-title');
    const subtitleEl = document.getElementById('post-modal-subtitle');
    const btnTextEl = document.getElementById('submit-item-btn-text');

    if (titleEl) titleEl.textContent = 'Edit Campus Listing';
    if (subtitleEl) subtitleEl.textContent = 'Update price, location, condition, description, or contact information.';
    if (btnTextEl) btnTextEl.textContent = 'Save Changes';

    // Close other overlays and open post modal in edit mode
    toggleModal('detail-modal', false);
    toggleModal('my-listings-modal', false);
    toggleModal('post-modal', true);
}

// ----------------------------------------------------------------------------
// 7. SUPABASE CONFIGURATION MODAL & STATUS
// ----------------------------------------------------------------------------

export function openConfigModal() {
    const urlInput = document.getElementById('cfg-url');
    const keyInput = document.getElementById('cfg-key');
    if (urlInput) urlInput.value = isSupabaseConfigured() ? getSupabaseUrl() : (getSupabaseUrl() === 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co' ? '' : getSupabaseUrl());
    if (keyInput) keyInput.value = isSupabaseConfigured() ? getSupabaseAnonKey() : (getSupabaseAnonKey() === 'YOUR_SUPABASE_ANON_KEY' ? '' : getSupabaseAnonKey());
    toggleModal('config-modal', true);
}

export function handleSaveConfig() {
    const url = document.getElementById('cfg-url').value.trim();
    const key = document.getElementById('cfg-key').value.trim();

    if (!url || !key) {
        showToast('Please provide both the Supabase URL and Anon Key.', 'error');
        return;
    }

    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
        showToast('Please enter a valid Supabase URL (e.g. https://xyz.supabase.co)', 'error');
        return;
    }

    saveSupabaseConfig(url, key);
    showToast('Supabase credentials saved! Connecting to live backend...', 'success');
    setTimeout(() => window.location.reload(), 600);
}

export function handleClearConfig() {
    clearSupabaseConfig();
    showToast('Cleared Supabase credentials from local storage. Reloading...', 'info');
    setTimeout(() => window.location.reload(), 600);
}

function updateBackendStatusBadge() {
    const statusText = document.getElementById('backend-status-text');
    const statusPill = document.getElementById('backend-status-pill');

    if (isSupabaseConfigured()) {
        if (statusText) statusText.textContent = 'Supabase Connected';
        if (statusPill) {
            statusPill.classList.remove('bg-rose-50', 'text-rose-700', 'border-rose-200');
            statusPill.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
        }
    } else {
        if (statusText) statusText.textContent = 'Supabase: Enter API Key';
        if (statusPill) {
            statusPill.classList.remove('bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
            statusPill.classList.add('bg-rose-50', 'text-rose-700', 'border-rose-200');
        }
    }
}

function showUnconfiguredNotice() {
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.innerHTML = `
            <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                ⚡
            </div>
            <h3 class="text-lg font-bold text-slate-800">Supabase Not Connected</h3>
            <p class="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                All mock/stub data has been removed. Please enter your Supabase Project URL and Public Anon Key to load live marketplace items.
            </p>
            <div class="mt-5 flex justify-center gap-3">
                <button onclick="openConfigModal()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-200">
                    Connect Supabase Now
                </button>
            </div>
        `;
        emptyState.classList.remove('hidden');
    }
}

// ----------------------------------------------------------------------------
// 8. IMAGE PREVIEW & FORM UTILITIES
// ----------------------------------------------------------------------------

export function previewImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image file size must be less than 5MB.', 'error');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('image-preview');
            const previewContainer = document.getElementById('image-preview-container');
            const uploadPrompt = document.getElementById('upload-prompt');
            
            if (preview) preview.src = e.target.result;
            if (previewContainer) previewContainer.classList.remove('hidden');
            if (uploadPrompt) uploadPrompt.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

export function removeImagePreview(event) {
    if (event) event.stopPropagation();
    const imageInput = document.getElementById('item-image');
    const previewContainer = document.getElementById('image-preview-container');
    const uploadPrompt = document.getElementById('upload-prompt');
    
    if (imageInput) imageInput.value = '';
    if (previewContainer) previewContainer.classList.add('hidden');
    if (uploadPrompt) uploadPrompt.classList.remove('hidden');
}

export function updateContactPlaceholder() {
    const method = document.getElementById('item-contact-method').value;
    const input = document.getElementById('item-contact-value');
    const helper = document.getElementById('contact-helper-text');

    if (method === 'WhatsApp') {
        input.placeholder = '+254712345678';
        helper.textContent = 'Enter WhatsApp number (e.g. +254 712 345 678). Buyers will copy your number with one click.';
    } else {
        input.placeholder = '+254712345678';
        helper.textContent = 'Enter phone number for direct voice calls. Buyers will copy your number with one click.';
    }
}

/**
 * Automatically copies phone or WhatsApp contact number to clipboard.
 * @param {string} text 
 * @param {HTMLElement} btnElement 
 */
export async function copyToClipboard(text, btnElement) {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        showToast(`📋 Copied "${text}" to clipboard!`, 'success');
        
        if (btnElement) {
            const originalHTML = btnElement.innerHTML;
            btnElement.classList.add('bg-emerald-600');
            btnElement.classList.remove('bg-indigo-600');
            btnElement.innerHTML = `<span>✓</span><span>Copied!</span>`;
            setTimeout(() => {
                btnElement.innerHTML = originalHTML;
                btnElement.classList.remove('bg-emerald-600');
                btnElement.classList.add('bg-indigo-600');
            }, 2000);
        }
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast(`📋 Copied "${text}" to clipboard!`, 'success');
        } catch (e) {
            showToast(`Contact: ${text}`, 'info');
        }
        document.body.removeChild(textArea);
    }
}

// ----------------------------------------------------------------------------
// 9. MODALS & TOAST NOTIFICATION SYSTEM
// ----------------------------------------------------------------------------

export function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (show) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

export function closeAllModals() {
    pendingDeleteItemId = null;
    const activeModals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
    activeModals.forEach(modal => {
        toggleModal(modal.id, false);
    });
}

export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
        <span class="text-base flex-shrink-0">${icon}</span>
        <span class="flex-grow text-xs font-medium text-slate-800">${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------------------
// 10. PHONE FRAME & MOBILE APP INTERACTIONS
// ----------------------------------------------------------------------------

export function togglePhoneFrame() {
    const isFrameActive = document.body.classList.toggle('phone-frame-active');
    const icon = document.getElementById('phone-mode-icon');
    const text = document.getElementById('phone-mode-text');

    if (isFrameActive) {
        if (icon) icon.textContent = '💻';
        if (text) text.textContent = 'Desktop View';
        showToast('📱 Switched to Phone Frame Simulator view', 'info');
    } else {
        if (icon) icon.textContent = '📱';
        if (text) text.textContent = 'Phone Frame View';
        showToast('💻 Expanded to Responsive Desktop view', 'info');
    }
}

export function scrollToFeed() {
    const feed = document.getElementById('items-grid');
    if (feed) {
        feed.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

export function focusSearchInput() {
    const input = document.getElementById('search-input');
    if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => input.focus(), 250);
    }
}

export function handleMobileAuthAction() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        handleLogout();
    } else {
        toggleModal('auth-modal', true);
    }
}
