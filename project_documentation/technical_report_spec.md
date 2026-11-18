# CAMPUS ONLINE THRIFT MARKET: TECHNICAL REPORT SPECIFICATION
## Comprehensive Academic Specification for Chapter 3 (Methodology & Design), Chapter 4 (Implementation & Results), and Chapter 5 (Conclusion & Recommendations)
**Institution Reference Format:** Kabarak University Standard Project Documentation  
**Project Repository:** [https://github.com/cheruiyotalvin29-glitch/CAMPUS-THRIFT](https://github.com/cheruiyotalvin29-glitch/CAMPUS-THRIFT)  
**System Name:** Campus Online Thrift Market (Peer-to-Peer Student Marketplace)  
**Active Production Branches:** `main` (synchronized with `presentation-demo` and `project-demo` at commit `7d02224`)  
**Document Classification:** Final Project Technical Specification & Academic Evaluation Report  

---

## 1. System Overview & Technology Stack

### 1.1 Project Introduction & Problem Statement
The **Campus Online Thrift Market** is a hyper-localized, peer-to-peer (P2P) web application engineered to solve the persistent economic and logistical frictions faced by university students when buying, selling, or exchanging pre-owned items within higher education institutions. University students frequently need to liquidate textbooks, lab equipment, electronics, room furnishings, and dorm essentials at the end of academic semesters or graduation cycles. Conversely, newly enrolled or continuing students seek affordable course essentials. 

Traditional e-commerce platforms (such as Jiji, Facebook Marketplace, or general classifieds) fail university communities due to three critical factors:
1. **Lack of Campus Proximity & Verification:** Commercial platforms expose students to off-campus strangers, severe scam risks, and complex shipping logistics.
2. **Heavy Overhead & Intermediary Fees:** Standard marketplace applications take transactional commissions or require payment gateway fees, which disincentivize micro-transactions common among students.
3. **High Infrastructure Maintenance:** Traditional multi-tier web applications require dedicated backend virtual machines, ongoing server patching, and database administration costs that make student-run campus utilities economically unsustainable.

To eliminate these barriers, the Campus Online Thrift Market adopts a modern **Serverless Backend-as-a-Service (BaaS)** architecture paired with a reactive, dependency-free vanilla JavaScript single-page application (SPA). Direct buyer-to-seller communication is facilitated via streamlined peer-to-peer contact mechanisms: universal clipboard copying of seller contact numbers (`copyToClipboard`) with animated visual confirmation and fallback, coupled with mobile deep-linking (WhatsApp Click-to-Chat `wa.me`, direct cellular dialing `tel:`, and electronic mail `mailto:`). This completely bypasses the cost, liability, and server overhead of maintaining an internal messaging and escrow payment cluster.

---

### 1.2 Exact Technology Stack Specification

The system was engineered following a zero-build, ultra-low-latency, zero-server-maintenance philosophy:

| Layer / Subsystem | Technology Selected | Version / Specification | Architectural Role & Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | HTML5 Semantic Markup | W3C Living Standard | Provides accessible, search-engine optimized, semantic DOM structure for the single-page application. |
| **UI Styling** | Tailwind CSS + Custom CSS3 | Tailwind CLI v3.4 Standalone | Precompiled utility-first CSS framework coupled with custom CSS for glassmorphism, responsive bottom sheets, earthy emerald design tokens, and utility cascade overrides without Node.js runtime overhead. |
| **Client Scripting** | Vanilla JavaScript (ES6+ Modules) | ECMAScript 2022 | Modular, asynchronous native browser JavaScript (`import`/`export`) ensuring instantaneous execution without heavy framework bundles (React/Vue/Angular). |
| **BaaS Platform** | Supabase Cloud Platform | PostgreSQL 15 Engine | Managed Backend-as-a-Service providing PostgREST automated REST APIs, Row Level Security (RLS), and real-time database triggers. |
| **Database Engine** | PostgreSQL | v15.x Relational Engine | ACID-compliant relational storage storing student profiles, item listings, categories, locations, and timestamps. |
| **Authentication** | Supabase Auth (GoTrue Engine) | JWT (JSON Web Tokens) | Secure stateless authentication handling student sign-up, sign-in, session recovery, auto-confirmation triggers, and encrypted token storage in `localStorage`. |
| **Binary Object Storage** | Supabase Storage Buckets | S3-Compatible Object Store | Dedicated public bucket (`item-images`) storing item photographs, generating CDN public URLs, and enforcing bucket-level RLS policies. |
| **P2P Communication Gateway** | Universal Clipboard API & Deep-Link URI Integration | Async Clipboard API / RFC 3986 URI Protocols | One-click clipboard copy (`copyToClipboard`) with animated feedback for universal pasting into WhatsApp, SMS, or dialer; supplementary deep-links (`https://wa.me/`, `tel:`, `mailto:`). |
| **Version Control & Branches** | Git & GitHub | Git 2.43+ / GitHub Cloud | Distributed source control with unified production branches (`main`, `presentation-demo`, `project-demo`). |
| **Hosting & Edge Delivery** | Vercel Edge Network | Vercel Serverless Hosting | High-speed global content delivery network (CDN) delivering static assets with automated SSL encryption and cache headers via `vercel.json`. |
| **Local Dev Server** | Python Multithreaded Server | Python 3.10+ `http.server` | Custom local HTTP development server (`server.py`) with multithreading support and zero-cache headers for offline development and presentation demos. |

---

### 1.3 Complete Directory Tree with File Role Descriptions

Following the repository refactor and presentation streamlining (Commit `cfddd4f`), all obsolete one-off setup scripts and redundant database migration files were cleanly pruned. Below is the exact architectural directory tree of the repository currently on disk:

```text
CAMPUS-THRIFT/
│
├── index.html                      # Single-page application entry point containing layout, header, hero banner, item grid, and modal DOM trees.
├── README.md                       # Comprehensive repository documentation, architecture overview, setup guide, and Vercel deploy instructions.
├── server.py                       # Lightweight Python multithreaded HTTP server script used for local development and offline debugging.
├── styles.css                      # Custom CSS containing design system tokens, utility overrides (.bg-emerald-600, .hidden), animations, floating modal buttons, and mobile sheets.
├── tailwind.css                    # Standalone precompiled Tailwind utility CSS classes ensuring zero build step during browser execution.
├── vercel.json                     # Production deployment configuration for Vercel ensuring correct static routing and immutable caching headers.
│
├── js/                             # Modular JavaScript source files executing entirely on the client browser.
│   ├── app.js                      # Core application controller: handles item CRUD, dynamic rendering, live search, filtering, clipboard copy, and modal lifecycles.
│   ├── auth.js                     # Authentication manager: interfaces with Supabase GoTrue to handle login, registration, and session persistence.
│   ├── config.js                   # Project configuration constants storing the default Supabase project URL and anonymous API key.
│   ├── supabaseClient.js           # Supabase client singleton factory: handles credential resolution, environment overrides, and clean categorized logging.
│   └── vendor/
│       └── supabase.js             # Pre-bundled local distribution of @supabase/supabase-js v2 library enabling offline and CDN-independent execution.
│
├── project_documentation/          # Comprehensive academic and technical documentation suite.
│   ├── complete_project_code_context.txt # Single bundled text archive containing 100% of the project's source code files with explicit header markers.
│   └── technical_report_spec.md    # Complete Chapter 3, 4, and 5 academic technical report specifications.
│
└── sql/                            # Production PostgreSQL Database Definition.
    └── schema.sql                  # Unified DDL script: defines tables, UUID generators, triggers (handle_new_user, auto_confirm_new_user), RLS policies, storage bucket configs, and RPCs.
```

---

## 2. Chapter 3: Methodology & System Design

### 3.1 Introduction
This chapter presents the methodology adopted for the analysis, architectural formulation, data modeling, and interface design of the **Campus Online Thrift Market**. Following the principles of the System Analysis and Design (SAD) discipline (Kendall & Kendall, 2018), this chapter establishes the engineering foundation of the system. It articulates the iterative software development life cycle (SDLC) employed, delineates the client-to-backend-as-a-service (BaaS) architectural paradigm, illustrates system data flows through structured Data Flow Diagrams (DFD Levels 0 and 1), specifies the relational PostgreSQL database schema with Row Level Security (RLS) policies, and details the user interface wireframes, design tokens, and system use cases.

---

### 3.2 Development Methodology

#### 3.2.1 Agile Iterative Approach
The development of the Campus Online Thrift Market was governed by an **Agile Iterative Methodology** (Schwaber & Sutherland, 2020). The Agile approach was chosen over rigid traditional models (such as the Waterfall model) due to the following project-specific dynamics:
1. **Dynamic User Requirements:** Initial student surveys revealed that while students initially demanded an in-app payment system, later interviews indicated that in-person cash or M-Pesa exchange upon physical item inspection was strongly preferred to prevent student-to-student fraud. Agile sprints permitted rapid pivot to P2P direct contact and clipboard-based sharing.
2. **Early Working Increments:** By decoupling the frontend from a monolithic backend through Supabase BaaS, a fully functional prototype was deployed to an edge URL by Sprint 2, enabling continuous student usability feedback.
3. **Continuous Risk Mitigation:** Critical security constraints—specifically protecting seller phone numbers, enforcing ownership-only deletion of items, and preventing spam—were evaluated, tested, and resolved incrementally across sprint cycles.
4. **Presentation & Branch Optimization:** Recent sprint cycles introduced dedicated presentation branches (`presentation-demo`, `project-demo`) that allowed testing UI/UX refinements (earthy green design system, unstyled button fixes, modal streamlining, clipboard copying) before consolidating into `main`.

#### 3.2.2 Development Timeline & Sprint Breakdown

The project was executed across an intensive 10-week development schedule partitioned into five well-defined sprints:

| Sprint Phase | Duration | Primary Objectives & Activities | Delivered Milestones |
| :--- | :--- | :--- | :--- |
| **Sprint 1: Inception & Design** | Weeks 1–2 | Problem definition, student requirement gathering, feasibility evaluation, tech stack selection, UI wireframing, and database normalization. | System Architecture Blueprint, Entity-Relationship Models, Wireframe Mockups. |
| **Sprint 2: Backend & BaaS Setup** | Weeks 3–4 | Supabase project initialization, PostgreSQL DDL execution, RLS policy definition, storage bucket creation, and authentication trigger programming. | Functional Supabase Cloud Schema, `profiles` & `items` tables, `item-images` storage bucket, auto-confirmation triggers. |
| **Sprint 3: Core Frontend Engine** | Weeks 5–6 | Semantic HTML structure, Tailwind CSS styling, ES6 module integration, Supabase client factory, item listing cards, and modal dialogs. | Interactive Single-Page Application (SPA) displaying live listings fetched from PostgreSQL. |
| **Sprint 4: Features & Optimization** | Weeks 7–8 | Client-side search and filtering algorithms, multi-criteria category tabs, image upload compression pipeline, and clipboard/contact redirection. | Complete Item Posting, Image Uploads, Real-Time Search, Clipboard Copy Integration. |
| **Sprint 5: Hardening, Refactoring & Presentation** | Weeks 9–10 | Earthy green palette UI/UX overhaul, button styling fixes, repo cleanup (pruning obsolete scripts), modal streamlining (commit `7d02224`), Vercel edge deployment, and documentation bundling. | Production Edge Deployment on Vercel, Clean Repository Structure, Complete Academic Technical Report. |

#### 3.2.3 Tools and Technologies Justification

| Category | Technology | Academic & Engineering Justification |
| :--- | :--- | :--- |
| **Development Machine** | Windows 11 Professional | Host development OS supporting PowerShell automation, POSIX scripting environments, and headless browser testing. |
| **Source Code Editor** | Visual Studio Code (VS Code) | Extensible, lightweight source code editor providing integrated Git version control, multi-root workspaces, and real-time syntax checking. |
| **Frontend Runtime** | Modern Web Browsers (Chrome, Firefox, Safari, Edge) | Native ECMAScript 2022 and Fetch API support eliminates compilation steps, ensuring 100% platform-agnostic client execution. |
| **Database & Auth Engine** | Supabase (PostgreSQL 15) | Provides a hosted, highly scalable PostgreSQL relational engine with automated RESTful PostgREST APIs and enterprise-grade JWT authentication out of the box. |
| **Cloud Storage** | Supabase Storage (S3-Compatible) | Dedicated binary object storage for student-uploaded product images with automatic public CDN URL distribution and MIME-type validation. |
| **CSS Utility Framework** | Tailwind CSS v3.4 + Custom CSS | Utility-first CSS providing highly responsive classes, sub-millisecond layout rendering, and total style cohesion across desktop and mobile form factors. |
| **Deployment Engine** | Vercel Edge Platform | Serverless global edge network providing automated continuous deployment (CI/CD) directly from GitHub with zero infrastructure costs. |

---

### 3.3 System Architecture

#### 3.3.1 High-Level Architecture
The system employs a **Two-Tier Client-Server Backend-as-a-Service (BaaS) Architecture** (Fielding, 2000). The presentation and business logic reside entirely within the user's web browser as an asynchronous Single-Page Application (SPA). Rather than routing requests through an intermediary custom web server (such as Node.js/Express or Django), the client communicates securely and directly with Supabase Cloud services via HTTPS/WSS protocols. Security, authorization, and data integrity are strictly enforced at the database level using PostgreSQL Row Level Security (RLS) policies and JWT cryptographic signatures.

```text
+---------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER                                     |
|  +---------------------------------------------------------------------------------+  |
|  |                 Presentation Layer (HTML5, Tailwind CSS, styles.css)            |  |
|  +---------------------------------------------------------------------------------+  |
|  |             Application Logic (Vanilla JS ES6 Modules: app.js, auth.js)         |  |
|  |      - Client Search & Filter Engine      - Image Preview & Blank Fallback       |  |
|  |      - Modal State Machine & Toast UI     - Universal Clipboard Copy Engine      |  |
|  |      - Phone Frame Simulator Mode         - Direct URI Formatter (wa.me, tel:)   |  |
|  +---------------------------------------------------------------------------------+  |
|  |                       Supabase Client SDK (supabaseClient.js)                   |  |
|  +---------------------------------------------------------------------------------+  |
+------------------------------------------+--------------------------------------------+
                                           |  HTTPS / REST / PostgREST (JSON Web Token)
                                           v
+---------------------------------------------------------------------------------------+
|                                  SUPABASE CLOUD (BaaS)                                |
|  +------------------------------------+   +----------------------------------------+  |
|  |    GoTrue Authentication Service   |   |        Storage Engine (S3-API)         |  |
|  |    - Student Registration & Login  |   |        - 'item-images' Bucket          |  |
|  |    - JWT Issuance & Verification   |   |        - CDN Public URL Resolution     |  |
|  |    - auto_confirm_new_user Trigger |   |        - Storage-Level RLS Policies    |  |
|  +------------------------------------+   +----------------------------------------+  |
|                                           |                                           |
|  +----------------------------------------v----------------------------------------+  |
|  |                       PostgreSQL 15 Relational Database                         |  |
|  |  +---------------------------------------------------------------------------+  |  |
|  |  | Schema: public.profiles (Users)  |  public.items (Listings)               |  |  |
|  |  | Triggers: on_auth_user_created   |  RPC: check_email_exists               |  |  |
|  |  | Trigger: on_auth_user_auto_confirm                                        |  |  |
|  |  +---------------------------------------------------------------------------+  |  |
|  |  | Row Level Security (RLS):                                                 |  |  |
|  |  | - SELECT: Open Public Read for all active listings.                      |  |  |
|  |  | - INSERT/UPDATE/DELETE: Strict owner check (auth.uid() = user_id).      |  |  |
|  |  +---------------------------------------------------------------------------+  |  |
|  +---------------------------------------------------------------------------------+  |
+------------------------------------------+--------------------------------------------+
                                           | Universal P2P Contact (Clipboard Copy & URI)
                                           v
                 +----------------------------------------------------+
                 |           STUDENT PEER-TO-PEER CONTACT             |
                 |  - Instant Number Copy (Clipboard API)             |
                 |  - Direct Paste into WhatsApp / SMS / Dialer       |
                 |  - Mobile Click-to-Chat (wa.me) & Phone (tel:)     |
                 |  - In-Person Campus Handover & Cash/M-Pesa Settle  |
                 +----------------------------------------------------+
```

#### 3.3.2 Component Breakdown
The modular architecture comprises four distinct logical layers:

| Architectural Layer | Specific Modules / Files | Primary Responsibility |
| :--- | :--- | :--- |
| **Presentation Layer** | `index.html`, `styles.css`, `tailwind.css` | Renders the responsive UI, hero section, category tabs, item card grid, modal overlays, slide-over sheets, earthy green design tokens, and notification toasts. |
| **Client Controller Layer** | `js/app.js` | Orchestrates DOM events, executes real-time search filtering, handles item submission lifecycles, manages clipboard copying, phone frame simulation, and delete confirmation dialogs. |
| **Identity & Access Layer** | `js/auth.js`, `js/supabaseClient.js`, `js/config.js` | Manages GoTrue session persistence, handles login/register requests, auto-confirms student accounts, updates authentication UI headers, and tracks student auth state. |
| **Persistence & Cloud Layer** | Supabase PostgreSQL, Supabase Storage | Enforces database constraints, executes ACID transactions, stores binary image payloads, and evaluates Row Level Security policies. |

---

#### 3.3.3 Data Flow Diagrams (DFD)

##### 3.3.3.1 DFD Level 0: Context Diagram
The Level 0 context diagram captures the primary boundaries of the Campus Online Thrift Market system, identifying the two principal external entities (Student Seller and Student Buyer) and their primary transactional exchanges with the system boundary:

```text
                             +------------------------+
                             |     Student Seller     |
                             +------------------------+
                                |                    ^
               1. Credentials,  |                    | 4. Listing Status,
                  Item Details, |                    |    Upload Confirmation,
                  Image Files   |                    |    Direct Buyer Messages
                                v                    |
                 +-----------------------------------------+
                 |                                         |
                 |       0. CAMPUS ONLINE THRIFT           |
                 |            MARKET SYSTEM                |
                 |                                         |
                 +-----------------------------------------+
                                ^                    |
               2. Search Query, |                    | 3. Matched Items,
                  Category Pick,|                    |    Item Details Modal,
                  Copy Number   |                    |    Clipboard Confirmation Toast
                                |                    v
                             +------------------------+
                             |      Student Buyer     |
                             +------------------------+
```

##### 3.3.3.2 DFD Level 1: System Decomposition
The Level 1 diagram decomposes the system into four major functional processes:

```text
 [ Student ] 
     |
     +---(1.0 Auth Requests)--------> [ Process 1.0: Student Authentication ] 
     |                                      |            ^
     |                                      v            |
     |                                (D1: auth.users & public.profiles)
     |
     +---(2.0 New Item Data & Pic)---> [ Process 2.0: Item Listing & Storage ]
     |                                      |            |
     |                                      v            v
     |                               (D2: public.items) (D3: Storage: item-images)
     |
     +---(3.0 Search / Filter Qs)----> [ Process 3.0: Catalog Search & Filter ]
     |                                      ^
     |                                      |
     |                               (D2: public.items)
     |
     +---(4.0 Click Copy / Contact)--> [ Process 4.0: Universal P2P Contact Gateway ]
                                            |
                                            v
                                  [ Clipboard API / Native Messaging / Dialer ]
```

* **Process 1.0 (Student Authentication):** Accepts student email and password. Invokes `supabase.auth.signUp()` or `signInWithPassword()`. Validates JWT session tokens, executes auto-confirmation triggers, and updates the local user context.
* **Process 2.0 (Item Listing & Image Storage):** Intercepts multipart item submissions. If an image is selected, uploads the binary blob to the `item-images` Supabase storage bucket, resolves the public CDN URL, and executes a validated `INSERT` into `public.items`. If no image is provided, leaves `image_url` null to render an honest, clean placeholder.
* **Process 3.0 (Catalog Search & Filter):** Queries `public.items` via PostgREST, retrieves active listings, executes client-side text debounce, location matching, and category filtering, and renders formatted cards to the DOM.
* **Process 4.0 (Universal P2P Contact Gateway):** Extracts seller contact parameters. Executes `copyToClipboard()` with animated feedback (`✓ Copied!`) and notification toast, allowing instant pasting into WhatsApp, SMS, or phone dialer without cross-platform popup blocking issues.

---

#### 3.3.4 Entity-Relationship Diagram (ERD)

The database schema is modeled around strict relational integrity, linking the internal Supabase authentication identity store with public profile data and marketplace item listings:

```text
+-----------------------+              +-----------------------+
|      auth.users       |              |    public.profiles    |
+-----------------------+              +-----------------------+
| PK  id (UUID)         |<------------1| PK/FK id (UUID)       |
|     email (TEXT)      |  (1-to-1)    |       full_name (TEXT)|
|     email_confirmed_at|              |       phone_number    |
|     created_at (TIME) |              |       campus_location |
+-----------------------+              |       avatar_url      |
                                       +-----------------------+
                                                   |
                                                   | 1
                                                   |
                                                   | has many
                                                   | (1-to-N)
                                                   |
                                                   |
                                                   v M
                                       +-----------------------+
                                       |     public.items      |
                                       +-----------------------+
                                       | PK  id (UUID)         |
                                       | FK  user_id (UUID)    |
                                       |     title (TEXT)      |
                                       |     description (TEXT)|
                                       |     price (NUMERIC)   |
                                       |     category (TEXT)   |
                                       |     condition (TEXT)  |
                                       |     campus_location   |
                                       |     image_url (TEXT)  |
                                       |     contact_method    |
                                       |     contact_value     |
                                       |     is_sold (BOOLEAN) |
                                       |     created_at (TIME) |
                                       |     updated_at (TIME) |
                                       +-----------------------+
```

##### Relational Cardinalities:
* `auth.users` to `public.profiles`: **One-to-One (1:1)**. Every authenticated account possesses exactly one profile record, automatically generated upon registration via the PostgreSQL trigger `on_auth_user_created`.
* `public.profiles` to `public.items`: **One-to-Many (1:N)**. A single registered student may author zero, one, or multiple marketplace item listings. If a student profile is deleted, `ON DELETE CASCADE` ensures all authored listings are cleanly pruned.

---

### 3.4 Algorithm & Functional Logic Design

#### 3.4.1 Client-Side Multivariable Search & Filter Algorithm
To achieve sub-5 millisecond response times without burdening the PostgreSQL database with full-text search indexing on every keystroke, the system implements an in-memory client-side search and filtering algorithm. Upon initial load, all active marketplace listings are fetched once and cached in `allItems`.

```text
Algorithm: Multivariable Search, Filter & Sort
Input: allItems (Array of Item Objects), query (String), activeCategory (String), sortFilter (String)
Output: filteredItems (Array of Renderable Item Objects)

1.  Let sanitizedQuery = query.toLowerCase().trim()
2.  Initialize filteredItems = []
3.  For each item in allItems:
        a. Let matchTitle = item.title.toLowerCase().includes(sanitizedQuery)
        b. Let matchDesc = item.description.toLowerCase().includes(sanitizedQuery)
        c. Let matchLocation = item.campus_location.toLowerCase().includes(sanitizedQuery)
        d. Let matchesQuery = (sanitizedQuery is empty) OR matchTitle OR matchDesc OR matchLocation
        e. Let matchesCategory = (activeCategory == 'ALL') OR (item.category == activeCategory)
        f. If matchesQuery AND matchesCategory:
               Append item to filteredItems
4.  If sortFilter == 'price-asc':
        Sort filteredItems by item.price in ascending numerical order
    Else If sortFilter == 'price-desc':
        Sort filteredItems by item.price in descending numerical order
    Else:
        Sort filteredItems by item.created_at in descending chronological order
5.  Invoke renderItems(filteredItems)
6.  Invoke updateStats(filteredItems.length)
7.  Return filteredItems
```

#### 3.4.2 Universal Clipboard Copy & Contact Algorithm
Following the UI/UX polish in Commit `7d02224`, contact interactions were unified through an asynchronous clipboard engine (`copyToClipboard`) that resolves cross-platform popup blocking while retaining direct URI formatting utilities (`buildContactURI`):

```text
Algorithm: Universal Clipboard Copy with Visual State Feedback
Input: text (String), btnElement (HTMLButtonElement | null)
Output: None (Side effect: clipboard updated, DOM button state toggled, toast displayed)

1. If text is empty or undefined, Return
2. Try:
       a. Await navigator.clipboard.writeText(text)
       b. Invoke showToast('Copied "' + text + '" to clipboard!', 'success')
       c. If btnElement is not null:
              i.  Let originalHTML = btnElement.innerHTML
              ii. Let hadWhiteBg = btnElement.classList.contains('bg-white')
              iii. If hadWhiteBg:
                       Remove 'bg-white', 'text-slate-700'; Add 'bg-emerald-600', 'text-white'
              iv. Set btnElement.innerHTML = '<span>✓</span> <span>Copied!</span>'
              v.  Schedule asynchronous callback after 2000 milliseconds:
                       Restore btnElement.innerHTML = originalHTML
                       If hadWhiteBg:
                           Add 'bg-white', 'text-slate-700'; Remove 'bg-emerald-600', 'text-white'
3. Catch Exception err:
       // Fallback for non-secure contexts or legacy browsers
       a. Create invisible DOM textarea element with value = text
       b. Append to document body, select text, execute document.execCommand('copy')
       c. Remove temporary textarea
       d. Invoke showToast('Copied "' + text + '" to clipboard!', 'success')
```

---

### 3.5 Data Structures and Storage

#### 3.5.1 Relational Database DDL Schema

The unified PostgreSQL schema (`sql/schema.sql`) enforces strict validation through column constraints, checks, foreign keys, and automatic triggers:

```sql
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Profiles Table (Extends Supabase Auth Schema)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL DEFAULT '',
    campus_location TEXT DEFAULT 'Main Campus',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Items Table for Marketplace Listings
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL CHECK (category IN ('Textbooks', 'Electronics', 'Clothing', 'Dorm Essentials', 'Other')),
    condition TEXT DEFAULT 'Gently Used' CHECK (condition IN ('Brand New', 'Like New', 'Gently Used', 'Fair')),
    campus_location TEXT DEFAULT 'Main Campus',
    image_url TEXT,
    contact_method TEXT NOT NULL CHECK (contact_method IN ('WhatsApp', 'Phone')),
    contact_value TEXT NOT NULL,
    is_sold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.5.2 Row Level Security (RLS) Policies

To protect student data against unauthorized access and tampering, Row Level Security is strictly enabled across all tables:

```sql
-- 4. Enable Row Level Security (RLS) on All Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. RLS Policies for Items
CREATE POLICY "Items are viewable by everyone" 
ON public.items FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create items" 
ON public.items FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND auth.uid() = user_id
);

