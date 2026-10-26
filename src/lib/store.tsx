import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as seed from './data';
import type { Customer, Integration, Invoice, Member, Order, OrderStatus, Product } from './data';

type Toast = { id: number; title: string; body?: string; tone?: 'success' | 'info' | 'warning' | 'danger' };
type User = { name: string; email: string; company: string } | null;

type State = {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  team: Member[];
  invoices: Invoice[];
  integrations: Integration[];
};

type Store = State & {
  user: User;
  theme: 'dark' | 'light';
  toasts: Toast[];
  login: (u: NonNullable<User>) => void;
  logout: () => void;
  toggleTheme: () => void;
  toast: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  setOrderStatus: (id: string, s: OrderStatus) => void;
  inviteMember: (m: Pick<Member, 'name' | 'email' | 'role'>) => void;
  removeMember: (id: string) => void;
  updateMemberRole: (id: string, role: Member['role']) => void;
  toggleIntegration: (id: string) => void;
  setInvoiceStatus: (id: string, s: Invoice['status']) => void;
  addInvoice: (inv: Invoice) => void;
  resetDemo: () => void;
  customerById: (id: string) => Customer | undefined;
  productById: (id: string) => Product | undefined;
};

const KEY = 'velora.state.v2';
const initial = (): State => ({
  products: seed.products,
  orders: seed.orders,
  customers: seed.customers,
  team: seed.team,
  invoices: seed.invoices,
  integrations: seed.integrations,
});

const load = <T,>(k: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const save = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* storage unavailable — demo still works in memory */
  }
};

const Ctx = createContext<Store>(null as unknown as Store);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => load(KEY, initial()));
  const [user, setUser] = useState<User>(() => load('velora.user', null));
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (document.documentElement.dataset.theme as 'dark' | 'light') || 'dark');
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => save(KEY, state), [state]);
  useEffect(() => save('velora.user', user), [user]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('velora.theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = Date.now() + Math.random();
      setToasts((x) => [...x.slice(-3), { ...t, id }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const patch = (fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) }));

  const value = useMemo<Store>(
    () => ({
      ...state,
      user,
      theme,
      toasts,
      login: (u) => setUser(u),
      logout: () => setUser(null),
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      toast,
      dismiss,
      upsertProduct: (p) =>
        patch((s) => ({
          products: s.products.some((x) => x.id === p.id) ? s.products.map((x) => (x.id === p.id ? p : x)) : [p, ...s.products],
        })),
      deleteProduct: (id) => patch((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      setOrderStatus: (id, status) => patch((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
      inviteMember: (m) =>
        patch((s) => ({
          team: [
            ...s.team,
            { ...m, id: 'u' + Date.now(), status: 'Invited', lastActive: 'Pending invite', hue: Math.floor(Math.random() * 360), title: m.role },
          ],
        })),
      removeMember: (id) => patch((s) => ({ team: s.team.filter((m) => m.id !== id) })),
      updateMemberRole: (id, role) => patch((s) => ({ team: s.team.map((m) => (m.id === id ? { ...m, role } : m)) })),
      toggleIntegration: (id) =>
        patch((s) => ({ integrations: s.integrations.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)) })),
      setInvoiceStatus: (id, status) => patch((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? { ...i, status } : i)) })),
      addInvoice: (inv) => patch((s) => ({ invoices: [inv, ...s.invoices] })),
      resetDemo: () => setState(initial()),
      customerById: (id) => state.customers.find((c) => c.id === id),
      productById: (id) => state.products.find((p) => p.id === id),
    }),
    [state, user, theme, toasts, toast, dismiss],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
