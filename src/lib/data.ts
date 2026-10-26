/* ---------------------------------------------------------------------------
   Velora demo dataset — deterministic, so every visitor sees the same story.
   Workspace: "Stride Athletics", a fast-growing sneaker brand.
--------------------------------------------------------------------------- */

let seed = 20261026;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;

export const TODAY = new Date('2026-10-26T12:00:00');
const daysAgo = (d: number, h = d <= 0 ? int(6, 11) : int(8, 22), m = int(0, 59)) => {
  const x = new Date(TODAY);
  x.setDate(x.getDate() - d);
  x.setHours(h, m, 0, 0);
  return x.toISOString();
};

/* ------------------------------- Products -------------------------------- */
export type Product = {
  id: string;
  sku: string;
  name: string;
  collection: string;
  image: string;
  price: number;
  cost: number;
  stock: number;
  reorderAt: number;
  sold30: number;
  rating: number;
  status: 'active' | 'draft' | 'archived';
  colorway: string;
  trend: number[];
};

const catalog: [string, string, string, string, number][] = [
  ['Stride Force High', 'Force', 'air', 'Triple Black', 129],
  ['Stride Force High', 'Force', 'air2', 'Midnight Navy', 129],
  ['Court Blazer Mid ’77', 'Court', 'blazer', 'Sail / Black', 105],
  ['Court Blazer Mid ’77', 'Court', 'blazer2', 'Pine Green', 105],
  ['Crater Impact', 'Crater', 'crater', 'Black / Volt', 115],
  ['Crater Impact', 'Crater', 'crater2', 'Photon Dust', 115],
  ['Hippie Space Runner', 'Space', 'hippie', 'Grey / Crimson', 139],
  ['Hippie Space Runner', 'Space', 'hippie2', 'Smoke Grey', 139],
  ['Legacy One Retro', 'Legacy', 'jordan', 'Hand Crafted', 179],
  ['Legacy One Retro', 'Legacy', 'jordan2', 'Emerald Rise', 179],
];

export const products: Product[] = catalog.map(([name, collection, img, colorway, price], i) => {
  const stock = i === 3 ? 6 : i === 7 ? 0 : int(18, 420);
  return {
    id: `p_${i + 1}`,
    sku: `STR-${collection.slice(0, 3).toUpperCase()}-${String(1040 + i * 7)}`,
    name,
    collection,
    image: `products/${img}.webp`,
    price,
    cost: Math.round(price * (0.34 + rnd() * 0.08)),
    stock,
    reorderAt: 25,
    sold30: int(60, 640),
    rating: Math.round((4.1 + rnd() * 0.85) * 10) / 10,
    status: i === 9 ? 'draft' : 'active',
    colorway,
    trend: Array.from({ length: 14 }, () => int(4, 40)),
  };
});

/* ------------------------------- Customers ------------------------------- */
export type Customer = {
  id: string;
  name: string;
  email: string;
  city: string;
  country: string;
  flag: string;
  orders: number;
  spent: number;
  segment: 'VIP' | 'Loyal' | 'New' | 'At risk';
  joined: string;
  lastOrder: string;
  avatarHue: number;
};

const first = ['Omar', 'Layla', 'Youssef', 'Mariam', 'Ahmed', 'Nour', 'Karim', 'Salma', 'Hana', 'Ziad', 'Emma', 'Liam', 'Sofia', 'Noah', 'Mia', 'Lucas', 'Chloe', 'Ethan', 'Aria', 'Mateo', 'Yuki', 'Kenji', 'Amara', 'Diego', 'Freya', 'Elias', 'Ines', 'Malik', 'Zara', 'Felix'];
const last = ['Hassan', 'Farouk', 'Mansour', 'Khalil', 'Saleh', 'Nasser', 'Carter', 'Bennett', 'Romero', 'Laurent', 'Schmidt', 'Rossi', 'Tanaka', 'Okafor', 'Silva', 'Novak', 'Lindqvist', 'Haddad', 'Mercer', 'Duarte'];
const places: [string, string, string][] = [
  ['Cairo', 'Egypt', '🇪🇬'], ['Dubai', 'UAE', '🇦🇪'], ['Riyadh', 'Saudi Arabia', '🇸🇦'], ['London', 'United Kingdom', '🇬🇧'],
  ['New York', 'United States', '🇺🇸'], ['Berlin', 'Germany', '🇩🇪'], ['Paris', 'France', '🇫🇷'], ['Austin', 'United States', '🇺🇸'],
  ['Amsterdam', 'Netherlands', '🇳🇱'], ['Doha', 'Qatar', '🇶🇦'], ['Milan', 'Italy', '🇮🇹'], ['Toronto', 'Canada', '🇨🇦'],
];

