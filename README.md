# 🌾 Giaro — Premium Food Mart

<p align="center">
  <img src="public/images/logo.png" alt="Giaro Logo" width="380" />
</p>

<p align="center">
  <strong>✨ PREMIUM. FRESH. DELIVERED. ✨</strong>
</p>

<p align="center">
  <!-- Core Framework -->
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  
  <!-- Styling & UI -->
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  
  <!-- Backend -->
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

**Giaro** represents a paradigm shift in localized e-commerce architecture. Engineered as a high-performance, bilingual (English & Arabic) digital storefront, it seamlessly marries uncompromising typographic elegance with rigorous technical foundations. Designed specifically for the premium gourmet food sector in Egypt, Giaro delivers a frictionless, hyper-optimized purchasing journey that converts visitors into loyal patrons.

---

<p align="center">
  <a href="#-key-capabilities">Key Capabilities</a> •
  <a href="#%EF%B8%8F-administrative-command-center">Admin Panel</a> •
  <a href="#-technical-architecture">Technical Architecture</a> •
  <a href="#-database-topology">Database Topology</a> •
  <a href="#-telemetry--seo">Telemetry & SEO</a>
</p>

---

## 🌟 Key Capabilities

### 🌐 Sophisticated i18n Localization
- **Deep Dual-Language Architecture:** Fully localized UI, programmatic routing, and dynamic SEO meta injections via `next-intl`.
- **Context-Aware Directionality:** Adaptive DOM rendering seamlessly transitions between `RTL` and `LTR` paradigms.
- **Typographic Precision:** Utilizes bespoke font pairings—`Ping` for structural Arabic clarity and `The Seasons` for refined English serifs.

### 🛒 High-Fidelity Commerce Engine
- **Deterministic Cart State:** Client-side cart mutations managed via optimized React Context, ensuring zero-latency user feedback.
- **Geospatial Logistics:** Dynamic shipping cost algorithms calculated instantaneously based on Egyptian governorate metrics.
- **Conversion-Optimized Checkout:** A streamlined transactional flow featuring integrated promo validation, automated discounting, and threshold-based constraints.
- **Automated Fulfillment Logic:** Serverless generation of dynamic PDF invoices (`jspdf`) paired with robust transactional email delivery (`Resend`).

---

## 🛡️ Administrative Command Center

Giaro features a bespoke, role-based administrative dashboard engineered for comprehensive operational oversight. It abstracts the complexity of inventory management, order orchestration, and dynamic promotional logic into a unified, intuitive interface.

> *(Placeholder for UI/UX showcases. Insert your dashboard screenshots below.)*

*`[Insert Dashboard Image 1 Here]`*

*`[Insert Dashboard Image 2 Here]`*

- **Order Orchestration:** Real-time visibility into fulfillment states, granular order tracking, and centralized customer communications.
- **Dynamic Catalog Management:** Fluid CRUD operations for product inventory, variant pricing structures, and real-time stock reconciliation.
- **Algorithmic Pricing Controls:** Granular control over regional shipping matrices and localized taxation parameters.
- **Promotional Intelligence:** Creation and enforcement of sophisticated discount rules, active campaigns, and limited-time offer constraints.

---

## 🏗️ Technical Architecture

The codebase enforces a strict separation of concerns, leveraging the Next.js App Router paradigm to maximize server-side rendering efficiencies.

```bash
my-app/
├── app/                  # Next.js 15 App Router & Server Components
│   ├── [locale]/         # Localized routing interceptors (shop, admin, checkout)
│   ├── api/              # Serverless infrastructure (orders, promo, products, telemetry)
│   └── sections/         # Modular, reusable compositional blocks
├── components/           # UI Primitive Library
│   ├── auth/             # Cryptographically secure authentication boundaries
│   ├── contexts/         # React state topologies (Cart, Auth, Analytics)
│   └── ui/               # Radix UI primitives augmented with customized Shadcn patterns
├── lib/                  # Core Business Logic & External Services
│   ├── analytics/        # Telemetry aggregation (GA4 & Meta Pixel)
│   ├── data/             # Static regional structures (Governorate matrices)
│   ├── email/            # Resend transactional email configurations
│   └── supabase/         # Strongly-typed ORM layer & client instances
└── supabase/             # Immutable infrastructure-as-code definitions
```

---

## 🛢️ Database Topology

Giaro relies on a highly normalized PostgreSQL cluster managed via Supabase. The schema implements rigorous referential integrity and Row-Level Security (RLS) to safeguard transactional data.

Key structural domains located in `supabase/migrations/`:
- **Checkout Infrastructure (`003_checkout_infrastructure.sql`):** Encapsulates the relational logic between transactional orders, transient line items, and customer identity vectors.
- **Promotional Engine (`003_add_offers_table.sql`):** Governs the temporal logic of active campaigns, discount validation, and operational constraints.

Type safety is enforced end-to-end via the Supabase CLI, ensuring that database mutations remain tightly coupled with frontend interfaces.

---

## 📈 Telemetry & SEO

Maximizing organic acquisition and conversion velocity requires meticulous data observation. Giaro incorporates a robust telemetry and indexing framework:

- **Server-Side SEO Injection:** Dynamic generation of locale-specific metadata and `canonical` links to dominate organic search indexing.
- **Event-Driven Telemetry:** Built-in tracking providers capture granular interaction data:
  - **Meta Pixel:** Fires sophisticated conversion events, cart abandonment tracking, and custom purchase logic.
  - **Google Analytics (GA4):** Unified interaction measurement and user journey mapping.
- **Structured Semantic Data (JSON-LD):** Programmatically generates `Organization` and `WebSite` schemas, ensuring rich search result snippets and optimal crawlability.

---

<p align="center">
  <small>Architected with precision. Built for scale. © Giaro.</small>
</p>