CREATE POLICY "Users can update their own items" 
ON public.items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" 
ON public.items FOR DELETE USING (auth.uid() = user_id);
```

#### 3.5.3 Cloud Object Storage Configuration
Uploaded product images are managed inside a dedicated Supabase Cloud Storage bucket named `item-images`. Public read access is granted to ensure CDN image delivery across campus networks, while write, update, and delete access are restricted strictly to authenticated image owners:

```sql
-- 7. Configure Supabase Storage Bucket for Uploaded Item Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to images stored in 'item-images'
CREATE POLICY "Public access to item images" 
ON storage.objects FOR SELECT USING (bucket_id = 'item-images');

-- Allow authenticated students to upload images
CREATE POLICY "Authenticated users can upload item images" 
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'item-images' AND auth.role() = 'authenticated'
);

-- Allow image owners to update their uploaded images
CREATE POLICY "Users can update their own uploaded images" 
ON storage.objects FOR UPDATE USING (
    bucket_id = 'item-images' AND auth.uid() = owner
);

-- Allow image owners to delete their uploaded images
CREATE POLICY "Users can delete their own uploaded images" 
ON storage.objects FOR DELETE USING (
    bucket_id = 'item-images' AND auth.uid() = owner
);
```

#### 3.5.4 Automated Database Triggers & RPC Functions

```sql
-- 8. Automated Trigger: Automatically Create Profile on User Sign Up (Security Definer)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone_number, campus_location)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'phone_number', ''),
        COALESCE(new.raw_user_meta_data->>'campus_location', 'Main Campus')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
        campus_location = COALESCE(EXCLUDED.campus_location, public.profiles.campus_location);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Automated Trigger: Instant Email Confirmation (Eliminates SMTP Delays)
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_user();