export const customers: Customer[] = Array.from({ length: 96 }, (_, i) => {
  const f = first[i % first.length];
  const l = pick(last);
  const [city, country, flag] = places[i % 5 === 0 ? 0 : int(0, places.length - 1)];
  const orders = int(1, 24);
  const spent = orders * int(95, 260);
  const segment: Customer['segment'] = spent > 3200 ? 'VIP' : orders > 7 ? 'Loyal' : i % 7 === 0 ? 'At risk' : 'New';
  return {
    id: `c_${1000 + i}`,
    name: `${f} ${l}`,
    email: `${f}.${l}`.toLowerCase() + pick(['@gmail.com', '@outlook.com', '@icloud.com', '@proton.me']),
    city, country, flag, orders, spent, segment,
    joined: daysAgo(int(30, 720)),
    lastOrder: daysAgo(segment === 'At risk' ? int(70, 160) : int(0, 40)),
    avatarHue: int(0, 360),
  };
});

/* --------------------------------- Orders -------------------------------- */
export type OrderStatus = 'Pending' | 'Paid' | 'Fulfilled' | 'Shipped' | 'Delivered' | 'Refunded' | 'Cancelled';
export type Order = {
  id: string;
  number: string;
  customerId: string;
  date: string;
  channel: 'Online store' | 'Instagram' | 'TikTok Shop' | 'Retail POS' | 'Wholesale';
  items: { productId: string; qty: number; size: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  payment: 'Visa' | 'Mastercard' | 'Apple Pay' | 'PayPal' | 'Cash on delivery';
  carrier: string;
  tracking: string;
};

const channels: Order['channel'][] = ['Online store', 'Online store', 'Online store', 'Instagram', 'TikTok Shop', 'Retail POS', 'Wholesale'];
const pays: Order['payment'][] = ['Visa', 'Mastercard', 'Apple Pay', 'PayPal', 'Cash on delivery'];

export const orders: Order[] = Array.from({ length: 260 }, (_, i) => {
  const age = Math.floor((i / 260) ** 1.15 * 90);
  const lines = Array.from({ length: rnd() > 0.72 ? 2 : 1 }, () => ({
    productId: pick(products.slice(0, 9)).id,
    qty: rnd() > 0.85 ? 2 : 1,
    size: pick([39, 40, 41, 42, 43, 44, 45]),
  }));
  const subtotal = lines.reduce((s, l) => s + products.find((p) => p.id === l.productId)!.price * l.qty, 0);
  const shipping = subtotal > 150 ? 0 : 9;
  let status: OrderStatus;
  if (age <= 1) status = pick(['Pending', 'Paid', 'Paid', 'Fulfilled']);
  else if (age <= 4) status = pick(['Fulfilled', 'Shipped', 'Shipped', 'Paid']);
  else status = rnd() > 0.94 ? 'Refunded' : rnd() > 0.97 ? 'Cancelled' : 'Delivered';
  return {
    id: `o_${i}`,
    number: `#${(48210 - i).toString()}`,
    customerId: customers[int(0, customers.length - 1)].id,
    date: daysAgo(age),
    channel: pick(channels),
    items: lines,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status,
    payment: pick(pays),
    carrier: pick(['DHL Express', 'Aramex', 'UPS', 'FedEx']),
    tracking: `1Z${int(100000, 999999)}${int(1000, 9999)}`,
  };
})
  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  .map((o, i) => ({ ...o, number: `#${48210 - i}`, status: (i < 4 ? 'Pending' : i < 12 && o.status === 'Delivered' ? 'Paid' : o.status) as OrderStatus }));

/* -------------------------------- Revenue -------------------------------- */
const rawDaily = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - (89 - i));
  const base = 6200 + i * 74;
  const weekly = Math.sin((i / 7) * Math.PI * 2) * 900;
  const noise = (rnd() - 0.4) * 1800;
  const revenue = Math.round(base + weekly + noise + (i > 80 ? 2600 : 0));
  return { date: d.toISOString(), revenue };
});
// Calibrate so the last 30 days equal October's headline revenue ($268.4K).
const k = 268400 / rawDaily.slice(-30).reduce((s, d) => s + d.revenue, 0);
export const revenueDaily = rawDaily.map((d, i) => {
  const revenue = Math.round(d.revenue * k);
  const orders = Math.round(revenue / (126 + Math.sin(i / 4) * 3));
  return { date: d.date, revenue, orders, visitors: Math.round(orders / (0.03 + Math.sin(i / 6) * 0.0018)) };
});

