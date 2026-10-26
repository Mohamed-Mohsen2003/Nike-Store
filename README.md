# Velora — Commerce OS for modern retail brands

**Velora** is a complete SaaS product demo: a marketing website, authentication flow, and a fully interactive multi‑module dashboard that unifies orders, inventory, customers, analytics and billing for a fast‑growing sneaker brand (*Stride Athletics*).

🔗 **Live demo:** https://mohamed-mohsen2003.github.io/nike-store/

> Everything is interactive and runs entirely in the browser. Changes you make (new products, fulfilled orders, invites, invoices…) are saved to `localStorage`. Use **Reset demo data** from the user menu to start over.

---

## ✨ Highlights

**Marketing site**
- Animated hero with word‑by‑word reveal, aurora background, 3D‑tilt live dashboard preview and floating cards
- Infinite logo & testimonial marquees, count‑up stats, spotlight bento grid with live mini‑visuals
- Auto‑playing "How it works" scenes, orbiting integrations, pricing with monthly/yearly toggle, FAQ accordion

**Auth**
- Split‑screen sign‑in with rotating testimonials
- Two‑step sign‑up with validation, password‑strength meter and workspace setup

**Dashboard (10 modules)**
| Module | What it does |
| --- | --- |
| Overview | KPIs with sparklines, revenue vs. previous period, channel donut, monthly goal gauge, live activity, top products, restock alerts |
| Orders | Status tabs, search, channel filter, bulk actions, pagination, order drawer with fulfillment timeline |
| Products | Grid / list views, filters, create / edit / duplicate / restock / delete with modal forms |
| Customers | Segment cards (VIP, Loyal, New, At risk), sortable table, customer 360 drawer |
| Analytics | Traffic & revenue charts, conversion funnel, retention cohort heatmap, top markets, buying‑hour heatmap |
| Invoices | Wholesale invoicing with live line‑item totals, printable invoice preview, mark paid / send reminder |
| Team | Invite teammates, change roles, remove members, RBAC permission matrix |
| Integrations | Connect / disconnect 12 apps with category filters |
| Billing | Plan switcher, animated usage meters, payment card, billing history |
| Settings | Profile, workspace, appearance (dark / light), notifications, security sessions, API keys |

**Product details**
- ⌘K / Ctrl+K command palette (search pages, orders, products, customers, actions)
- Dark & light themes, collapsible sidebar, fully responsive down to 360px
- Toast notifications, notification center, empty states, keyboard support, `prefers-reduced-motion` support
- Custom SVG chart library (area, bar, donut, gauge, sparkline) built on `d3-shape` / `d3-scale`

## 🧱 Tech stack

- **React 19 + TypeScript**
- **esbuild** for bundling (sub‑second builds)
- Hand‑crafted CSS design system (tokens, dark/light themes, motion primitives) — no UI kit
- `react-icons` (Lucide & Simple Icons), `d3-shape`, `d3-scale`
- Zero‑config hash router → deploys to any static host (GitHub Pages, Vercel, Netlify)

## 🚀 Run locally

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build in /dist
```

## 📁 Structure

```
src/
  components/   UI kit (buttons, modals, drawers, menus…), charts, brand icons
  lib/          router, global store, demo dataset, formatters, motion hooks
  pages/
    marketing/  landing page
    auth/       sign in & sign up
    app/        dashboard shell + 10 modules
  styles/       design tokens, landing and app styles
public/         product images & favicon
```

---

Designed & built by **Mohamed Mohsen** — Full‑Stack Developer & Designer.
All company names, people and figures in this demo are fictional.