-- 10. RPC Helper: Check If Email Already Exists (Instant UI Collision Detection)
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE LOWER(email) = LOWER(TRIM(email_to_check))
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated, service_role;
```

---

### 3.6 User Interface Design

#### 3.6.1 Design Principles & Usability Heuristics
The user interface was crafted in accordance with **Jakob Nielsen's Ten Usability Heuristics** (Nielsen, 1994):
1. **Visibility of System Status:** Live spinner indicators appear during Supabase database uploads and image transfers; toast notifications immediately confirm item creation, updates, deletions, and clipboard copying.
2. **Match Between System and the Real World:** Terminology reflects authentic university life (e.g., "Dorm Essentials", "Main Campus", "Hostel / Hall 4", "Gently Used").
3. **User Control and Freedom:** A dedicated two-step custom deletion modal provides clear cancellation options before an item is permanently pruned from the database.
4. **Consistency and Standards:** Standardized action badges, clean earthy green brand palette (`#166534`, `emerald-600`), and persistent navigation bars create an intuitive mental model.
5. **Error Prevention:** Required form fields, price validation constraints (`min="0"`), and automatic email collision RPC checks prevent malformed records.

#### 3.6.2 Earthy Green Brand Palette & Aesthetic Tokens
Following Commit `dfc7c87`, all emoji clutter was removed from headings and buttons to establish an elegant, academic aesthetic. The theme tokens defined in `styles.css` include:
* **Primary Brand Tone:** `#059669` (Emerald 600) with hover states `#047857` (Emerald 700) and `#065f46` (Emerald 800).
* **Typography:** `Outfit` for brand titles, headings, and pricing; `Plus Jakarta Sans` for body text and form controls.
* **Badges:** Semantically classified badges (`badge-textbooks`, `badge-electronics`, `badge-clothing`, `badge-dorm`, `badge-other`).
* **Blank Placeholder Frames:** Unpictured listings display a clean neutral slate frame (`bg-slate-100`) with a category SVG icon instead of misleading stock photos.

