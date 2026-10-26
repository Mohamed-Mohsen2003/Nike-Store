import { createContext, useContext, useEffect, useState, type ReactNode, type MouseEvent } from 'react';

/** Tiny hash router — works on any static host (GitHub Pages, Vercel, Netlify) with zero config. */

const getPath = () => {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h : '/' + h;
};

type RouterCtx = { path: string; navigate: (to: string) => void };
const Ctx = createContext<RouterCtx>({ path: '/', navigate: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(getPath());
  useEffect(() => {
    const on = () => {
      setPath(getPath());
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const navigate = (to: string) => {
    if (to === path) return;
    window.location.hash = to;
  };
  return <Ctx.Provider value={{ path, navigate }}>{children}</Ctx.Provider>;
}

export const useRouter = () => useContext(Ctx);

export function Link({
  to,
  children,
  className,
  onClick,
  ...rest
}: { to: string; children: ReactNode; className?: string; onClick?: () => void } & Record<string, unknown>) {
  const { navigate } = useRouter();
  return (
    <a
      href={'#' + to}
      className={className}
      onClick={(e: MouseEvent) => {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Match "/app/orders/:id" style patterns. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('?')[0].split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}
