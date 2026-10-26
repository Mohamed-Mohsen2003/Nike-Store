import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  LuLayoutDashboard, LuShoppingBag, LuBox, LuUsers, LuChartColumn, LuFileText, LuPlug, LuCreditCard, LuSettings, LuSearch, LuBell,
  LuSun, LuMoon, LuLogOut, LuChevronsUpDown, LuPanelLeft, LuMenu, LuSparkles, LuUserCog, LuRotateCcw, LuArrowRight, LuCheck, LuCircleHelp, LuX, LuUsersRound,
} from 'react-icons/lu';
import { Link, match, useRouter } from '../../lib/router';
import { useStore } from '../../lib/store';
import { Avatar, Logo, Menu, MenuItem, Kbd, Badge } from '../../components/ui';
import { notifications as seedNotifs, workspace } from '../../lib/data';
import { cx, money } from '../../lib/format';
import Overview from './Overview';
import Orders from './Orders';
import Products from './Products';
import Customers from './Customers';
import Analytics from './Analytics';
import Invoices from './Invoices';
import Team from './Team';
import Integrations from './Integrations';
import Billing from './Billing';
import Settings from './Settings';

type NavItem = { to: string; label: string; icon: ReactNode; count?: number };

function useNav(): { group: string; items: NavItem[] }[] {
  const { orders, products } = useStore();
  const pending = orders.filter((o) => o.status === 'Pending' || o.status === 'Paid').length;
  const low = products.filter((p) => p.stock <= p.reorderAt).length;
  return [
    {
      group: 'Workspace',
      items: [
        { to: '/app/overview', label: 'Overview', icon: <LuLayoutDashboard /> },
        { to: '/app/orders', label: 'Orders', icon: <LuShoppingBag />, count: pending },
        { to: '/app/products', label: 'Products', icon: <LuBox />, count: low },
        { to: '/app/customers', label: 'Customers', icon: <LuUsers /> },
        { to: '/app/analytics', label: 'Analytics', icon: <LuChartColumn /> },
        { to: '/app/invoices', label: 'Invoices', icon: <LuFileText /> },
      ],
    },
    {
      group: 'Organization',
      items: [
        { to: '/app/team', label: 'Team', icon: <LuUsersRound /> },
        { to: '/app/integrations', label: 'Integrations', icon: <LuPlug /> },
        { to: '/app/billing', label: 'Billing', icon: <LuCreditCard /> },
        { to: '/app/settings', label: 'Settings', icon: <LuSettings /> },
      ],
    },
  ];
}