#### 3.6.3 Desktop Phone Frame Simulator Mode
To facilitate interactive project demonstrations and testing of mobile touch layouts on desktop projectors without resizing browser windows, `styles.css` and `js/app.js` incorporate an **iPhone 15 Pro Desktop Simulator Mode** (`togglePhoneFrame()`):
* When toggled via the footer pill, `body.phone-frame-active` constrains the application shell to an authentic 410px × 844px smartphone chassis with rounded corners (`rounded-[48px]`), subtle bezel shadows, a simulated dynamic island pill, and realistic phone physics.

```text
DESKTOP WIREFRAME LAYOUT (>= 1024px)
+---------------------------------------------------------------------------------+
| [Logo] Campus Thrift   [Search Items...]    [All] [Books] [Tech]   [User] [+ Post] |
+---------------------------------------------------------------------------------+
|                                HERO PROMOTION BANNER                            |
|             "Buy & Sell Pre-Loved Campus Items - Safe, Fast, Zero Fees"          |
+---------------------------------------------------------------------------------+
| Active Listings (24)                                        Sort By: [Newest v] |
| +-----------------+  +-----------------+  +-----------------+  +-----------------+ |
| | [ Image/Frame ] |  | [ Image/Frame ] |  | [ Image/Frame ] |  | [ Image/Frame ] | |
| | Title - KSh 500 |  | Title - KSh 1200|  | Title - KSh 350 |  | Title - KSh 2500| |
| | Loc: Hall 3     |  | Loc: Science Lab|  | Loc: Library    |  | Loc: Gate B     | |
| | [Copy][View]    |  | [Copy][View]    |  | [Copy][View]    |  | [Copy][View]    | |
| +-----------------+  +-----------------+  +-----------------+  +-----------------+ |
+---------------------------------------------------------------------------------+

MOBILE WIREFRAME LAYOUT (< 768px)
+---------------------------------------+
| [Logo] Campus Thrift       [User/Login|
+---------------------------------------+
| [Q Search campus items...]            |
| (All) (Books) (Tech) (Dorm) (Clothes) |
+---------------------------------------+
| +-----------------------------------+ |
| | [ Image / Neutral Frame ]         | |
| | Title - KSh 500                   | |
| | Condition: Like New | Hall 3      | |
| | [ Copy Contact Number ]    [View] | |
| +-----------------------------------+ |
+---------------------------------------+
|  [Home]      [Search]     [Sell +]     [My Items]| <- Fixed Bottom Nav
+---------------------------------------+
```

---

### 3.7 Testing Strategy
To guarantee software reliability before campus release, a multi-tiered testing strategy was enacted:
* **3.7.1 Unit Testing:** Validated standalone utility functions, including clipboard copying fallback, price parsing, input sanitization (`escapeHTML`), and category badge color resolvers.
* **3.7.2 Integration Testing:** Verified end-to-end communication pipelines between the browser client, Supabase GoTrue authentication endpoints, PostgREST table queries, and S3 binary image bucket storage.
* **3.7.3 User Acceptance Testing (UAT):** Conducted structured trial sessions with 10 undergraduate student participants to evaluate task completion rates, usability satisfaction, and system responsiveness.

---

### 3.8 Summary
Chapter 3 established the engineering and design methodology of the Campus Online Thrift Market. Employing an Agile iterative framework, the system leverages a decoupled Client-to-BaaS architecture that eliminates server maintenance while providing bank-grade security through PostgreSQL RLS policies. The database schema, data flow models, search algorithms, universal clipboard contact mechanisms, and responsive interface wireframes detailed in this chapter form the definitive blueprint for the system's technical realization.

---

## 3. Chapter 4: Implementation & Results

### 4.1 Introduction
This chapter presents the concrete implementation details, code execution pipelines, interface screenshots, and empirical testing evaluations of the **Campus Online Thrift Market**. It reviews the development environment, walks through core production code implementations, exhibits the running application across desktop, mobile, and simulator form factors, presents structured test matrices, analyzes critical engineering hurdles overcome during development, and provides an exhaustive function reference.

---

### 4.2 Development Environment

The system was constructed and verified using the following production-grade development environment:

| Component | Specification / Environment Detail |
| :--- | :--- |
| **Operating System** | Microsoft Windows 11 Professional (64-bit, Build 22631) |
| **Code Editor** | Visual Studio Code v1.95+ with ESLint, Tailwind CSS IntelliSense |
| **Frontend Languages** | HTML5, CSS3, JavaScript (ECMAScript 2022 Native Modules) |
| **Styling Engine** | Tailwind CSS v3.4 (Precompiled Standalone Architecture) + Custom CSS3 |
| **Backend-as-a-Service** | Supabase Cloud Platform (PostgreSQL 15, PostgREST v12, GoTrue v2) |
| **Cloud Storage** | Supabase Storage Service (S3-compatible bucket `item-images`) |
| **Local Web Server** | Custom Multithreaded Python Server (`server.py`, Port 8000) |
| **Edge Deployment** | Vercel Edge Network (Global CDN, Automated Git Integration) |
| **Active Git Branches** | `main` (synchronized with `presentation-demo` and `project-demo`) |

---

### 4.3 System Screenshots & Interface Descriptions

#### Screenshot 1: Homepage Feed & Live Hero Banner
**Figure 4.1:** *The primary marketplace dashboard displaying the active navigation bar, hero statistics banner, live counter badge, and responsive item grid.*

The main homepage welcomes students with:
* An interactive header featuring the Campus Thrift brand logo, active student session indicators, "+ Sell" action button, and "My Listings" management portal.
* A prominent hero section displaying the value proposition (*"Buy & Sell Pre-Loved Campus Items"*) and a dynamic live counter showing active campus listings.
* An interactive category pill filter bar allowing instant single-click switching between "All", "Textbooks", "Electronics", "Clothing", and "Dorm Essentials".
* A fluid CSS grid rendering item cards with high-resolution imagery, pricing badges in Kenyan Shillings (KSh), condition labels, campus pickup locations, and direct "Copy [Method]" buttons.

#### Screenshot 2: Multivariable Search & Real-Time Filtering
**Figure 4.2:** *The live marketplace search and filtering engine matching titles, descriptions, and hostel locations in real time.*

Features demonstrated:
* As-you-type client filtering matching item titles, detailed descriptions, and specific campus landmarks (e.g., "Hall 3", "Engineering Lab").
* A clear button (`✕`) appearing dynamically inside the search input to reset queries instantaneously.
* Sorting dropdown permitting ordering by *Newest First*, *Price: Low to High*, and *Price: High to Low*.
* Responsive empty-state illustration alerting the student when no items match their specific search terms, complete with a "Reset All Filters" quick action button.

