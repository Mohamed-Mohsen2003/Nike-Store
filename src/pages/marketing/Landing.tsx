import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  LuArrowRight, LuArrowUpRight, LuSparkles, LuCheck, LuZap, LuGlobe, LuShieldCheck, LuBox, LuUsers, LuWorkflow,
  LuChartLine, LuPlus, LuMenu, LuX, LuStar, LuShoppingBag, LuTruck, LuPlay, LuGithub, LuLinkedin, LuInstagram, LuTwitter, LuPackageCheck,
} from 'react-icons/lu';
import { Link, useRouter } from '../../lib/router';
import { Logo, Segmented, Avatar } from '../../components/ui';
import { BrandIcon } from '../../components/brands';
import { Reveal, CountUp, useTilt, useSpotlight, useMagnet } from '../../lib/motion';
import { AreaChart, Sparkline } from '../../components/charts';
import { revenueDaily, integrations, products } from '../../lib/data';
import { cx, compact } from '../../lib/format';

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/* ================================== NAV ================================== */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const links = [
    ['Product', 'features'],
    ['Workflow', 'workflow'],
    ['Integrations', 'integrations'],
    ['Customers', 'customers'],
    ['Pricing', 'pricing'],
  ];
  return (
    <header className={cx('mk-nav', scrolled && 'scrolled', open && 'open')}>
      <div className="mk-nav-inner">
        <Link to="/" className="mk-brand">
          <Logo />
        </Link>
        <nav className="mk-links">
          {links.map(([l, id]) => (
            <button key={id} onClick={() => scrollTo(id)}>
              {l}
            </button>
          ))}
        </nav>
        <div className="mk-nav-cta">
          <Link to="/login" className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link to="/signup" className="btn btn-primary btn-sm">
            Start free <LuArrowRight />
          </Link>
          <button className="icon-btn mk-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <LuX /> : <LuMenu />}
          </button>
        </div>
      </div>
      <div className="mk-mobile">
        {links.map(([l, id], i) => (
          <button
            key={id}
            style={{ transitionDelay: `${i * 40}ms` }}
            onClick={() => {
              setOpen(false);
              setTimeout(() => scrollTo(id), 50);
            }}
          >
            {l}
          </button>
        ))}
        <Link to="/app/overview" className="btn btn-accent btn-lg">
          Open live demo
        </Link>
      </div>
    </header>
  );
}

/* ================================= HERO ================================== */
function SplitWords({ text, start = 0, end = false }: { text: string; start?: number; end?: boolean }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <span key={i} className={cx('word', end && i === words.length - 1 && 'last')}>
          <span style={{ animationDelay: `${start + i * 70}ms` }}>{w}</span>
        </span>
      ))}
    </>
  );
}