/* ---------------------------- Command palette ---------------------------- */
function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate } = useRouter();
  const { orders, products, customers, toggleTheme, theme } = useStore();
  const nav = useNav();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  type R = { id: string; group: string; label: string; hint?: string; icon: ReactNode; run: () => void };
  const results: R[] = useMemo(() => {
    const s = q.toLowerCase().trim();
    const pages: R[] = nav.flatMap((g) => g.items).map((i) => ({ id: i.to, group: 'Pages', label: i.label, icon: i.icon, run: () => navigate(i.to) }));
    const actions: R[] = [
      { id: 'a1', group: 'Actions', label: 'Create product', icon: <LuBox />, hint: 'N', run: () => navigate('/app/products?new=1') },
      { id: 'a2', group: 'Actions', label: 'New invoice', icon: <LuFileText />, run: () => navigate('/app/invoices?new=1') },
      { id: 'a3', group: 'Actions', label: 'Invite teammate', icon: <LuUserCog />, run: () => navigate('/app/team?invite=1') },
      { id: 'a4', group: 'Actions', label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`, icon: theme === 'dark' ? <LuSun /> : <LuMoon />, run: toggleTheme },
    ];
    if (!s) return [...pages.slice(0, 6), ...actions];
    const f = (t: string) => t.toLowerCase().includes(s);
    return [
      ...pages.filter((p) => f(p.label)),
      ...actions.filter((a) => f(a.label)),
      ...orders.filter((o) => f(o.number)).slice(0, 4).map((o) => ({ id: o.id, group: 'Orders', label: `Order ${o.number}`, hint: money(o.total), icon: <LuShoppingBag />, run: () => navigate(`/app/orders/${o.id}`) })),
      ...products.filter((p) => f(p.name) || f(p.sku) || f(p.colorway)).slice(0, 4).map((p) => ({ id: p.id, group: 'Products', label: `${p.name} · ${p.colorway}`, hint: p.sku, icon: <img src={p.image} alt="" className="cp-img" />, run: () => navigate(`/app/products?edit=${p.id}`) })),
      ...customers.filter((c) => f(c.name) || f(c.email)).slice(0, 4).map((c) => ({ id: c.id, group: 'Customers', label: c.name, hint: c.email, icon: <Avatar name={c.name} hue={c.avatarHue} size={20} />, run: () => navigate(`/app/customers/${c.id}`) })),
    ];
  }, [q, nav, orders, products, customers, navigate, theme, toggleTheme]);

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel((s) => Math.min(results.length - 1, s + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) => Math.max(0, s - 1));
      }
      if (e.key === 'Enter' && results[sel]) {
        results[sel].run();
        onClose();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, results, sel, onClose]);

  if (!open) return null;
  let lastGroup = '';
  return (
    <div className="overlay in cp-overlay" onMouseDown={onClose}>
      <div className="cp" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cp-input">
          <LuSearch />
          <input ref={input} autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders, products, customers or jump to…" />
          <Kbd>ESC</Kbd>
        </div>
        <div className="cp-list">
          {results.length === 0 && <div className="cp-empty">No results for “{q}”</div>}
          {results.map((r, i) => {
            const head = r.group !== lastGroup;
            lastGroup = r.group;
            return (
              <div key={r.group + r.id}>
                {head && <div className="cp-group">{r.group}</div>}
                <button
                  className={cx('cp-item', i === sel && 'on')}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => {
                    r.run();
                    onClose();
                  }}
                >
                  <span className="cp-ic">{r.icon}</span>
                  <span className="cp-label">{r.label}</span>
                  {r.hint && <span className="cp-hint">{r.hint}</span>}
                  <LuArrowRight className="cp-go" />
                </button>
              </div>
            );
          })}
        </div>
        <div className="cp-foot">
          <span>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> navigate
          </span>
          <span>
            <Kbd>↵</Kbd> open
          </span>
          <span className="cp-brand">
            <LuSparkles /> Velora Search
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Notifications ---------------------------- */
function Notifications() {
  const [items, setItems] = useState(seedNotifs);
  const unread = items.filter((n) => n.unread).length;
  return (
    <Menu
      trigger={() => (
        <button className="icon-btn" aria-label="Notifications">
          <LuBell />
          {unread > 0 && <span className="notif-dot">{unread}</span>}
        </button>
      )}
    >
      <div className="notif" onClick={(e) => e.stopPropagation()}>
        <div className="notif-head">
          <b>Notifications</b>
          <button className="link" onClick={() => setItems((x) => x.map((n) => ({ ...n, unread: false })))}>
            <LuCheck /> Mark all read
          </button>
        </div>
        {items.map((n) => (
          <div key={n.id} className={cx('notif-item', n.unread && 'unread')} onClick={() => setItems((x) => x.map((y) => (y.id === n.id ? { ...y, unread: false } : y)))}>
            <span className={`notif-ic tone-${n.kind === 'success' ? 'green' : n.kind === 'warning' ? 'amber' : n.kind === 'danger' ? 'red' : 'blue'}`} />
            <div>
              <b>{n.title}</b>
              <p>{n.body}</p>
              <span>{n.time} ago</span>
            </div>
          </div>
        ))}
      </div>
    </Menu>
  );
}

/* -------------------------------- Shell ---------------------------------- */
export default function AppShell() {
  const { path, navigate } = useRouter();
  const { user, login, logout, theme, toggleTheme, resetDemo, toast } = useStore();
  const nav = useNav();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('velora.sidebar') === '1';
    } catch {
      return false;
    }
  });
  const [mobile, setMobile] = useState(false);
  const [cp, setCp] = useState(false);
  const [banner, setBanner] = useState(true);

  useEffect(() => {
    if (!user) login({ name: 'Mohamed Mohsen', email: 'mohamed@stride.co', company: workspace.name });
  }, [user, login]);
  useEffect(() => {
    try {
      localStorage.setItem('velora.sidebar', collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);
  useEffect(() => setMobile(false), [path]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCp((o) => !o);
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const clean = path.split('?')[0];
  if (clean === '/app' || clean === '/app/') {
    navigate('/app/overview');
    return null;
  }

  const pages: [string, ReactNode][] = [
    ['/app/overview', <Overview />],
    ['/app/orders', <Orders />],
    ['/app/orders/:id', <Orders />],
    ['/app/products', <Products />],
    ['/app/customers', <Customers />],
    ['/app/customers/:id', <Customers />],
    ['/app/analytics', <Analytics />],
    ['/app/invoices', <Invoices />],
    ['/app/invoices/:id', <Invoices />],
    ['/app/team', <Team />],
    ['/app/integrations', <Integrations />],
    ['/app/billing', <Billing />],
    ['/app/settings', <Settings />],
  ];
  const page = pages.find(([p]) => match(p, clean));
  const section = clean.split('/')[2] ?? 'overview';
  const current = nav.flatMap((g) => g.items).find((i) => i.to.endsWith('/' + section));
  const name = user?.name ?? 'Mohamed Mohsen';

  return (
    <div className={cx('shell', collapsed && 'collapsed', mobile && 'mobile-open')}>
      <aside className="sidebar">
        <div className="sb-top">
          <Link to="/" className="sb-logo">
            <Logo size={26} word={!collapsed} />
          </Link>
          <button className="icon-btn sb-collapse" onClick={() => setCollapsed((c) => !c)} aria-label="Collapse sidebar">
            <LuPanelLeft />
          </button>
          <button className="icon-btn sb-close" onClick={() => setMobile(false)} aria-label="Close menu">
            <LuX />
          </button>
        </div>

        <Menu
          align="left"
          trigger={() => (
            <button className="ws-switch">
              <span className="ws-logo">S</span>
              <span className="ws-text">
                <b>{user?.company ?? workspace.name}</b>
                <span>{workspace.plan} plan · 7 seats</span>
              </span>
              <LuChevronsUpDown className="ws-caret" />
            </button>
          )}
        >
          <div className="menu-label">Workspaces</div>
          <MenuItem icon={<span className="ws-logo sm">S</span>}>
            {user?.company ?? workspace.name} <LuCheck style={{ marginLeft: 'auto' }} />
          </MenuItem>
          <MenuItem icon={<span className="ws-logo sm alt">H</span>} onClick={() => toast({ title: 'Halcyon Outlet is a demo workspace', body: 'Workspace switching is simulated.', tone: 'info' })}>
            Halcyon Outlet
          </MenuItem>
          <div className="menu-sep" />
          <MenuItem icon={<LuSettings />} onClick={() => navigate('/app/settings')}>
            Workspace settings
          </MenuItem>
        </Menu>

        <button className="sb-search" onClick={() => setCp(true)}>
          <LuSearch />
          <span>Search</span>
          <Kbd>⌘K</Kbd>
        </button>

        <nav className="sb-nav">
          {nav.map((g) => (
            <div key={g.group} className="sb-group">
              <div className="sb-label">{g.group}</div>
              {g.items.map((i) => {
                const on = clean.startsWith(i.to);
                return (
                  <Link key={i.to} to={i.to} className={cx('sb-item', on && 'on')} data-tip={i.label}>
                    {on && <span className="sb-ind" />}
                    {i.icon}
                    <span className="sb-text">{i.label}</span>
                    {!!i.count && <span className="sb-count">{i.count}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sb-upsell">
          <div className="sb-upsell-ic">
            <LuSparkles />
          </div>
          <b>Velora AI is on</b>
          <p>Forecasts refreshed 6 min ago. 2 products need restocking.</p>
          <Link to="/app/products" className="btn btn-accent btn-sm">
            Review restocks
          </Link>
        </div>

        <Menu
          align="left"
          up
          trigger={() => (
            <button className="sb-user">
              <Avatar name={name} hue={250} size={32} />
              <span className="ws-text">
                <b>{name}</b>
                <span>{user?.email ?? 'mohamed@stride.co'}</span>
              </span>
              <LuChevronsUpDown className="ws-caret" />
            </button>
          )}
        >
          <MenuItem icon={<LuUserCog />} onClick={() => navigate('/app/settings')}>
            Profile & preferences
          </MenuItem>
          <MenuItem icon={<LuCreditCard />} onClick={() => navigate('/app/billing')}>
            Billing
          </MenuItem>
          <MenuItem icon={<LuCircleHelp />} onClick={() => toast({ title: 'Help center', body: 'Our team replies in under 5 minutes, 24/7.', tone: 'info' })}>
            Help & support
          </MenuItem>
          <MenuItem
            icon={<LuRotateCcw />}
            onClick={() => {
              resetDemo();
              toast({ title: 'Demo data reset', body: 'Everything is back to its original state.' });
            }}
          >
            Reset demo data
          </MenuItem>
          <div className="menu-sep" />
          <MenuItem
            icon={<LuLogOut />}
            danger
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log out
          </MenuItem>
        </Menu>
      </aside>
      <div className="sb-scrim" onClick={() => setMobile(false)} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn tb-burger" onClick={() => setMobile(true)} aria-label="Open menu">
            <LuMenu />
          </button>
          <div className="crumbs">
            <span>{user?.company ?? workspace.name}</span>
            <i>/</i>
            <b>{current?.label ?? 'Overview'}</b>
          </div>
          <button className="tb-search" onClick={() => setCp(true)}>
            <LuSearch />
            <span>Search anything…</span>
            <Kbd>⌘K</Kbd>
          </button>
          <div className="tb-actions">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <span className={cx('theme-ic', theme)}>
                <LuSun />
                <LuMoon />
              </span>
            </button>
            <Notifications />
            <Link to="/app/settings" className="tb-avatar">
              <Avatar name={name} hue={250} size={30} />
            </Link>
          </div>
        </header>

        {banner && (
          <div className="demo-banner">
            <Badge tone="lime">Live demo</Badge>
            <span>You’re exploring a fully interactive demo with sample data — every change saves to your browser.</span>
            <button className="icon-btn sm" onClick={() => setBanner(false)} aria-label="Dismiss">
              <LuX />
            </button>
          </div>
        )}

        <main className="content" key={section}>
          {page ? page[1] : <Overview />}
        </main>
      </div>
      <CommandPalette open={cp} onClose={() => setCp(false)} />
    </div>
  );
}