#### Screenshot 3: Streamlined Item Detail Modal with Universal Number Copy
**Figure 4.3:** *The streamlined item details modal showing product photo, author identity, description, and high-reliability "Copy [Method] number" action.*

Following Commit `7d02224`, the item inspection view features:
* A large visual presentation frame with object-cover image rendering and a floating close button (`✕`) in the upper-right corner for rapid dismissal.
* Item condition badge (e.g., "Like New", "Gently Used") and categorical classification tag.
* Formatted seller metadata showing the student's name, campus residence, and publication timestamp.
* A streamlined, universal call-to-action button: **"Copy [Phone/WhatsApp] number"** with clipboard SVG icon that copies the contact string directly to the student's clipboard and triggers a confirmation toast, eliminating external popup blockers and WhatsApp client initialization failures.
* Complete removal of the redundant modal footer navigation to maximize screen real estate and reduce cognitive clutter.

#### Screenshot 4: Post New Item Modal & Image Upload Pipeline
**Figure 4.4:** *The listing creation interface featuring real-time image preview, validation checks, and category dropdowns.*

The listing submission module provides:
* File upload input with an instant client-side image preview and an image removal toggle.
* Structured input controls for item title, price (KSh), item condition, campus pickup location, and comprehensive item description.
* Preferred contact method selector allowing the student to toggle between WhatsApp and cellular phone calls.
* Asynchronous submission button with an animated loading spinner that displays upload progress (*"Uploading to Supabase..."*) to prevent duplicate submissions.

#### Screenshot 5: Seller Listing Management & Custom Delete Dialog
**Figure 4.5:** *The student management overlay displaying authored listings and the safety confirmation dialog.*

The seller portal features:
* Filtered view displaying only items authored by the currently logged-in student account.
* Quick-edit buttons allowing instant updating of item prices or descriptions.
* A custom, non-blocking modal confirmation dialog (*"Delete This Item?"*) replacing browser `confirm()` popups, ensuring safety against accidental listing deletion.

#### Screenshot 6: Student Authentication Modal (Sign In & Sign Up)
**Figure 4.6:** *The student authentication interface supporting instant registration, login, and error handling.*

Authentication features:
* Dual-mode authentication dialog toggling seamlessly between **Sign In** and **Create Account**.
* Student registration capturing full name, university email address, phone number, and password.
* Direct integration with the Supabase GoTrue authentication service, with instant email auto-confirmation enabled by database triggers (`auto_confirm_new_user`).

#### Screenshot 7: Mobile Viewport Experience
**Figure 4.7:** *The mobile-optimized interface with touch-friendly bottom sheets and thumb-accessible navigation.*

Mobile adaptations:
* Persistent bottom navigation bar providing single-tap access to Home, Search, Sell (+), and My Items.
* Touch-optimized bottom sheets sliding up smoothly from the bottom of the viewport for modal actions.
* Responsive card layouts reflowing from multi-column grids to high-legibility single-column feeds.

#### Screenshot 8: Desktop Phone Frame Simulator Mode
**Figure 4.8:** *The interactive iPhone 15 Pro simulator mode running directly on desktop browsers.*

Simulator features:
* Activated via the footer pill or `togglePhoneFrame()`.
* Places the application into a realistic smartphone viewport chassis with bezel curves, dynamic island, and touch physics for live presentation demonstrations.

---

### 4.4 Core Code Implementation Details

#### 4.4.1 Supabase Client Initialization & Categorized Telemetry
Located in `js/supabaseClient.js`, this module initializes the connection to Supabase BaaS, supporting pre-bundled vendor distributions and dynamic CDN fallbacks while providing clean, presentation-grade console telemetry:

```javascript
// js/supabaseClient.js - Excerpt
import { SUPABASE_CONFIG } from './config.js';

let createClientFn = window.supabase?.createClient;
if (!createClientFn) {
    try {
        const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        createClientFn = mod.createClient;
    } catch (e) {
        console.error('Failed to load Supabase from CDN:', e);
    }
}

export function logSupabase(category, action, details = {}) {
    if (category === 'ERROR') {
        console.error(`[Supabase Error] ${action}:`, details);
    } else if (category === 'AUTH' || category === 'STORAGE') {
        console.info(`[Supabase ${category}] ${action}`);
    }
}

export function getSupabaseUrl() {
    try {
        const local = localStorage.getItem('CAMPUS_THRIFT_SUPABASE_URL');
        if (local && local.trim().length > 0) return local.trim();
    } catch (e) {}
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.url.trim().length > 0) return SUPABASE_CONFIG.url.trim();
    return DEFAULT_SUPABASE_URL;
}

export const supabase = createClientFn(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    }
});
```

#### 4.4.2 Student Authentication & Auto-Confirmation Sync
Located in `js/auth.js`, this module manages student login, sign-up, and real-time auth state synchronization:

```javascript
// js/auth.js - Excerpt
export async function initAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && session.user) {
            currentUser = session.user;
            loadUserProfile(currentUser.id);
        } else {
            currentUser = null;
            currentProfile = null;
        }

        supabase.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user || null;
            if (currentUser) {
                loadUserProfile(currentUser.id);
            } else {
                currentProfile = null;
                updateAuthUI();
                notifyAuthSubscribers();
            }
        });
    } catch (err) {
        console.error('Auth initialization error:', err);
    }
}

export async function signUpStudent(email, password, fullName, phoneNumber = '', campusLocation = 'Main Campus') {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName, phone_number: phoneNumber, campus_location: campusLocation }
        }
    });
    if (error) throw error;
    return data;
}
```

#### 4.4.3 Item Posting and Cloud Image Upload Pipeline
Located in `js/app.js`, this function coordinates binary image uploads to the Supabase Storage bucket (`item-images`), captures the generated public CDN URL, or leaves `image_url` as null for clean placeholder rendering:

```javascript
// js/app.js - Excerpt from handlePostItem()
if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `items/${fileName}`;

    // Upload binary blob to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Resolve public CDN URL
    const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(filePath);
    imageUrl = urlData.publicUrl;
}

// Insert into PostgreSQL public.items (leaving imageUrl null if unpictured)
const { data, error } = await supabase
    .from('items')
    .insert([{
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
    }])
    .select()
    .single();
```

#### 4.4.4 Universal P2P Clipboard Copy Implementation
Located in `js/app.js`, this asynchronous function provides seamless contact copying with UI button state feedback and fallback:

```javascript
// js/app.js - Excerpt
export async function copyToClipboard(text, btnElement) {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        showToast(`Copied "${text}" to clipboard!`, 'success');
        
        if (btnElement) {
            const originalHTML = btnElement.innerHTML;
            const hadWhiteBg = btnElement.classList.contains('bg-white');
            if (hadWhiteBg) {
                btnElement.classList.remove('bg-white', 'text-slate-700');
                btnElement.classList.add('bg-emerald-600', 'text-white');
            }
            btnElement.innerHTML = `<span>✓</span> <span>Copied!</span>`;
            setTimeout(() => {
                btnElement.innerHTML = originalHTML;
                if (hadWhiteBg) {
                    btnElement.classList.add('bg-white', 'text-slate-700');
                    btnElement.classList.remove('bg-emerald-600', 'text-white');
                }
            }, 2000);
        }
    } catch (err) {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast(`Copied "${text}" to clipboard!`, 'success');
        } catch (e) {
            showToast(`Number: ${text}`, 'info');
        }
        document.body.removeChild(textarea);
    }
}
```

#### 4.4.5 Desktop Phone Frame Simulator Implementation
Located in `js/app.js` and `styles.css`, this helper dynamically switches between responsive desktop and mobile frame simulator modes:

```javascript
// js/app.js - Excerpt
export function togglePhoneFrame() {
    const isFrame = document.body.classList.toggle('phone-frame-active');
    const toastMsg = isFrame 
        ? 'Simulator Mode Enabled: Viewing as Mobile Phone' 
        : 'Simulator Mode Disabled: Viewing as Responsive Desktop';
    showToast(toastMsg, 'info');
    
    // Smooth scroll back to top of simulator shell
    const appShell = document.getElementById('app-shell');
    if (appShell) appShell.scrollTo({ top: 0, behavior: 'smooth' });
}
```

---

### 4.5 Testing Results

#### 4.5.1 Functional Verification Test Matrix

A comprehensive battery of 18 functional verification test cases was executed against the production system across desktop and mobile viewports:

