import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import './styles/base.css';
import './styles/landing.css';
import './styles/app.css';
import { RouterProvider, useRouter } from './lib/router';
import { StoreProvider } from './lib/store';
import { Toasts } from './components/ui';
import Landing from './pages/marketing/Landing';
import { Login, Signup } from './pages/auth/Auth';
import AppShell from './pages/app/AppShell';

function Routes() {
  const { path } = useRouter();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [path.split('?')[0]]);

  if (path === '/login') return <Login />;
  if (path === '/signup') return <Signup />;
  if (path.startsWith('/app')) return <AppShell />;
  return <Landing />;
}

createRoot(document.getElementById('root')!).render(
  <StoreProvider>
    <RouterProvider>
      <Routes />
      <Toasts />
    </RouterProvider>
  </StoreProvider>,
);
