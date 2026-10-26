import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { LuMail, LuLock, LuArrowRight, LuEye, LuEyeOff, LuBuilding2, LuUser, LuCheck, LuArrowLeft } from 'react-icons/lu';
import { SiGoogle, SiApple } from 'react-icons/si';
import { Link, useRouter } from '../../lib/router';
import { useStore } from '../../lib/store';
import { Logo, Button, Field, Input, Avatar } from '../../components/ui';
import { Sparkline } from '../../components/charts';
import { CountUp } from '../../lib/motion';

function AuthVisual() {
  const quotes = [
    ['Velora gave us one source of truth across six channels. Fulfillment is 41% faster.', 'Salma Farouk', 'COO, Cairo Street Supply', 330],
    ['We haven’t had a single stock-out since turning on AI forecasts.', 'Lucas Bennett', 'Head of E-commerce, Northline', 30],
    ['It feels like Linear for commerce — fast, opinionated, beautiful.', 'Freya Lindqvist', 'Founder, Halcyon', 90],
  ] as const;
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % quotes.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="auth-visual">
      <div className="aurora a1" />
      <div className="aurora a2" />
      <div className="auth-grid" />
      <div className="auth-cards">
        <div className="auth-card ac-1">
          <span>Revenue this month</span>
          <b>
            $<CountUp value={268400} duration={2200} />
          </b>
          <Sparkline values={[12, 18, 15, 22, 28, 24, 33, 38, 35, 44, 52, 58]} width={220} height={54} />
        </div>
        <div className="auth-card ac-2">
          <img src="products/hippie.webp" alt="" />
          <div>
            <b>Hippie Space Runner</b>
            <span>Restocked · 240 pairs</span>
          </div>
        </div>
        <div className="auth-card ac-3">
          <span className="ok">
            <LuCheck />
          </span>
          <div>
            <b>Order #48210 shipped</b>
            <span>DHL Express · arrives Thu</span>
          </div>
        </div>
      </div>
      <div className="auth-quote">
        {quotes.map(([q, n, r, h], k) => (
          <figure key={n} className={k === i ? 'on' : ''}>
            <blockquote>“{q}”</blockquote>
            <figcaption>
              <Avatar name={n} hue={h} size={36} />
              <div>
                <b>{n}</b>
                <span>{r}</span>
              </div>
            </figcaption>
          </figure>
        ))}
        <div className="auth-dots">
          {quotes.map((_, k) => (
            <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Quote ${k + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth-form-side">
        <div className="auth-top">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/" className="btn btn-ghost btn-sm">
            <LuArrowLeft /> Back to site
          </Link>
        </div>
        <div className="auth-form-wrap">{children}</div>
        <p className="auth-legal">© 2026 Velora Inc. · Privacy · Terms</p>
      </div>
      <AuthVisual />
    </div>
  );
}

function Social() {
  const { toast } = useStore();
  return (
    <>
      <div className="auth-social">
        <Button type="button" icon={<SiGoogle />} onClick={() => toast({ title: 'Google sign-in is disabled in the demo', body: 'Use the demo credentials instead.', tone: 'info' })}>
          Google
        </Button>
        <Button type="button" icon={<SiApple />} onClick={() => toast({ title: 'Apple sign-in is disabled in the demo', body: 'Use the demo credentials instead.', tone: 'info' })}>
          Apple
        </Button>
      </div>
      <div className="auth-or">
        <span>or continue with email</span>
      </div>
    </>
  );
}

export function Login() {
  const { login, toast } = useStore();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('mohamed@stride.co');
  const [pw, setPw] = useState('velora-demo');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    document.title = 'Sign in · Velora';
  }, []);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.');
    if (pw.length < 6) return setErr('Password must be at least 6 characters.');
    setErr('');
    setLoading(true);
    setTimeout(() => {
      login({ name: 'Mohamed Mohsen', email, company: 'Stride Athletics' });
      toast({ title: 'Welcome back, Mohamed 👋', body: 'You have 3 new notifications.' });
      navigate('/app/overview');
    }, 900);
  };
  return (
    <Shell>
      <form className="auth-form" onSubmit={submit} noValidate>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your Velora workspace.</p>
        <div className="demo-note">
          <b>Demo mode</b> — credentials are pre-filled. Just hit sign in.
        </div>
        <Social />
        <Field label="Work email">
          <Input icon={<LuMail />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        <Field label="Password">
          <Input
            icon={<LuLock />}
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        <div className="auth-row">
          <label className="check">
            <input type="checkbox" defaultChecked /> <span>Keep me signed in</span>
          </label>
          <button type="button" className="link" onClick={() => setShow((s) => !s)}>
            {show ? <LuEyeOff /> : <LuEye />} {show ? 'Hide' : 'Show'} password
          </button>
        </div>
        {err && <div className="form-err">{err}</div>}
        <Button variant="accent" size="lg" type="submit" loading={loading} iconRight={!loading && <LuArrowRight />}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="auth-switch">
          New to Velora? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </Shell>
  );
}

export function Signup() {
  const { login, toast } = useStore();
  const { navigate } = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', company: '', size: '1–10', channels: ['Online store'] as string[], pw: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    document.title = 'Create your account · Velora';
  }, []);
  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const next = (e: FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      if (form.name.trim().length < 2) return setErr('Tell us your full name.');
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr('Enter a valid work email.');
      if (form.pw.length < 8) return setErr('Use at least 8 characters for your password.');
      setErr('');
      return setStep(1);
    }
    if (form.company.trim().length < 2) return setErr('What is your brand called?');
    setErr('');
    setLoading(true);
    setTimeout(() => {
      login({ name: form.name, email: form.email, company: form.company });
      toast({ title: `Workspace “${form.company}” is ready`, body: 'We loaded sample data so you can explore right away.' });
      navigate('/app/overview');
    }, 1100);
  };
  const strength = Math.min(4, [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(form.pw)).length);
  return (
    <Shell>
      <form className="auth-form" onSubmit={next} noValidate>
        <div className="steps">
          {['Account', 'Workspace'].map((s, i) => (
            <span key={s} className={i <= step ? 'on' : ''}>
              <i>{i < step ? <LuCheck /> : i + 1}</i> {s}
            </span>
          ))}
        </div>
        <h1>{step === 0 ? 'Create your account' : 'Set up your workspace'}</h1>
        <p className="auth-sub">{step === 0 ? 'Start your 14-day free trial. No credit card required.' : 'Tell us a little about your brand.'}</p>
        <div className="step-body" key={step}>
          {step === 0 ? (
            <>
              <Social />
              <Field label="Full name">
                <Input icon={<LuUser />} placeholder="Mohamed Mohsen" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field label="Work email">
                <Input icon={<LuMail />} type="email" placeholder="you@brand.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Password">
                <Input icon={<LuLock />} type="password" placeholder="At least 8 characters" value={form.pw} onChange={(e) => set('pw', e.target.value)} />
                <div className={`strength s${strength}`}>
                  {[0, 1, 2, 3].map((k) => (
                    <i key={k} />
                  ))}
                  <span>{['Too weak', 'Weak', 'Okay', 'Strong', 'Excellent'][strength]}</span>
                </div>
              </Field>
            </>
          ) : (
            <>
              <Field label="Brand name">
                <Input icon={<LuBuilding2 />} placeholder="Stride Athletics" value={form.company} onChange={(e) => set('company', e.target.value)} />
              </Field>
              <Field label="Team size">
                <div className="chips">
                  {['1–10', '11–50', '51–200', '200+'].map((s) => (
                    <button type="button" key={s} className={form.size === s ? 'on' : ''} onClick={() => set('size', s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Where do you sell?">
                <div className="chips">
                  {['Online store', 'Instagram', 'TikTok Shop', 'Retail POS', 'Wholesale', 'Marketplaces'].map((c) => {
                    const on = form.channels.includes(c);
                    return (
                      <button type="button" key={c} className={on ? 'on' : ''} onClick={() => set('channels', on ? form.channels.filter((x) => x !== c) : [...form.channels, c])}>
                        {on && <LuCheck />} {c}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </>
          )}
        </div>
        {err && <div className="form-err">{err}</div>}
        <div className="auth-actions">
          {step === 1 && (
            <Button type="button" variant="ghost" size="lg" onClick={() => setStep(0)} icon={<LuArrowLeft />}>
              Back
            </Button>
          )}
          <Button variant="accent" size="lg" type="submit" loading={loading} iconRight={!loading && <LuArrowRight />}>
            {step === 0 ? 'Continue' : loading ? 'Creating workspace…' : 'Create workspace'}
          </Button>
        </div>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </Shell>
  );
}