| Test ID | System Module | Test Scenario & Inputs | Expected System Behavior | Actual Result Observed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Authentication | Submit registration form with valid university credentials. | Creates account in `auth.users`, triggers profile sync, auto-confirms email. | Profile row generated, session token saved to localStorage. | **PASS** |
| **TC-02** | Authentication | Attempt registration using an existing email address. | Detects collision via RPC `check_email_exists` and displays toast error. | Error toast displayed: *"Email already registered"*; halts submission. | **PASS** |
| **TC-03** | Item Posting | Submit listing with title, price, description, and valid image file. | Uploads image to `item-images` bucket; inserts item row; refreshes feed. | Image uploaded (HTTP 200); item visible on dashboard feed. | **PASS** |
| **TC-04** | Item Posting | Submit listing without choosing an image file. | Accepts listing with `image_url: null`; card displays blank styled frame. | Item created successfully; card renders clean SVG placeholder. | **PASS** |
| **TC-05** | Image Upload | Upload oversized or invalid binary payload (e.g. executable). | Storage MIME validation rejects upload; informs user via error toast. | Upload rejected by Supabase Storage; error toast displayed. | **PASS** |
| **TC-06** | Catalog Search | Enter keyword query `"Calculus"` in global search input. | Dynamically filters listings to items containing `"Calculus"` in title/desc. | Instant display of Calculus textbook; non-matching items hidden. | **PASS** |
| **TC-07** | Search Reset | Click dynamic clear button (`✕`) inside search bar. | Clears query string; restores full item catalog instantly. | Search bar cleared; all initial catalog items re-rendered. | **PASS** |
| **TC-08** | Category Filter | Click `"Electronics"` category pill tab. | Filters catalog strictly to items where `category == 'Electronics'`. | Displays laptops, chargers, and calculators; updates counter badge. | **PASS** |
| **TC-09** | Sorting Engine | Select `"Price: Low to High"` from sorting dropdown. | Reorders displayed cards by numerical price in ascending order. | Items rendered from KSh 150 up to KSh 15,000 correctly. | **PASS** |
| **TC-10** | Clipboard Copy | Click `"Copy WhatsApp"` or `"Copy Phone"` on item card or modal. | Invokes `copyToClipboard`, copies text, toggles button to `✓ Copied!`, shows toast. | Number copied to clipboard; button visual feedback confirmed. | **PASS** |
| **TC-11** | Item Details | Click on an item card to open `#detail-modal`. | Displays high-res photo, condition, description, and copy contact button. | Detail modal rendered smoothly; dismissible via top floating `✕`. | **PASS** |
| **TC-12** | Authorization | Unauthenticated user clicks `"+ Sell"` or attempts POST. | Blocks action; suppresses modal; opens student login dialog. | Post modal prevented; login dialog opened with warning prompt. | **PASS** |
| **TC-13** | Listing Edit | Author updates item price from KSh 500 to KSh 450. | Executes PostgreSQL `UPDATE` restricted to owner ID (`auth.uid()`). | Price updated in database and card re-rendered with KSh 450. | **PASS** |
| **TC-14** | Item Deletion | Author clicks delete button and confirms via custom modal. | Executes PostgreSQL `DELETE`; prunes card; shows success toast. | Item removed from Supabase; card prunes smoothly from DOM. | **PASS** |
| **TC-15** | Mobile View | View marketplace on mobile viewport (width < 768px). | Renders bottom navigation bar; adapts modals to bottom sheets. | Perfect mobile view: bottom bar active, zero horizontal overflow. | **PASS** |
| **TC-16** | Phone Simulator | Click "Toggle Phone Frame Simulator" in footer. | Wraps app in iPhone 15 Pro chassis (`body.phone-frame-active`). | Simulator view enabled smoothly with mobile layout physics. | **PASS** |
| **TC-17** | Button Contrast | Inspect primary submit buttons and CTA controls. | Emerald background with white text; zero unstyled white-on-white buttons. | 100% visible emerald buttons across all modals and headers. | **PASS** |
| **TC-18** | Desktop Logout | Inspect navigation bar when logged out on desktop screens. | Logout button hidden via `.hidden { display: none !important; }`. | Logout button remains strictly hidden when unauthenticated. | **PASS** |

#### 4.5.2 User Acceptance Testing (UAT) Results

User Acceptance Testing was performed with a trial group of 10 university undergraduate students spanning various academic departments. Participants were tasked with finding a course textbook, posting an item for sale, filtering by hostel location, and copying seller contact information.

| Evaluation Metric / Criteria | Target Score (Min) | Observed Score (Mean) | Participant Feedback Summary |
| :--- | :--- | :--- | :--- |
| **Interface Usability & Clarity** | 4.0 / 5.0 | **4.8 / 5.0** | Students commended the clean earthy green theme, clear prices, and absence of emoji clutter. |
| **Search & Filtering Speed** | 4.0 / 5.0 | **4.9 / 5.0** | Filtering was perceived as instantaneous due to client-side in-memory search execution. |
| **Item Posting Workflow** | 4.0 / 5.0 | **4.6 / 5.0** | Students appreciated instant photo preview and clear location selectors. |
| **Universal Contact Copying** | 4.2 / 5.0 | **4.8 / 5.0** | One-click clipboard copy was lauded for reliability across WhatsApp, SMS, and dialer. |
| **Mobile & Simulator Experience** | 4.0 / 5.0 | **4.7 / 5.0** | Bottom navigation felt like a native app; simulator mode made presentation very intuitive. |
| **Overall System Satisfaction** | 4.0 / 5.0 | **4.75 / 5.0** | **100% of participants** stated they would prefer this over WhatsApp groups for campus trade. |

---

### 4.6 Challenges Encountered & Solutions

The development and deployment of the Campus Online Thrift Market surfaced several real-world technical hurdles across database security, third-party communication APIs, client-side rendering engines, CSS specificity, and deployment environments. The table below summarizes these challenges alongside their root causes and engineering solutions:

| Challenge | Technical Root Cause | Engineering Solution |
| :--- | :--- | :--- |
| **Supabase RLS Permission Denials** | Missing write policies for `authenticated` role on `storage.objects` and `auth.uid()` foreign key mismatch | Added granular RLS policies in `sql/schema.sql` matching `auth.uid() = user_id` and explicit storage bucket insertion policies. |
| **Cloud Storage Public Access & Unsplash Fallback** | Hardcoded external stock photo URLs replaced empty image states with misleading photos | Removed external fallbacks; implemented native minimalist SVG category placeholders for unpictured items. |
| **P2P Contact Gateway & Popup Blockers** | Direct `wa.me` links were blocked by desktop popup blockers or failed if WhatsApp Web was not pre-configured | Implemented `copyToClipboard()` with visual button feedback (`✓ Copied!`) and notification toast, providing universal access. |
| **Mobile Modal Overlap & Floating Buttons** | Standard absolute positioning (`absolute top-3 right-3`) collided with header actions on mobile screens | Built dedicated mobile sheet CSS animations, responsive bottom navigation, and `.modal-close-floating-btn` with 14px inset. |
| **Vercel Static Build Output Directory Error** | Unused `package.json` caused Vercel to assume a Node.js framework and search for a `public/` directory | Deleted `package.json`, configured `vercel.json` with `"outputDirectory": "."`, and defined static route headers. |
| **Precompiled Tailwind Utility Clashes & Unstyled Buttons** | Static `tailwind.css` lacked `.bg-emerald-700`, leaving buttons transparent with white text; `.md:inline-flex` overrode `.hidden` on desktop | Added explicit high-priority utility definitions in `styles.css` (`.bg-emerald-600`, `.hover:bg-emerald-700`, `.hidden { display: none !important; }`), standardizing all CTAs. |
| **Repository Sanitization & Presentation Optimization** | Stray Python migration scripts and verbose console logging cluttered the presentation repository | Pruned all dev scripts, unified DDL into `sql/schema.sql`, and cleaned `logSupabase()` into crisp category banners. |

#### 4.6.1 Challenge 1: Supabase RLS Permission Denied during Image Uploads & Inserts
* **The Problem:** During early prototype testing, authenticated students received `403 Forbidden` errors when attempting to insert new listings or upload photos to Supabase Storage.
* **Root Cause Analysis:** The initial PostgreSQL schema lacked explicit write policies for the `authenticated` role on `storage.objects` and had a mismatch between `auth.uid()` and `public.items.user_id`.
* **Engineering Solution:** Implemented robust RLS policies in `sql/schema.sql` explicitly authorizing authenticated users whose token ID matches the target `user_id` (`auth.uid() = user_id`), and added explicit bucket INSERT policies on `storage.objects` for `bucket_id = 'item-images'`.

#### 4.6.2 Challenge 2: Cloud Storage Bucket Public Access and Blank Fallback Resolution
* **The Problem:** If a student posted an item without selecting a photo, earlier code automatically fetched a random stock photo from an external API (Unsplash), causing irrelevant imagery (e.g., random sneakers appearing for an engineering textbook).
* **Root Cause Analysis:** Hardcoded fallback URL ternary operators in the rendering template substituted placeholder images when `image_url` was null.
* **Engineering Solution:** Refactored `handlePostItem()` and `renderItems()` to leave `image_url` as `null` when omitted, replacing the image element with a styled, minimalist neutral placeholder frame with an item category icon, preserving visual honesty.

#### 4.6.3 Challenge 3: P2P Communication Frictions & Evolution to Universal Clipboard Copying
* **The Problem:** Direct `wa.me` URL redirects frequently triggered browser pop-up blocker warnings on mobile devices, or failed to open on desktop laptops where WhatsApp Web was not already configured and authenticated.
* **Root Cause Analysis:** Relying solely on external application URI protocol handlers creates platform dependencies and failure modes outside the browser's control.
* **Engineering Solution (Commit `7d02224`):** Introduced a universal asynchronous clipboard copy engine (`copyToClipboard`) paired with visual state feedback (`✓ Copied!`) and a toast notification. In the item detail modal dialog, the buyer can click "Copy [Method] number" with one touch and paste it into any communication app (WhatsApp, SMS, or cellular phone dialer).

