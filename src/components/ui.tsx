import { useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { LuX, LuCheck, LuInfo, LuTriangleAlert, LuCircleAlert, LuChevronDown } from 'react-icons/lu';
import { cx, initials } from '../lib/format';
import { useStore } from '../lib/store';

/* --------------------------------- Logo ---------------------------------- */
export function Logo({ size = 28, word = true }: { size?: number; word?: boolean }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id="lg-v" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="17" fill="var(--logo-bg)" />
        <path d="M15 17h10l7.2 19.5L39.4 17H49L37 47h-9.8z" fill="url(#lg-v)" />
      </svg>
      {word && <span className="logo-word">Velora</span>}
    </span>
  );
}

/* -------------------------------- Button --------------------------------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
};
export function Button({ variant = 'secondary', size = 'md', icon, iconRight, loading, children, className, ...rest }: BtnProps) {
  return (
    <button className={cx('btn', `btn-${variant}`, `btn-${size}`, loading && 'is-loading', className)} {...rest}>
      {loading ? <span className="spinner" /> : icon}
      {children && <span>{children}</span>}
      {iconRight}
    </button>
  );
}

/* --------------------------------- Card ---------------------------------- */
export function Card({ children, className, title, action, sub, pad = true }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode; sub?: ReactNode; pad?: boolean }) {
  return (
    <section className={cx('card', !pad && 'card-flush', className)}>
      {(title || action) && (
        <header className="card-head">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {sub && <p className="card-sub">{sub}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/* --------------------------------- Badge --------------------------------- */
const toneFor: Record<string, string> = {
  Paid: 'blue', Fulfilled: 'violet', Shipped: 'cyan', Delivered: 'green', Pending: 'amber', Refunded: 'gray', Cancelled: 'red',
  Open: 'blue', Overdue: 'red', Draft: 'gray', Active: 'green', Invited: 'amber', archived: 'gray', active: 'green', draft: 'gray',
  VIP: 'violet', Loyal: 'green', New: 'blue', 'At risk': 'red', Owner: 'violet', Admin: 'blue', Manager: 'cyan', Support: 'amber', Analyst: 'green',
};
export function Badge({ children, tone, dot = true }: { children: ReactNode; tone?: string; dot?: boolean }) {
  const t = tone ?? toneFor[String(children)] ?? 'gray';
  return (
    <span className={cx('badge', `tone-${t}`)}>
      {dot && <i />}
      {children}
    </span>
  );
}

export function Delta({ value, suffix = '%', invert = false }: { value: number; suffix?: string; invert?: boolean }) {
  const good = invert ? value <= 0 : value >= 0;
  return (
    <span className={cx('delta', good ? 'up' : 'down')}>
      {value >= 0 ? '▲' : '▼'} {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}

/* -------------------------------- Avatar --------------------------------- */
export function Avatar({ name, hue = 250, size = 32, img }: { name: string; hue?: number; size?: number; img?: string }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: img ? undefined : `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${(hue + 40) % 360} 70% 45%))` }}
    >
      {img ? <img src={img} alt="" /> : initials(name)}
    </span>
  );
}

/* --------------------------------- Inputs -------------------------------- */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
export function Input({ icon, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <span className={cx('input', className)}>
      {icon}
      <input {...rest} />
    </span>
  );
}
export function Select({ children, className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cx('input select', className)}>
      <select {...rest}>{children}</select>
      <LuChevronDown />
    </span>
  );
}
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={cx('switch', checked && 'on')} onClick={() => onChange(!checked)}>
      <i />
    </button>
  );
}

/* ---------------------- Segmented control w/ slider ---------------------- */
export function Segmented<T extends string>({ options, value, onChange, size = 'md' }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; size?: 'sm' | 'md' }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const el = wrap.current?.querySelector<HTMLButtonElement>(`[data-v="${value}"]`);
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, options.length]);
  return (
    <div className={cx('segmented', `seg-${size}`)} ref={wrap}>
      <span className="seg-ind" style={{ transform: `translateX(${ind.left}px)`, width: ind.width }} />
      {options.map((o) => (
        <button key={o.value} data-v={o.value} className={cx(o.value === value && 'on')} onClick={() => onChange(o.value)} type="button">
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------- Modal / Drawer ---------------------------- */
function useEsc(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', k);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
}

function usePresence(open: boolean, ms = 260) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(t);
  }, [open, ms]);
  return { mounted, shown };
}

export function Modal({ open, onClose, title, sub, children, footer, width = 520 }: { open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children?: ReactNode; footer?: ReactNode; width?: number }) {
  useEsc(open, onClose);
  const { mounted, shown } = usePresence(open);
  if (!mounted) return null;
  return createPortal(
    <div className={cx('overlay', shown && 'in')} onMouseDown={onClose}>
      <div className="modal" style={{ maxWidth: width }} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <header className="modal-head">
          <div>
            <h3>{title}</h3>
            {sub && <p>{sub}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <LuX />
          </button>
        </header>
        {children && <div className="modal-body">{children}</div>}
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, children, footer, width = 480 }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; width?: number }) {
  useEsc(open, onClose);
  const { mounted, shown } = usePresence(open, 340);
  if (!mounted) return null;
  return createPortal(
    <div className={cx('overlay overlay-drawer', shown && 'in')} onMouseDown={onClose}>
      <aside className="drawer" style={{ width }} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <header className="drawer-head">
          <div className="drawer-title">{title}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <LuX />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <footer className="drawer-foot">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
}

/* --------------------------------- Menu ---------------------------------- */
export function Menu({ trigger, children, align = 'right', up = false }: { trigger: (open: boolean) => ReactNode; children: ReactNode; align?: 'left' | 'right'; up?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div className="menu-wrap" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      <div className={cx('menu', `menu-${align}`, up && 'menu-up', open && 'open')} onClick={() => setOpen(false)}>
        {children}
      </div>
    </div>
  );
}
export function MenuItem({ icon, children, onClick, danger }: { icon?: ReactNode; children: ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button className={cx('menu-item', danger && 'danger')} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

/* --------------------------------- Misc ---------------------------------- */
export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function Progress({ value, tone = 'accent' }: { value: number; tone?: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 80);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className={cx('progress', `p-${tone}`)}>
      <i style={{ width: `${Math.min(100, w)}%` }} />
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

/* -------------------------------- Toasts --------------------------------- */
export function Toasts() {
  const { toasts, dismiss } = useStore();
  const icons = { success: <LuCheck />, info: <LuInfo />, warning: <LuTriangleAlert />, danger: <LuCircleAlert /> };
  return createPortal(
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={cx('toast', `tone-${t.tone ?? 'success'}`)}>
          <span className="toast-icon">{icons[t.tone ?? 'success']}</span>
          <div>
            <strong>{t.title}</strong>
            {t.body && <p>{t.body}</p>}
          </div>
          <button className="icon-btn sm" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <LuX />
          </button>
          <span className="toast-bar" />
        </div>
      ))}
    </div>,
    document.body,
  );
}

export function PageHeader({ title, sub, actions, eyebrow }: { title: string; sub?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function Pagination({ page, pages, onChange, total, label }: { page: number; pages: number; onChange: (p: number) => void; total: number; label: string }) {
  return (
    <div className="pagination">
      <span>
        {total.toLocaleString()} {label}
      </span>
      <div>
        <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <span className="page-num">
          {page} / {Math.max(1, pages)}
        </span>
        <Button size="sm" variant="ghost" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
