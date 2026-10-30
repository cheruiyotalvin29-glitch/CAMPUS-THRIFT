# 🎓 Campus Online Thrift Market

> A decentralized, low-complexity peer-to-peer (P2P) campus thrift marketplace designed for university students to buy, sell, and hand down textbooks, electronics, dorm essentials, and clothing with zero transaction fees and direct WhatsApp contact.

---

## 🌟 Architectural Overview

Traditional campus commerce on instant messaging groups and social media status posts suffers from rapid message depreciation, lack of persistent indexing, absence of category filtering, and high friction. 

**Campus Online Thrift Market** solves this with a **Zero-Build-Step Single-Page Application (SPA)** backed directly by **Supabase Backend-as-a-Service (BaaS)**:

- **Frontend:** Pure HTML5, Modern Vanilla JavaScript (ES6+ Modules), and utility-first Tailwind CSS loaded via CDN.
- **Backend:** Supabase PostgreSQL with automated Row Level Security (RLS) policies.
- **Authentication:** Supabase Auth (JWT session management, email/password verification).
- **File Storage:** Supabase Cloud Storage bucket (`item-images`) with public CDN URLs.
- **P2P Communication:** Direct deep-linked URI protocols (`https://wa.me/`, `mailto:`, `tel:`) bypassing server-side chat overhead.
- **Zero Node.js Rot:** No `npm install`, Webpack, Vite, or local transpilation pipelines required.

---

## 📁 Repository Structure

```
campus-thrift-market/
│
├── index.html              # Main responsive Single-Page Application markup & modal dialogs
├── styles.css              # Custom design system tokens, glassmorphism, animations & toasts
│
├── js/
│   ├── supabaseClient.js   # ESM CDN-based Supabase client initializer & config manager
│   ├── auth.js             # Student authentication, session persistence & UI state sync
│   └── app.js              # Core engine: search, category filtering, image uploads, DOM logic
│
├── sql/
│   └── schema.sql          # PostgreSQL DDL: profiles & items tables, RLS policies, storage bucket
│
├── research/
│   └── c.md                # System architectural blueprint and project specification
│
└── README.md               # Operational setup manual, deployment guide & team breakdown
```

---

## 🚀 Quick Start Guide

### 1. One-Click Free Vercel Deployment

Deploy this project on Vercel's free/hobby tier in under 60 seconds with zero build steps:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcheruiyotalvin29-glitch%2FCAMPUS-THRIFT)

1. Click the **Deploy** button above or go to [Vercel](https://vercel.com/new).
2. Import the `cheruiyotalvin29-glitch/CAMPUS-THRIFT` repository.
3. Keep **Framework Preset** as **Other** (Root directory: `./`). No build command or output directory is required.
4. Click **Deploy**. Your campus marketplace is live instantly with free HTTPS, CDN caching, and custom domain support!

---

### 2. Running Locally (No Build Tools Needed!)
Because this application runs on native web standards and ESM modules, you can serve it with any local static HTTP server.

Using Python 3 (installed on most systems):
```bash
# In the repository root (uses multithreaded server with zero-caching):
python server.py 8000
```
Then open your browser to:
```
http://127.0.0.1:8000
```
*(Tip: Using `http://127.0.0.1:8000` instead of `localhost` prevents browser proxy/VPN extensions from intercepting local requests).*

*Note: Due to browser security restrictions on ES6 modules loaded via `file://`, running through a local server (`localhost:8000`) is required.*

---

## ⚡ Supabase Cloud Backend Setup

To connect the application to your live Supabase cloud backend:

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com/) and create a new project.
2. Note your **Project URL** and **Anon Public API Key** from **Project Settings > API**.

### Step 2: Run Database Initialization Script
1. Navigate to the **SQL Editor** tab in the Supabase Dashboard.
2. Open [`sql/schema.sql`](file:///C:/Users/G_R_E/Documents/REPOSITORIES/campus%20thrift%20market/sql/schema.sql) in this repository and paste the entire script into the SQL editor.
3. Click **Run**.
   - This sets up:
     - `public.profiles` (linked to `auth.users`)
     - `public.items` (with price constraints and contact details)
     - Row Level Security (RLS) policies for secure public reading and owner-only editing
     - Public storage bucket `item-images` with upload permissions
     - Automatic user profile trigger `on_auth_user_created`

### Step 3: Link Credentials
You can connect your credentials in **two ways**:

- **Option A (In-App GUI - Easiest):**
  Open the app in your browser, click the **Supabase Ready / Backend Config** pill in the top header, paste your `Project URL` and `Anon Key`, and click **Connect Supabase**.

- **Option B (Direct Code):**
  In [`js/supabaseClient.js`](file:///C:/Users/G_R_E/Documents/REPOSITORIES/campus%20thrift%20market/js/supabaseClient.js), replace the placeholder constants:
  ```javascript
  export const DEFAULT_SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
  export const DEFAULT_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
  ```

---

## 🛡️ Prototype & Offline Demo Mode

If you run the application before configuring live Supabase credentials, the system automatically launches in **Demo Mode**:
- Pre-loads 8 realistic campus thrift items across Textbooks, Electronics, Dorm Essentials, and Clothing.
- Allows full interactive testing of keyword search, category pills, price sorting, and item detail modals.
- Allows simulated student sign-in/sign-up and listing creation with local browser storage.
- Easily toggle between Demo Mode and Live Supabase via the header configuration modal!

---

## 👥 Team Ownership & Operational Breakdown

As planned in the architectural blueprint ([research/c.md](file:///C:/Users/G_R_E/Documents/REPOSITORIES/campus%20thrift%20market/research/c.md)):

| Role | Member Allocation | Primary Deliverables | Target Modules |
| :--- | :--- | :--- | :--- |
| **Database & Backend Lead** | Person 1 | PostgreSQL DDL, RLS policies, Storage buckets, Auth engine | `sql/schema.sql`, `js/supabaseClient.js`, `js/auth.js` |
| **Frontend & UI/UX Lead** | Person 2 | Semantic HTML structure, Tailwind CSS styling, responsive layout, modals | `index.html`, `styles.css` |
| **Integration Lead** | Person 3 | Dynamic DOM rendering, live filtering, image upload, URI generation | `js/app.js` |
| **QA & Documentation Lead** | Person 4 | Edge-case verification, seed data, setup guide, cross-device testing | `README.md`, test suites |

---

## 🧪 Acceptance & Verification Checklist

- [x] **Zero Build Tooling:** Starts directly in browser without npm or bundler installation.
- [x] **Relational Schema:** Foreign keys cleanly connect `items.user_id` to `profiles.id` and `auth.users(id)`.
- [x] **Database Security:** Row Level Security (RLS) prevents non-owners from editing or deleting listings.
- [x] **Real-Time Client Search:** Instant query filtering across title, description, and campus location.
- [x] **Category Selectors:** Instant filtering across Textbooks, Electronics, Clothing, Dorm Gear, and Other.
- [x] **Sorting Engine:** Chronological (newest), price ascending, and price descending sorts.
- [x] **Direct Contact Deep Links:**
  - WhatsApp: `https://wa.me/[phone]?text=[prefilled_inquiry]`
  - Email: `mailto:[email]?subject=[item_title]`
  - Phone: `tel:[phone]`
- [x] **User Ownership:** Logged-in students can view and delete their own items via the "My Listings" tab and detail modal.
- [x] **Image Upload & Preview:** Drag-and-drop file upload with live client thumbnail preview.