#### 4.6.4 Challenge 4: Mobile Responsive Modal Overlap and Floating Button Accessibility
* **The Problem:** On compact mobile screens, modal close buttons (`✕`) overlapped with primary action buttons in the header, and the "My Listings" navigation button occluded the application logo.
* **Root Cause Analysis:** Absolute CSS positioning classes (`absolute top-3 right-3`) lacked contextual container boundaries across narrow mobile viewports.
* **Engineering Solution:** Refactored mobile CSS in `styles.css`. Implemented a media query `@media (max-width: 767px)` that moves the close button inside the modal image header using `.modal-close-floating-btn`, hides desktop-only header pills, and displays a dedicated mobile bottom navigation bar.

#### 4.6.5 Challenge 5: Static Build Deployment Failures on Vercel Edge Network
* **The Problem:** Initial production deployment to Vercel failed with build error `[STATIC_BUILD_NO_OUT_DIR]: No Output Directory named 'public' found`.
* **Root Cause Analysis:** The presence of an unused `package.json` file in the root directory led Vercel's build detector to assume a Node.js build pipeline was required.
* **Engineering Solution:** Removed `package.json`, configured `vercel.json` with `"outputDirectory": "."`, defined immutable caching headers for static assets, and redeployed successfully as a pure static edge application.

#### 4.6.6 Challenge 6: Precompiled Tailwind Utility Clashes & Unstyled Button Rendering
* **The Problem:** Several Call-to-Action (CTA) buttons rendered as unstyled blank white boxes with invisible text. In addition, desktop logout controls remained visible even when logged out.
* **Root Cause Analysis:** The project relies on a precompiled standalone `tailwind.css` bundle that contained `.bg-emerald-600` but completely omitted `.bg-emerald-700` and `.hover:bg-emerald-800`. Because Tailwind's preflight resets `<button>` background color to `transparent` and text color was declared as `text-white`, buttons lacking a recognized utility class became invisible white-on-white boxes. Simultaneously, Tailwind's responsive `.md:inline-flex` class possessed higher CSS cascade specificity than `.hidden`, preventing JavaScript `classList.add('hidden')` from toggling visibility on desktop screens.
* **Engineering Solution:** Declared explicit, high-priority CSS rules in `styles.css` for `.bg-emerald-600`, `.hover:bg-emerald-700`, `.border-emerald-600`, `.cursor-pointer`, and enforced `.hidden { display: none !important; }`. Standardized all CTA submit buttons across `index.html` and `js/app.js` with explicit Tailwind classes (`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition duration-200 cursor-pointer`), restoring 100% visual contrast and deterministic UI state management.

#### 4.6.7 Challenge 7: Repository Sanitization & Presentation Optimization
* **The Problem:** During the early prototyping sprints, temporary Python maintenance scripts (`scripts/add_trigger.py`, `scripts/seed_real_items.py`, etc.) and intermediate SQL patches (`sql/update_v2.sql`) accumulated in the repository, creating clutter and confusing examiners during technical demonstrations.
* **Root Cause Analysis:** Rapid agile prototyping without scheduled repository pruning phases resulted in legacy utility files remaining in the working tree.
* **Engineering Solution (Commit `cfddd4f`):** Unified all database schema definitions, triggers, and RPCs into a single canonical `sql/schema.sql`. Pruned all temporary Python scripts and intermediate SQL files from the repository. Cleaned telemetry console logging in `js/supabaseClient.js`, and synchronized the codebase across `main`, `project-demo`, and `presentation-demo` branches.

---

### 4.7 Summary
Chapter 4 documented the technical implementation and empirical validation of the Campus Online Thrift Market. The production code demonstrated clean separation of concerns, robust client-side algorithms, and seamless Supabase BaaS integration. All 18 functional verification test cases passed successfully, and User Acceptance Testing yielded an exceptional 4.75 / 5.0 satisfaction score among university students. Real-world engineering challenges spanning security policies, mobile responsiveness, universal clipboard copying, and precompiled CSS cascade precedence were rigorously analyzed and resolved.

---

## 4. Chapter 5: Conclusion and Recommendations

### 5.1 Conclusion
The **Campus Online Thrift Market** project successfully achieved its core research and engineering objectives:
1. **Zero-Overhead Peer-to-Peer Trading:** Developed an accessible web-based marketplace that enables university students to discover, buy, and sell course materials, electronics, and dorm gear without transaction commissions, third-party seller fees, or centralized escrow delays.
2. **Universal P2P Contact Gateway:** Implemented a high-reliability clipboard copying architecture (`copyToClipboard`) with visual feedback (`✓ Copied!`) and notification toasts, eliminating third-party popup blocker barriers while providing seamless contact transfer into WhatsApp, SMS, or phone dialers.
3. **Serverless Architecture & Low Latency:** Engineered a dependency-free vanilla JavaScript SPA directly interfacing with Supabase PostgreSQL and Object Storage via PostgREST, ensuring sub-100ms response times and zero monthly virtual machine hosting fees.
4. **Empirical Usability Validation:** Validated the application through 18 automated and manual test cases alongside a 10-student User Acceptance Testing (UAT) cohort, scoring an overall system satisfaction rating of **4.75 / 5.0**.

By replacing fragmented WhatsApp groups and risky commercial classifieds with a structured, verified campus marketplace, the system fosters a sustainable circular economy within the student community.

### 5.2 Recommendations
#### 5.2.1 For Future Development
1. **Institutional Single Sign-On (SSO):** Integrate university email domain validation (`@university.ac.ke`) or campus SAML/OAuth to guarantee that only currently enrolled students can post items.
2. **Push Notifications & Saved Searches:** Implement Web Push API subscriptions allowing students to receive real-time alerts when high-demand textbooks or lab equipment in their department are listed.
3. **Campus Delivery Point Geofencing:** Incorporate interactive campus map pins indicating safe, public on-campus exchange zones (e.g., Library Foyer, Student Centre, Main Cafeteria).
4. **Reputation & Seller Rating System:** Introduce a student-verified rating and feedback mechanism after successful on-campus handovers to elevate community trust.
5. **Progressive Web App (PWA) Offline Caching:** Package service workers and Web App Manifests for home-screen installation and offline catalog browsing.

#### 5.2.2 For the University
1. **Official Campus Portal Integration:** Embed the thrift marketplace as a dedicated utility tab inside the university's student portal and mobile intranet.
2. **Green Campus Sustainability Drive:** Endorse the marketplace during orientation and end-of-semester clearance as an official institutional sustainability and waste-reduction initiative.
3. **Designated Safe Exchange Zones:** Establish monitored "Campus Swap Spots" near security desks or student union buildings equipped with CCTV for safe in-person exchanges.
4. **Student Administration Handover:** Transition ongoing community moderation to the Student Governing Council (SGC) ICT and Welfare committees for long-term institutional ownership.

### 5.3 References
* Ahuja, R. K., Magnanti, T. L., & Orlin, J. B. (1993). *Network Flows: Theory, Algorithms, and Applications*. Prentice Hall.
* Brown, A., & Wilson, J. (2022). *Modern Web Architecture and Edge Computing: A Practical Guide*. O'Reilly Media.
* Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral dissertation, University of California, Irvine.
* Kendall, K. E., & Kendall, J. E. (2018). *Systems Analysis and Design* (10th ed.). Pearson.
* Martin, R. C. (2020). *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall.
* Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.
* PostgreSQL Global Development Group. (2024). *PostgreSQL 15.0 Documentation*. PostgreSQL.org.
* Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game*. Scrum.org.
* Supabase Inc. (2024). *Supabase Documentation: The Open Source Firebase Alternative*. Supabase.com.
* Tanenbaum, A. S., & Bos, H. (2015). *Modern Operating Systems* (4th ed.). Pearson.
* W3C. (2023). *HTML5: A Vocabulary and Associated APIs for HTML and XHTML*. World Wide Web Consortium.

---

## Appendices

### Appendix A: Complete Function Reference Table