function HeroDashboard() {
  const tilt = useTilt<HTMLDivElement>(6);
  const [y, setY] = useState(0);
  useEffect(() => {
    const on = () => setY(window.scrollY);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const last = revenueDaily.slice(-30);
  const rot = Math.max(0, 18 - y / 22);
  return (
    <div className="hero-stage" style={{ ['--scroll-rot' as string]: `${rot}deg` }}>
      <div className="hero-glow" />
      <div className="hero-frame" ref={tilt}>
        <div className="hf-bar">
          <span className="dots">
            <i />
            <i />
            <i />
          </span>
          <span className="hf-url">app.velora.io/stride-athletics/overview</span>
          <span className="hf-live">
            <i /> Live
          </span>
        </div>
        <div className="hf-body">
          <aside className="hf-side">
            <Logo size={22} word={false} />
            {[LuChartLine, LuShoppingBag, LuBox, LuUsers, LuWorkflow, LuGlobe].map((I, i) => (
              <span key={i} className={cx('hf-nav', i === 0 && 'on')}>
                <I />
              </span>
            ))}
          </aside>
          <div className="hf-main">
            <div className="hf-kpis">
              {[
                ['Revenue', 268400, '$', '+21.4%'],
                ['Orders', 2096, '', '+12.8%'],
                ['Conversion', 3.1, '', '+0.4 pts'],
                ['AOV', 128, '$', '+6.2%'],
              ].map(([l, v, p, d], i) => (
                <div className="hf-kpi" key={l as string} style={{ animationDelay: `${900 + i * 110}ms` }}>
                  <span>{l}</span>
                  <b>
                    {p}
                    <CountUp value={v as number} format={(n) => (l === 'Conversion' ? n.toFixed(1) + '%' : Math.round(n).toLocaleString())} duration={1800} />
                  </b>
                  <em>{d}</em>
                </div>
              ))}
            </div>
            <div className="hf-chart">
              <div className="hf-chart-head">
                <b>Revenue · last 30 days</b>
                <span>
                  <i className="sw a" /> This period <i className="sw b" /> Last period
                </span>
              </div>
              <AreaChart
                height={190}
                labels={last.map((d) => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}
                series={[
                  { key: 'prev', label: 'Last period', color: 'var(--accent-2)', values: last.map((d, i) => Math.round(d.revenue * 0.78 + Math.sin(i) * 600)), dashed: true },
                  { key: 'rev', label: 'Revenue', color: 'var(--accent)', values: last.map((d) => d.revenue) },
                ]}
                format={(n) => '$' + compact(n)}
              />
            </div>
            <div className="hf-rows">
              {products.slice(0, 3).map((p, i) => (
                <div key={p.id} className="hf-row" style={{ animationDelay: `${1400 + i * 120}ms` }}>
                  <span className="hf-thumb">
                    <img src={p.image} alt="" />
                  </span>
                  <div>
                    <b>{p.name}</b>
                    <span>{p.colorway}</span>
                  </div>
                  <Sparkline values={p.trend} width={80} height={26} />
                  <b className="tnum">${p.price}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="float-card fc-order">
        <span className="fc-ic green">
          <LuShoppingBag />
        </span>
        <div>
          <b>New order · $258.00</b>
          <span>Omar H. · Cairo 🇪🇬</span>
        </div>
      </div>
      <div className="float-card fc-product">
        <img src="products/jordan2.webp" alt="" />
        <div>
          <span className="fc-tag">Best seller</span>
          <b>Legacy One Retro</b>
          <div className="fc-stock">
            <i style={{ width: '72%' }} />
          </div>
          <span>412 sold this week</span>
        </div>
      </div>
      <div className="float-card fc-ai">
        <span className="fc-ic violet">
          <LuSparkles />
        </span>
        <div>
          <b>Restock Court Blazer</b>
          <span>AI forecast: sells out in 4 days</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const magnet = useMagnet<HTMLAnchorElement>(0.2);
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="aurora a1" />
        <div className="aurora a2" />
        <div className="aurora a3" />
        <div className="hero-grid" />
        <div className="noise" />
      </div>
      <div className="container hero-copy">
        <button className="pill-announce" onClick={() => scrollTo('features')}>
          <span className="pa-new">New</span>
          <span>Velora AI Forecasts — predict stock-outs 14 days ahead</span>
          <LuArrowRight />
        </button>
        <h1 className="hero-title">
          <SplitWords text="Run your entire brand" start={150} end />
          <br />
          <SplitWords text="from one" start={430} />
          <span className="word">
            <span className="serif hero-accent" style={{ animationDelay: '570ms' }}>
              calm
            </span>
          </span>
          <SplitWords text="workspace." start={640} end />
        </h1>
        <p className="hero-sub">
          Velora unifies orders, inventory, customers and revenue analytics across every channel — so modern retail teams ship faster, stock smarter, and grow with
          clarity.
        </p>
        <div className="hero-ctas">
          <Link to="/signup" className="btn btn-accent btn-lg" ref={magnet as never}>
            Start 14-day free trial <LuArrowRight />
          </Link>
          <Link to="/app/overview" className="btn btn-secondary btn-lg">
            <LuPlay /> Explore live demo
          </Link>
        </div>
        <div className="hero-proof">
          <div className="stack">
            {[250, 330, 30, 160, 200].map((h, i) => (
              <Avatar key={i} name={['Omar Hassan', 'Layla Farouk', 'Emma Carter', 'Noah Silva', 'Yuki Tanaka'][i]} hue={h} size={30} />
            ))}
          </div>
          <div>
            <span className="stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <LuStar key={i} />
              ))}
            </span>
            <span>
              Loved by <b>12,400+</b> brands · 4.9/5 on G2
            </span>
          </div>
        </div>
      </div>
      <div className="container">
        <HeroDashboard />
      </div>
    </section>
  );
}

/* ================================= LOGOS ================================= */
function Logos() {
  const names = ['NORTHLINE', 'kicks/lab', 'Atlas Running', 'MOSAIC', 'urban sole', 'PEAK·OUT', 'Halcyon', 'SOLE DISTRICT', 'verve', 'Cairo Street'];
  return (
    <section className="logos">
      <p>Powering operations for the fastest-growing brands in retail</p>
      <div className="marquee">
        <div className="marquee-track">
          {[...names, ...names].map((n, i) => (
            <span key={i} className={`lg lg-${i % 5}`}>
              {n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================= STATS ================================= */
function Stats() {
  const s = [
    { v: 12400, f: (n: number) => Math.round(n).toLocaleString() + '+', l: 'Brands running on Velora' },
    { v: 4.2, f: (n: number) => '$' + n.toFixed(1) + 'B', l: 'GMV processed every year' },
    { v: 38, f: (n: number) => Math.round(n) + '%', l: 'Faster order fulfillment' },
    { v: 99.99, f: (n: number) => n.toFixed(2) + '%', l: 'Uptime, backed by SLA' },
  ];
  return (
    <section className="container stats">
      {s.map((x, i) => (
        <Reveal key={x.l} delay={i * 90} className="stat">
          <CountUp value={x.v} format={x.f} duration={2000} className="stat-v" />
          <span>{x.l}</span>
        </Reveal>
      ))}
    </section>
  );
}

/* ================================ FEATURES =============================== */
function SectionHead({ eyebrow, title, sub, center = true }: { eyebrow: string; title: ReactNode; sub?: string; center?: boolean }) {
  return (
    <div className={cx('sec-head', center && 'center')}>
      <Reveal>
        <span className="eyebrow-pill">
          <i /> {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={80} as="h2">
        {title}
      </Reveal>
      {sub && (
        <Reveal delay={160} as="p">
          {sub}
        </Reveal>
      )}
    </div>
  );
}

function InboxVisual() {
  const items = [
    ['Online store', '#48210', '$258', 'green'],
    ['TikTok Shop', '#48209', '$139', 'violet'],
    ['Instagram', '#48208', '$305', 'cyan'],
    ['Retail POS', '#48207', '$179', 'amber'],
  ];
  return (
    <div className="v-inbox">
      {items.map(([c, n, a, t], i) => (
        <div key={n} className="v-inbox-row" style={{ animationDelay: `${i * 0.8}s` }}>
          <span className={`tone-dot tone-${t}`} />
          <b>{n}</b>
          <span>{c}</span>
          <em>{a}</em>
        </div>
      ))}
    </div>
  );
}

function ForecastVisual() {
  const v = [42, 55, 48, 62, 70, 66, 78, 84, 80, 92];
  return (
    <div className="v-forecast">
      {v.map((h, i) => (
        <span key={i} className={cx(i >= 7 && 'pred')} style={{ ['--h' as string]: `${h}%`, animationDelay: `${i * 70}ms` }} />
      ))}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <path d="M0 30 C 20 26, 30 22, 50 18 S 80 8, 100 4" />
      </svg>
    </div>
  );
}

function OrbitVisual() {
  return (
    <div className="v-orbit">
      <div className="v-orbit-core">
        <Avatar name="Layla Farouk" hue={330} size={46} />
      </div>
      <div className="ring r1">
        <span className="chip">VIP</span>
        <span className="chip c2">$4,820 LTV</span>
      </div>
      <div className="ring r2">
        <span className="chip c3">14 orders</span>
        <span className="chip c4">Size 41</span>
      </div>
    </div>
  );
}

function FlowVisual() {
  return (
    <div className="v-flow">
      <div className="node">
        <LuShoppingBag /> Order paid
      </div>
      <div className="wire">
        <i />
      </div>
      <div className="node">
        <LuPackageCheck /> Reserve stock
      </div>
      <div className="wire">
        <i />
      </div>
      <div className="node hot">
        <LuTruck /> Book DHL
      </div>
    </div>
  );
}

function LiveVisual() {
  const [v, setV] = useState(() => Array.from({ length: 24 }, (_, i) => 30 + Math.sin(i / 2) * 12 + i));
  useEffect(() => {
    const t = setInterval(() => setV((x) => [...x.slice(1), Math.max(10, x[x.length - 1] + (Math.random() - 0.42) * 14)]), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="v-live">
      <div className="v-live-num">
        <span className="pulse-dot" /> <CountUp value={1284 + Math.round(v[v.length - 1])} duration={600} /> <em>visitors now</em>
      </div>
      <Sparkline values={v} width={300} height={70} />
    </div>
  );
}

function GlobeVisual() {
  return (
    <div className="v-globe">
      <div className="globe">
        <div className="globe-lines" />
        {[
          [22, 38],
          [48, 30],
          [62, 52],
          [35, 62],
          [74, 34],
        ].map(([x, y], i) => (
          <span key={i} className="ping" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>
      <div className="currencies">
        {['USD', 'EGP', 'AED', 'SAR', 'EUR', 'GBP'].map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
    </div>
  );
}

function ShieldVisual() {
  return (
    <div className="v-shield">
      <span className="sh-ring r1" />
      <span className="sh-ring r2" />
      <span className="sh-ring r3" />
      <div className="sh-core">
        <LuShieldCheck />
      </div>
      <span className="sh-tag t1">SSO</span>
      <span className="sh-tag t2">AES-256</span>
      <span className="sh-tag t3">Audit log</span>
    </div>
  );
}

function Features() {
  const spot = useSpotlight<HTMLDivElement>();
  const cards = [
    { cls: 'f-wide', icon: <LuShoppingBag />, t: 'One inbox for every order', d: 'Shopify, TikTok Shop, Instagram, POS and wholesale — every order lands in one prioritized queue.', v: <InboxVisual /> },
    { cls: '', icon: <LuSparkles />, t: 'AI inventory forecasting', d: 'Predict stock-outs two weeks early and reorder in one click.', v: <ForecastVisual /> },
    { cls: '', icon: <LuUsers />, t: 'Customer 360', d: 'Lifetime value, sizes, segments and history on a single profile.', v: <OrbitVisual /> },
    { cls: '', icon: <LuChartLine />, t: 'Real-time analytics', d: 'Revenue, funnels and cohorts update the second they happen.', v: <LiveVisual /> },
    { cls: '', icon: <LuWorkflow />, t: 'No-code automations', d: 'Route, tag, reserve and ship without lifting a finger.', v: <FlowVisual /> },
    { cls: '', icon: <LuShieldCheck />, t: 'Enterprise-grade security', d: 'SOC 2 Type II, SSO, granular roles and full audit logs.', v: <ShieldVisual /> },
    { cls: 'f-wide', icon: <LuGlobe />, t: 'Built for global commerce', d: '135 currencies, local payment methods, COD and duties — sell from Cairo to California.', v: <GlobeVisual /> },
  ];
  return (
    <section id="features" className="section container">
      <SectionHead
        eyebrow="Platform"
        title={
          <>
            Everything your brand runs on.
            <br />
            <span className="serif muted-2">Nothing it doesn’t.</span>
          </>
        }
        sub="Replace six disconnected tools with one beautifully fast workspace your whole team actually enjoys using."
      />
      <div className="bento" ref={spot}>
        {cards.map((c, i) => (
          <Reveal key={c.t} delay={(i % 3) * 90} variant="scale" className={cx('bento-card', c.cls)}>
            <div data-spot className="bento-inner">
              <div className="bento-visual">{c.v}</div>
              <div className="bento-copy">
                <span className="bento-icon">{c.icon}</span>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================================ WORKFLOW =============================== */
function Workflow() {
  const steps = [
    { t: 'Connect your stack', d: 'Plug in Shopify, Stripe, Meta and your 3PL in under five minutes. Velora backfills two years of history automatically.', icon: <LuZap /> },
    { t: 'Automate the busywork', d: 'Build rules that tag VIPs, split shipments, reserve stock and alert Slack — no engineers required.', icon: <LuWorkflow /> },
    { t: 'Grow with clarity', d: 'Daily AI briefings surface what changed, why it changed, and exactly what to do next.', icon: <LuChartLine /> },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % 3), 5200);
    return () => clearInterval(t);
  }, [active]);
  return (
    <section id="workflow" className="section workflow">
      <div className="container wf-grid">
        <div>
          <SectionHead
            center={false}
            eyebrow="How it works"
            title={
              <>
                Live in an afternoon.
                <br />
                <span className="serif muted-2">Compounding forever.</span>
              </>
            }
          />
          <div className="wf-steps">
            {steps.map((s, i) => (
              <button key={s.t} className={cx('wf-step', active === i && 'on')} onClick={() => setActive(i)}>
                <span className="wf-num">0{i + 1}</span>
                <div>
                  <h4>
                    {s.icon} {s.t}
                  </h4>
                  <p>{s.d}</p>
                  <span className="wf-bar">
                    <i key={active} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <Reveal variant="right" className="wf-visual">
          <div className={cx('wf-scene', `s${active}`)}>
            <div className="wf-pane p0">
              <div className="wf-title">Connect apps</div>
              {integrations.slice(0, 5).map((it, i) => (
                <div key={it.id} className="wf-int" style={{ animationDelay: `${i * 90}ms` }}>
                  <BrandIcon id={it.id} name={it.name} color={it.color} size={34} />
                  <div>
                    <b>{it.name}</b>
                    <span>{it.category}</span>
                  </div>
                  <span className={cx('wf-state', i < 4 && 'ok')}>{i < 4 ? <LuCheck /> : <span className="spinner" />}</span>
                </div>
              ))}
            </div>
            <div className="wf-pane p1">
              <div className="wf-title">Automation · VIP fast-track</div>
              {[
                ['When', 'Order is paid', 'blue'],
                ['If', 'Customer LTV > $2,000', 'violet'],
                ['Then', 'Tag “VIP” & upgrade to Express', 'green'],
                ['And', 'Notify #vip-orders in Slack', 'amber'],
              ].map(([k, v, t], i) => (
                <div key={k} className="wf-rule" style={{ animationDelay: `${i * 120}ms` }}>
                  <span className={`badge tone-${t}`}>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
              <div className="wf-ran">
                <LuZap /> Ran 1,284 times this month · saved 41 hours
              </div>
            </div>
            <div className="wf-pane p2">
              <div className="wf-title">
                <LuSparkles /> Morning briefing
              </div>
              <div className="wf-brief">
                <p>
                  Revenue is <b className="up">up 21%</b> week over week, driven by <b>Legacy One Retro</b> on TikTok Shop.
                </p>
                <p>
                  <b>Court Blazer · Pine Green</b> will sell out in <b className="down">4 days</b>. Reorder 180 pairs to cover demand.
                </p>
              </div>
              <div className="wf-actions">
                <span className="btn btn-accent btn-sm">Create PO</span>
                <span className="btn btn-secondary btn-sm">View forecast</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================== INTEGRATIONS ============================= */
function Integrations() {
  const ring1 = integrations.slice(0, 6);
  const ring2 = integrations.slice(6, 12);
  return (
    <section id="integrations" className="section container integ">
      <div className="integ-copy">
        <SectionHead
          center={false}
          eyebrow="Integrations"
          title={
            <>
              Plays nicely with
              <br />
              <span className="serif muted-2">everything you use.</span>
            </>
          }
          sub="80+ native integrations, a public REST & GraphQL API, and webhooks for anything else."
        />
        <Reveal delay={200} className="integ-list">
          {['Two-way sync in under 2 seconds', 'Automatic historical backfill', 'SOC 2 Type II & GDPR compliant'].map((t) => (
            <span key={t}>
              <LuCheck /> {t}
            </span>
          ))}
        </Reveal>
      </div>
      <Reveal variant="scale" className="orbit">
        <div className="orbit-core">
          <Logo size={64} word={false} />
        </div>
        <div className="orbit-ring o1">
          {ring1.map((it, i) => (
            <span key={it.id} className="orbit-item" style={{ ['--a' as string]: `${(360 / ring1.length) * i}deg` }}>
              <BrandIcon id={it.id} name={it.name} color={it.color} size={48} />
            </span>
          ))}
        </div>
        <div className="orbit-ring o2">
          {ring2.map((it, i) => (
            <span key={it.id} className="orbit-item" style={{ ['--a' as string]: `${(360 / ring2.length) * i + 30}deg` }}>
              <BrandIcon id={it.id} name={it.name} color={it.color} size={44} />
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ============================== TESTIMONIALS ============================= */
const quotes = [
  ['We replaced four tools with Velora and cut fulfillment time by 41%. Our ops team finally sleeps.', 'Salma Farouk', 'COO, Cairo Street Supply', 330],
  ['The forecasting alone paid for the year in the first month. We haven’t had a stock-out since.', 'Lucas Bennett', 'Head of E-com, Northline', 30],
  ['It feels like Linear for commerce. Fast, opinionated, and genuinely beautiful to work in.', 'Freya Lindqvist', 'Founder, Halcyon', 90],
  ['TikTok Shop, Shopify and our stores in one view — that was impossible before Velora.', 'Omar Hassan', 'CEO, Kicks Lab Dubai', 250],
  ['Onboarding took an afternoon. The team at Velora feels like part of ours.', 'Emma Carter', 'Ops Lead, Atlas Running', 200],
  ['Our board decks now write themselves. The AI briefings are scary good.', 'Kenji Tanaka', 'CFO, Mosaic', 160],
] as const;

function Testimonials() {
  const row = (list: readonly (typeof quotes)[number][], rev = false) => (
    <div className={cx('marquee t-marquee', rev && 'rev')}>
      <div className="marquee-track">
        {[...list, ...list].map(([q, n, r, h], i) => (
          <figure key={i} className="tcard">
            <div className="stars">
              {Array.from({ length: 5 }).map((_, k) => (
                <LuStar key={k} />
              ))}
            </div>
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
      </div>
    </div>
  );
  return (
    <section id="customers" className="section testimonials">
      <div className="container">
        <SectionHead
          eyebrow="Customers"
          title={
            <>
              Teams switch for the speed.
              <br />
              <span className="serif muted-2">They stay for the results.</span>
            </>
          }
        />
      </div>
      {row(quotes.slice(0, 3).concat(quotes.slice(3)))}
      {row([...quotes].reverse(), true)}
    </section>
  );
}

/* ================================ PRICING ================================ */
function Price({ value }: { value: number }) {
  return <CountUp value={value} duration={700} format={(n) => '$' + Math.round(n)} />;
}

function Pricing() {
  const [yearly, setYearly] = useState<'m' | 'y'>('y');
  const spot = useSpotlight<HTMLDivElement>();
  const plans = [
    { n: 'Starter', p: 39, d: 'For new brands finding product-market fit.', f: ['Up to 1,000 orders / mo', '2 sales channels', 'Core analytics', '3 team seats', 'Email support'] },
    { n: 'Scale', p: 119, d: 'For growing teams selling everywhere.', f: ['Up to 25,000 orders / mo', 'Unlimited channels', 'AI forecasting & briefings', 'Automations (50 rules)', '15 team seats', 'Priority support'], pop: true },
    { n: 'Enterprise', p: -1, d: 'For multi-brand groups with complex ops.', f: ['Unlimited orders', 'Multi-entity & warehouses', 'SSO, SCIM & audit logs', 'Custom data retention', 'Dedicated success manager', '99.99% uptime SLA'] },
  ];
  return (
    <section id="pricing" className="section container">
      <SectionHead eyebrow="Pricing" title={<>Simple pricing that scales with you.</>} sub="Start free for 14 days. No credit card. Cancel anytime." />
      <Reveal className="price-toggle">
        <Segmented
          value={yearly}
          onChange={setYearly}
          options={[
            { value: 'm', label: 'Monthly' },
            { value: 'y', label: <>Yearly <span className="save">−20%</span></> },
          ]}
        />
      </Reveal>
      <div className="plans" ref={spot}>
        {plans.map((p, i) => (
          <Reveal key={p.n} delay={i * 100} className={cx('plan', p.pop && 'pop')}>
            <div data-spot className="plan-inner">
              {p.pop && <span className="plan-badge">Most popular</span>}
              <h3>{p.n}</h3>
              <p className="plan-d">{p.d}</p>
              <div className="plan-price">
                {p.p > 0 ? (
                  <>
                    <b>
                      <Price value={yearly === 'y' ? Math.round(p.p * 0.8) : p.p} />
                    </b>
                    <span>/ month{yearly === 'y' ? ', billed yearly' : ''}</span>
                  </>
                ) : (
                  <b>Custom</b>
                )}
              </div>
              <Link to={p.p > 0 ? '/signup' : '/signup'} className={cx('btn btn-lg', p.pop ? 'btn-accent' : 'btn-secondary')}>
                {p.p > 0 ? 'Start free trial' : 'Talk to sales'} <LuArrowRight />
              </Link>
              <ul>
                {p.f.map((f) => (
                  <li key={f}>
                    <LuCheck /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================================== FAQ ================================== */
function Faq() {
  const items = [
    ['How long does it take to get set up?', 'Most brands are fully live in under an hour. Connect your store, Velora backfills up to 24 months of orders and customers automatically, and your dashboards are ready the moment the import finishes.'],
    ['Will Velora replace my Shopify store?', 'No — Velora sits on top of the tools you already use. Shopify stays your storefront; Velora becomes the operating layer that unifies every channel, warehouse and team.'],
    ['Do you support Cash on Delivery and MENA carriers?', 'Yes. COD reconciliation, Aramex, DHL, SMSA and local payment gateways are supported out of the box, with multi-currency reporting in EGP, AED, SAR and 130+ more.'],
    ['Is my data secure?', 'Velora is SOC 2 Type II certified, GDPR compliant, encrypts data at rest (AES-256) and in transit (TLS 1.3), and offers SSO, SCIM and audit logs on Enterprise.'],
    ['Can I cancel anytime?', 'Absolutely. Plans are month-to-month or yearly with no lock-in, and you can export all of your data in one click at any time.'],
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="section container faq">
      <SectionHead eyebrow="FAQ" title={<>Questions, answered.</>} />
      <div className="faq-list">
        {items.map(([q, a], i) => (
          <Reveal key={q} delay={i * 60} className={cx('faq-item', open === i && 'open')}>
            <button onClick={() => setOpen(open === i ? -1 : i)}>
              <span>{q}</span>
              <i>
                <LuPlus />
              </i>
            </button>
            <div className="faq-a">
              <p>{a}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================================== CTA ================================== */
function Cta() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <section className="container">
      <Reveal variant="scale" className="cta">
        <div
          ref={ref}
          className="cta-inner"
          onPointerMove={(e) => {
            const r = ref.current!.getBoundingClientRect();
            ref.current!.style.setProperty('--mx', `${e.clientX - r.left}px`);
            ref.current!.style.setProperty('--my', `${e.clientY - r.top}px`);
          }}
        >
          <div className="cta-shoes">
            <img src="products/air.webp" alt="" />
            <img src="products/crater2.webp" alt="" />
            <img src="products/jordan.webp" alt="" />
          </div>
          <h2>
            Your brand, finally
            <br />
            <span className="serif">in sync.</span>
          </h2>
          <p>Join 12,400+ brands running on Velora. Free for 14 days — set up in minutes.</p>
          <div className="hero-ctas">
            <Link to="/signup" className="btn btn-accent btn-lg">
              Get started free <LuArrowRight />
            </Link>
            <Link to="/app/overview" className="btn btn-secondary btn-lg">
              Open live demo <LuArrowUpRight />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ================================= FOOTER ================================ */
function Footer() {
  const { navigate } = useRouter();
  const cols: [string, string[]][] = [
    ['Product', ['Orders', 'Inventory', 'Customers', 'Analytics', 'Automations', 'Changelog']],
    ['Company', ['About', 'Careers', 'Press', 'Partners', 'Contact']],
    ['Resources', ['Docs', 'API reference', 'Guides', 'Status', 'Security']],
  ];
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>The commerce operating system for modern retail brands.</p>
          <div className="footer-news">
            <input placeholder="you@brand.com" aria-label="Email" />
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>
              Subscribe
            </button>
          </div>
          <div className="socials">
            {[LuTwitter, LuLinkedin, LuInstagram, LuGithub].map((I, i) => (
              <span key={i} className="icon-btn">
                <I />
              </span>
            ))}
          </div>
        </div>
        {cols.map(([h, ls]) => (
          <div key={h} className="footer-col">
            <h5>{h}</h5>
            {ls.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Velora Inc. All rights reserved.</span>
        <span className="status">
          <i /> All systems operational
        </span>
        <span>
          <LuShieldCheck /> SOC 2 Type II · GDPR
        </span>
      </div>
      <div className="footer-word" aria-hidden>
        Velora
      </div>
    </footer>
  );
}

export default function Landing() {
  useEffect(() => {
    document.title = 'Velora — The commerce OS for modern retail brands';
  }, []);
  return (
    <div className="mk">
      <Nav />
      <main>
        <Hero />
        <Logos />
        <Stats />
        <Features />
        <Workflow />
        <Integrations />
        <Testimonials />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