export const monthly = [
  { m: 'Nov', revenue: 142000, target: 130000 }, { m: 'Dec', revenue: 198000, target: 170000 },
  { m: 'Jan', revenue: 121000, target: 135000 }, { m: 'Feb', revenue: 134000, target: 138000 },
  { m: 'Mar', revenue: 158000, target: 145000 }, { m: 'Apr', revenue: 166000, target: 150000 },
  { m: 'May', revenue: 181000, target: 160000 }, { m: 'Jun', revenue: 176000, target: 168000 },
  { m: 'Jul', revenue: 204000, target: 175000 }, { m: 'Aug', revenue: 219000, target: 190000 },
  { m: 'Sep', revenue: 236000, target: 205000 }, { m: 'Oct', revenue: 268400, target: 220000 },
];

export const channelMix = [
  { label: 'Online store', value: 48, color: 'var(--c1)' },
  { label: 'Instagram', value: 19, color: 'var(--c2)' },
  { label: 'TikTok Shop', value: 14, color: 'var(--c3)' },
  { label: 'Retail POS', value: 12, color: 'var(--c4)' },
  { label: 'Wholesale', value: 7, color: 'var(--c5)' },
];

export const funnel = [
  { label: 'Sessions', value: 284120 },
  { label: 'Product views', value: 141880 },
  { label: 'Added to cart', value: 38410 },
  { label: 'Checkout', value: 16920 },
  { label: 'Purchased', value: 8806 },
];

export const geo = [
  { country: 'Egypt', flag: '🇪🇬', revenue: 71200, share: 26.5 },
  { country: 'United Arab Emirates', flag: '🇦🇪', revenue: 52800, share: 19.7 },
  { country: 'Saudi Arabia', flag: '🇸🇦', revenue: 44100, share: 16.4 },
  { country: 'United States', flag: '🇺🇸', revenue: 38900, share: 14.5 },
  { country: 'United Kingdom', flag: '🇬🇧', revenue: 27300, share: 10.2 },
  { country: 'Germany', flag: '🇩🇪', revenue: 18600, share: 6.9 },
];

export const cohorts = Array.from({ length: 8 }, (_, r) => ({
  label: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][r],
  size: int(820, 1600),
  values: Array.from({ length: 8 - r }, (_, c) => (c === 0 ? 100 : Math.max(8, Math.round(100 * Math.pow(0.78 + r * 0.012, c) - rnd() * 6)))),
}));

/* ---------------------------------- Team --------------------------------- */
export type Member = { id: string; name: string; email: string; role: 'Owner' | 'Admin' | 'Manager' | 'Support' | 'Analyst'; status: 'Active' | 'Invited'; lastActive: string; hue: number; title: string };
export const team: Member[] = [
  { id: 'u1', name: 'Mohamed Mohsen', email: 'mohamed@stride.co', role: 'Owner', status: 'Active', lastActive: 'Online now', hue: 250, title: 'Founder & CEO' },
  { id: 'u2', name: 'Salma Farouk', email: 'salma@stride.co', role: 'Admin', status: 'Active', lastActive: '12 min ago', hue: 330, title: 'Head of Operations' },
  { id: 'u3', name: 'Lucas Bennett', email: 'lucas@stride.co', role: 'Manager', status: 'Active', lastActive: '1 hour ago', hue: 30, title: 'E-commerce Manager' },
  { id: 'u4', name: 'Nour Haddad', email: 'nour@stride.co', role: 'Analyst', status: 'Active', lastActive: '3 hours ago', hue: 160, title: 'Growth Analyst' },
  { id: 'u5', name: 'Kenji Tanaka', email: 'kenji@stride.co', role: 'Support', status: 'Active', lastActive: 'Yesterday', hue: 200, title: 'Customer Experience' },
  { id: 'u6', name: 'Freya Lindqvist', email: 'freya@stride.co', role: 'Manager', status: 'Active', lastActive: '2 days ago', hue: 90, title: 'Merchandising Lead' },
  { id: 'u7', name: 'Ziad Mansour', email: 'ziad@stride.co', role: 'Support', status: 'Invited', lastActive: 'Pending invite', hue: 10, title: 'Support Agent' },
];

/* -------------------------------- Invoices ------------------------------- */
export type Invoice = { id: string; number: string; client: string; email: string; issued: string; due: string; amount: number; status: 'Paid' | 'Open' | 'Overdue' | 'Draft'; items: { desc: string; qty: number; price: number }[] };
const wholesale = ['Urban Sole Collective', 'Northline Sports', 'Kicks Lab Dubai', 'Cairo Street Supply', 'Sneaker District LDN', 'Atlas Running Co.', 'Mosaic Concept Store', 'Peak Outfitters'];
export const invoices: Invoice[] = Array.from({ length: 24 }, (_, i) => {
  const items = Array.from({ length: int(1, 3) }, () => {
    const p = pick(products);
    return { desc: `${p.name} — ${p.colorway}`, qty: int(6, 48), price: Math.round(p.price * 0.58) };
  });
  const amount = items.reduce((s, it) => s + it.qty * it.price, 0);
  const issuedAgo = i * 4 + int(0, 3);
  const status: Invoice['status'] = i < 2 ? 'Draft' : issuedAgo < 28 ? pick(['Open', 'Paid', 'Open']) : issuedAgo > 31 && issuedAgo < 56 && rnd() > 0.45 ? 'Overdue' : 'Paid';
  const client = wholesale[i % wholesale.length];
  return {
    id: `inv_${i}`,
    number: `INV-2026-${String(318 - i).padStart(4, '0')}`,
    client,
    email: 'accounts@' + client.toLowerCase().replace(/[^a-z]/g, '') + '.com',
    issued: daysAgo(issuedAgo),
    due: daysAgo(issuedAgo - 30),
    amount, status, items,
  };
});