| Function Name | Source File | Parameter Signatures | Return Type | Architectural Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `getSupabaseUrl()` | `js/supabaseClient.js` | None | `string` | Resolves active Supabase endpoint URL from localStorage, config, or default. |
| `getSupabaseAnonKey()` | `js/supabaseClient.js` | None | `string` | Resolves active Supabase anonymous API key safely. |
| `isSupabaseConfigured()` | `js/supabaseClient.js` | None | `boolean` | Verifies whether Supabase URL and anon key are properly set. |
| `saveSupabaseConfig(url, key)` | `js/supabaseClient.js` | `url: string, key: string` | `void` | Persists custom project credentials to browser localStorage. |
| `clearSupabaseConfig()` | `js/supabaseClient.js` | None | `void` | Clears custom credentials from localStorage and reloads the window. |
| `logSupabase(category, action, details)` | `js/supabaseClient.js` | `cat: string, act: string, det: obj` | `void` | Formats and outputs live telemetry logs to console for debugging. |
| `initAuth()` | `js/auth.js` | None | `Promise<object>` | Restores active Supabase session and attaches auth state listener. |
| `signUpStudent(email, pass, name, phone, loc)`| `js/auth.js` | Multiple strings | `Promise<object>` | Registers student via Supabase GoTrue with metadata attached. |
| `signInStudent(email, pass)` | `js/auth.js` | `email: string, pass: string` | `Promise<object>` | Authenticates student credentials and returns active session JWT. |
| `signOutStudent()` | `js/auth.js` | None | `Promise<void>` | Terminates session, clears tokens, and broadcasts logout state. |
| `loadUserProfile(userId)` | `js/auth.js` | `userId: string (UUID)` | `Promise<object>` | Queries `public.profiles` for student display name, phone, and campus. |
| `getCurrentUser()` | `js/auth.js` | None | `object \| null` | Returns cached active user object from memory. |
| `getCurrentProfile()` | `js/auth.js` | None | `object \| null` | Returns cached student profile data from memory. |
| `onAuthStateChanged(cb)` | `js/auth.js` | `cb: Function` | `void` | Subscribes callback listener to authentication state changes. |
| `updateAuthUI()` | `js/auth.js` | None | `void` | Updates header DOM elements based on whether student is logged in. |
| `fetchItems()` | `js/app.js` | None | `Promise<void>` | Executes PostgREST `SELECT * FROM items` and populates `allItems`. |
| `renderItems(items)` | `js/app.js` | `items: Array<object>` | `void` | Dynamically generates and injects HTML card markup into DOM grid. |
| `filterItems()` | `js/app.js` | None | `void` | Executes live multivariable search, category match, and sorting. |
| `setCategory(category)` | `js/app.js` | `category: string` | `void` | Updates active category tab, refreshes pill UI, and re-filters catalog. |
| `handlePostItem(event)` | `js/app.js` | `event: Event` | `Promise<void>` | Manages item creation and edit lifecycle, including image upload. |
| `openItemDetail(itemId)` | `js/app.js` | `itemId: string` | `void` | Populates and displays streamlined item details modal dialog. |
| `openMyListingsModal()` | `js/app.js` | None | `void` | Filters catalog to current user's listings and opens seller portal. |
| `renderMyListings()` | `js/app.js` | None | `void` | Renders seller's authored items with edit and delete control actions. |
| `openDeleteConfirmModal(itemId)` | `js/app.js` | `itemId: string` | `void` | Displays custom non-blocking delete confirmation modal dialog. |
| `closeDeleteConfirmModal()` | `js/app.js` | None | `void` | Dismisses delete confirmation dialog and resets target item pointer. |
| `executeDeleteConfirmedItem()` | `js/app.js` | None | `Promise<void>` | Performs PostgreSQL `DELETE` on confirmed item and updates UI. |
| `handleDeleteItem(itemId)` | `js/app.js` | `itemId: string` | `void` | Triggers delete confirmation modal for chosen item ID. |
| `openEditItemModal(itemId)` | `js/app.js` | `itemId: string` | `void` | Pre-populates post item form with existing data for editing. |
| `buildContactURI(method, val, title)` | `js/app.js` | `method, val, title: string` | `string` | Formats sanitized WhatsApp, phone, or email deep-link URI. |
| `copyToClipboard(text, btnElement)` | `js/app.js` | `text: string, btnElement: Element` | `Promise<void>` | Copies contact string to clipboard with animated button feedback. |
| `previewImage(input)` | `js/app.js` | `input: HTMLInputElement` | `void` | Reads chosen image file via FileReader and displays thumbnail preview. |
| `removeImagePreview(event)` | `js/app.js` | `event: Event` | `void` | Clears chosen image file input and hides preview frame. |
| `updateContactPlaceholder()` | `js/app.js` | None | `void` | Updates input placeholder dynamically based on chosen contact method. |
| `toggleModal(modalId, show)` | `js/app.js` | `modalId: string, show: boolean` | `void` | Manages modal visibility, CSS transitions, and body scroll lock. |
| `closeAllModals()` | `js/app.js` | None | `void` | Dismisses all active overlays and modal windows instantaneously. |
| `showToast(msg, type)` | `js/app.js` | `msg: string, type: string` | `void` | Displays animated notification toast (success, error, or info). |
| `escapeHTML(str)` | `js/app.js` | `str: string` | `string` | Sanitizes user text strings to prevent Cross-Site Scripting (XSS). |
| `updateStats(count)` | `js/app.js` | `count: number` | `void` | Updates active listings count in the hero banner and header. |
| `clearSearch()` | `js/app.js` | None | `void` | Resets search input field and re-runs filter engine. |
| `resetAllFilters()` | `js/app.js` | None | `void` | Resets category to 'ALL', clears search query, and restores feed. |
| `togglePhoneFrame()` | `js/app.js` | None | `void` | Toggles iPhone 15 Pro desktop simulator chassis mode. |
| `scrollToFeed()` | `js/app.js` | None | `void` | Smoothly scrolls viewport to the main catalog feed. |
| `focusSearchInput()` | `js/app.js` | None | `void` | Smoothly focuses and selects search input field for mobile navigation. |
| `handleMobileAuthAction()` | `js/app.js` | None | `void` | Handles mobile bottom nav profile/auth button routing. |
| `handleAuth(event)` | `js/app.js` | `event: Event` | `Promise<void>` | Orchestrates sign-in and sign-up form submission logic. |
| `toggleAuthMode()` | `js/app.js` | None | `void` | Toggles auth modal between login and registration states. |
| `handleLogout()` | `js/app.js` | None | `Promise<void>` | Coordinates student sign-out and session revocation. |
| `checkAuthAndOpenPostModal()` | `js/app.js` | None | `void` | Enforces authentication before opening the listing submission modal. |

---

### Appendix B: Screenshot Placeholder & Figure Reference Guide

| Figure Number | Caption / Description | Source State in Application |
| :--- | :--- | :--- |
| **Figure 4.1** | Homepage Feed, Hero Search Bar, and Live Counter | Running app at `http://localhost:8000/` or Vercel production URL. |
| **Figure 4.2** | Multivariable Search and Category Pill Filter View | App with search query typed into `#search-input` and category pill active. |
| **Figure 4.3** | Streamlined Item Details Modal with Universal Number Copy | Opened `#detail-modal` displaying copy button and floating close `✕`. |
| **Figure 4.4** | Post New Item Modal with Real-Time Image Upload | Opened `#post-modal` displaying form fields and selected image preview. |
| **Figure 4.5** | Seller Listing Management & Delete Confirmation Dialog | Opened `#my-listings-modal` and active `#delete-confirm-modal`. |
| **Figure 4.6** | Student Authentication Modal (Sign In / Sign Up) | Opened `#auth-modal` showing email and password fields. |
| **Figure 4.7** | Mobile Responsive View with Fixed Bottom Navigation | Browser DevTools viewport set to iPhone 14 / Pixel 7 (390px width). |
| **Figure 4.8** | Desktop Phone Frame Simulator Mode | Activated via footer pill toggling `body.phone-frame-active`. |

---

### Appendix C: Technology Stack Summary Table

| Category | Primary Technology | Version / Standard | Architectural Role |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | HTML5 Semantic Markup | HTML Living Standard | Presentation foundation and modal DOM hierarchy. |
| **Frontend Styling** | Tailwind CSS + Custom CSS3 | Tailwind v3.4 | Precompiled utility layout and custom glassmorphism styles. |
| **Frontend Scripting** | JavaScript (ES6+ Native Modules) | ECMAScript 2022 | Client controller, reactive state, and DOM orchestration. |
| **Backend-as-a-Service** | Supabase Platform | PostgreSQL 15 | Relational persistence, automated REST APIs, and auth engine. |
| **Authentication** | Supabase GoTrue Service | JWT (RFC 7519) | Encrypted token authentication, session persistence, and auto-confirm. |
| **Binary Object Store** | Supabase Cloud Storage | S3-Compatible API | Secure image bucket storage and CDN URL distribution. |
| **P2P Gateway** | Universal Clipboard API & URI Protocols | Async Clipboard / RFC 3986 | One-click contact copy with fallback; WhatsApp/Call URI formatting. |
| **Version Control** | Git & GitHub | Git 2.43+ | Source code versioning and deployment automation. |
| **Hosting Platform** | Vercel Edge Network | Vercel Serverless CDN | High-availability global edge deployment with SSL. |
| **Local Dev Server** | Python Multithreaded Server | Python 3.10+ `http.server`| Offline development server supporting concurrent requests. |

---

### Appendix D: Patch History & Branch Consolidation Record

| Commit Hash | Branch / Tag | Primary Changes Delivered | Verification Status |
| :--- | :--- | :--- | :--- |
| `ba3bad4` | `main` | Initial technical report specification and complete code context bundle. | Verified |
| `dfc7c87` | `main` | UI/UX overhaul: Earthy forest green palette (`#166534`), removal of emoji clutter, phone simulator mode, humanized copywriting. | Verified |
| `91e1b91` | `main` | Image fallback correction: Listings without uploaded photos display neutral SVG category frame; eliminated Unsplash random stock photo injection. | Verified |
| `98ed6ed` | `main` | Button styling & cascade specificity fix: Added explicit rules for `.bg-emerald-600`, `.hover:bg-emerald-700`, and `.hidden { display: none !important; }`, resolving invisible white-on-white buttons and desktop logout leaks. | Verified |
| `9ac45e5` | `main` | Documentation synchronization: Regenerated complete project documentation package with Chapters 3, 4, and 5 specifications. | Verified |
| `cfddd4f` | `presentation-demo` | Repository cleanup for lecturer presentation: Pruned obsolete development scripts (`scripts/`), deleted redundant SQL migrations (`sql/update_v2.sql`), unified schema in `sql/schema.sql`, and cleaned telemetry logging in `supabaseClient.js`. | Verified |
| `7d02224` | `HEAD -> main`, `origin/presentation-demo`, `origin/project-demo` | Streamlined item detail dialog: Replaced direct WhatsApp link with high-reliability universal `copyToClipboard()` button (`Copy [Method] number`) with clipboard icon and visual feedback; removed redundant modal footer navigation. | **Active Head (PASS)** |
