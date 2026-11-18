# 🎓 Campus Online Thrift Market

> A decentralized, low-complexity peer-to-peer (P2P) campus thrift marketplace designed for university students to buy, sell, and hand down textbooks, electronics, dorm essentials, and clothing with zero transaction fees and direct contact.

---

## ⚡ Quick Start (Run the Presentation Demo)

The application is built on native web standards with zero compilation or build steps. Run the local demo server with Python:

```bash
python server.py 8000
```

Then open your browser to:
```
http://127.0.0.1:8000
```

> **Note:** Zero setup required. No `npm install`, Webpack, or Vite build tooling needed—the application loads and executes immediately in any modern web browser.

---

## 🌟 Key Features & Presentation Highlights

- **Zero-Build Single-Page Application (SPA):** Pure HTML5, modern vanilla JavaScript (ES6+ modules), and standalone Tailwind CSS for sub-millisecond execution.
- **Instant Search & Real-Time Filtering:** Sub-5ms client-side search matching item titles, descriptions, and hostel/campus locations, paired with categorical filter tabs and price sorting.
- **Universal Peer-to-Peer Contact:** One-click clipboard copy (`copyToClipboard`) with animated visual feedback (`✓ Copied!`) and notification toasts, enabling instant contact via WhatsApp, SMS, or phone dialer without popup blocker friction.
- **Listing Management & Image Upload:** Drag-and-drop photo upload with live client preview, honest neutral SVG category placeholders for unpictured items, and a safe two-step delete confirmation modal.
- **Student Authentication & Ownership:** Secure student sign-in, registration with instant confirmation, and owner-only listing modification and deletion.
- **Desktop Phone Frame Simulator Mode:** Built-in iPhone 15 Pro chassis mode (toggled via the footer pill or `togglePhoneFrame()`) for realistic mobile touch demonstrations directly on a desktop projector or monitor.

---

## 📁 Repository Structure

```text
CAMPUS-THRIFT/
│
├── index.html                      # Main responsive Single-Page Application markup & modal dialogs
├── README.md                       # Project overview & presentation guide
├── server.py                       # Lightweight multithreaded Python development server
├── styles.css                      # Custom design tokens, utility overrides, animations & toasts
├── tailwind.css                    # Standalone precompiled Tailwind utility CSS classes
├── vercel.json                     # Static routing configuration for edge delivery
│
├── js/
│   ├── app.js                      # Core application controller: search, filtering, clipboard & DOM logic
│   ├── auth.js                     # Student authentication, session persistence & UI state sync
│   ├── config.js                   # Project configuration constants
│   ├── supabaseClient.js           # Supabase client singleton factory & categorized logging
│   └── vendor/
│       └── supabase.js             # Pre-bundled local distribution of @supabase/supabase-js v2
│
├── project_documentation/
│   ├── complete_project_code_context.txt # Single bundled archive containing 100% of the project source code
│   └── technical_report_spec.md    # Comprehensive academic technical report (Chapters 3, 4, and 5)
│
└── sql/
    └── schema.sql                  # PostgreSQL DDL: profiles & items tables, RLS policies, triggers & RPCs
```

---

## 👥 Team Ownership & Project Roles

As detailed in the academic technical report ([project_documentation/technical_report_spec.md](project_documentation/technical_report_spec.md)):

| Role | Member Allocation | Primary Deliverables | Target Modules |
| :--- | :--- | :--- | :--- |
| **Database & Backend Lead** | Person 1 | Relational PostgreSQL schema, RLS security policies, auth engine & triggers | `sql/schema.sql`, `js/supabaseClient.js`, `js/auth.js` |
| **Frontend & UI/UX Lead** | Person 2 | Responsive layout, semantic HTML5, earthy green design tokens, modals & mobile sheets | `index.html`, `styles.css` |
| **Integration Lead** | Person 3 | Dynamic DOM rendering, live filtering, image upload, URI generation & clipboard copying | `js/app.js` |
| **QA & Documentation Lead** | Person 4 | Functional verification test suites, user acceptance testing (UAT) & academic specification | `README.md`, `project_documentation/` |

---

## 🧪 Verified Presentation Checklist

- [x] **Zero Build Tooling:** Starts directly in the browser with no npm or bundler installation.
- [x] **Instant Multivariable Search:** Real-time query filtering across title, description, and campus pickup locations.
- [x] **Category Pill Filters:** Instant filtering across Textbooks, Electronics, Clothing, Dorm Essentials, and Other.
- [x] **Sorting Engine:** Chronological (newest), price ascending, and price descending sorts.
- [x] **Universal Contact Copying:** One-click clipboard copy (`copyToClipboard`) with animated button confirmation.
- [x] **Direct Contact Deep Links:** Formatted WhatsApp click-to-chat, phone dialer, and email links.
- [x] **Owner Management:** Logged-in students can view, edit, and safely delete their own listings.
- [x] **Honest Image Fallback:** High-resolution product photos with clean neutral SVG category placeholders when unpictured.
- [x] **Desktop Phone Simulator:** Instant toggle to iPhone 15 Pro presentation view for lecturer evaluation.