/* ------------------------------ Integrations ----------------------------- */
export type Integration = { id: string; name: string; category: 'Sales' | 'Payments' | 'Marketing' | 'Shipping' | 'Finance' | 'Workflow'; desc: string; connected: boolean; color: string };
export const integrations: Integration[] = [
  { id: 'shopify', name: 'Shopify', category: 'Sales', desc: 'Sync products, orders and inventory in real time.', connected: true, color: '#95bf47' },
  { id: 'stripe', name: 'Stripe', category: 'Payments', desc: 'Payouts, disputes and fees reconciled automatically.', connected: true, color: '#635bff' },
  { id: 'paypal', name: 'PayPal', category: 'Payments', desc: 'Import PayPal transactions and refunds.', connected: false, color: '#0070e0' },
  { id: 'meta', name: 'Meta Ads', category: 'Marketing', desc: 'Attribute revenue to Facebook & Instagram campaigns.', connected: true, color: '#0866ff' },
  { id: 'tiktok', name: 'TikTok Shop', category: 'Sales', desc: 'Pull TikTok Shop orders into one unified inbox.', connected: true, color: '#ff0050' },
  { id: 'google', name: 'Google Analytics', category: 'Marketing', desc: 'Blend sessions & funnels with order data.', connected: true, color: '#f9ab00' },
  { id: 'klaviyo', name: 'Klaviyo', category: 'Marketing', desc: 'Push segments to email & SMS flows.', connected: false, color: '#232426' },
  { id: 'slack', name: 'Slack', category: 'Workflow', desc: 'Real-time alerts for big orders & low stock.', connected: true, color: '#e01e5a' },
  { id: 'dhl', name: 'DHL Express', category: 'Shipping', desc: 'Create labels and track shipments.', connected: true, color: '#ffcc00' },
  { id: 'aramex', name: 'Aramex', category: 'Shipping', desc: 'MENA last-mile delivery with COD support.', connected: false, color: '#e2231a' },
  { id: 'quickbooks', name: 'QuickBooks', category: 'Finance', desc: 'Auto-post sales, fees & COGS to your books.', connected: false, color: '#2ca01c' },
  { id: 'zapier', name: 'Zapier', category: 'Workflow', desc: 'Connect Velora to 6,000+ apps without code.', connected: false, color: '#ff4f00' },
];

/* ----------------------------- Activity feed ----------------------------- */
export const activity = [
  { icon: 'order', text: 'New order #48210 from Omar Hassan', meta: '$258.00 · Online store', time: '2m' },
  { icon: 'stock', text: 'Court Blazer Mid ’77 · Pine Green is low on stock', meta: '6 pairs left', time: '14m' },
  { icon: 'review', text: 'Layla Farouk left a 5★ review', meta: 'Legacy One Retro', time: '38m' },
  { icon: 'payout', text: 'Stripe payout initiated', meta: '$18,420.55 → •• 4417', time: '1h' },
  { icon: 'team', text: 'Salma Farouk fulfilled 24 orders', meta: 'Warehouse · Cairo', time: '2h' },
  { icon: 'order', text: 'Wholesale PO from Kicks Lab Dubai', meta: '96 pairs · INV-2026-0316', time: '3h' },
];

export const notifications = [
  { id: 'n1', title: 'Revenue milestone unlocked', body: 'October just passed $250K — your best month ever. 🎉', time: '5m', unread: true, kind: 'success' },
  { id: 'n2', title: 'Low stock alert', body: 'Court Blazer Mid ’77 · Pine Green has 6 pairs left.', time: '14m', unread: true, kind: 'warning' },
  { id: 'n3', title: 'Invoice overdue', body: 'Northline Sports — INV-2026-0291 is 6 days overdue.', time: '2h', unread: true, kind: 'danger' },
  { id: 'n4', title: 'Weekly report is ready', body: 'Conversion rate climbed 0.4 pts week over week.', time: '1d', unread: false, kind: 'info' },
];

export const workspace = { name: 'Stride Athletics', plan: 'Scale', domain: 'stride.co', currency: 'USD' };
