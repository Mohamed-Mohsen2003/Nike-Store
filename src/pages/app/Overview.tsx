import { useMemo, useState } from 'react';
import { LuDownload, LuShoppingBag, LuTriangleAlert, LuStar, LuWallet, LuUsers, LuArrowUpRight, LuSparkles, LuTrendingUp, LuReceipt, LuChartLine } from 'react-icons/lu';
import { Card, PageHeader, Button, Segmented, Badge, Delta, Avatar, Progress } from '../../components/ui';
import { AreaChart, BarChart, Donut, Sparkline, Gauge } from '../../components/charts';
import { CountUp, Reveal } from '../../lib/motion';
import { Link, useRouter } from '../../lib/router';
import { useStore } from '../../lib/store';
import { revenueDaily, monthly, channelMix, activity } from '../../lib/data';
import { money, compact, relative, date } from '../../lib/format';

export default function Overview() {
  const { orders, products, invoices, customerById, user, toast } = useStore();
  const { navigate } = useRouter();
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const days = +range;
  const cur = revenueDaily.slice(-days);
  const prevRev = revenueDaily.slice(-days * 2, -days);
  const sum = (a: typeof cur, k: 'revenue' | 'orders' | 'visitors') => a.reduce((s, d) => s + d[k], 0);
  const rev = sum(cur, 'revenue');
  const ord = sum(cur, 'orders');
  const vis = sum(cur, 'visitors');
  const change = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 12.4);
  const kpis = [
    { l: 'Net revenue', v: rev, f: (n: number) => money(n), d: change(rev, sum(prevRev, 'revenue')) || 18.2, icon: <LuWallet />, spark: cur.map((d) => d.revenue) },
    { l: 'Orders', v: ord, f: (n: number) => Math.round(n).toLocaleString(), d: change(ord, sum(prevRev, 'orders')) || 11.6, icon: <LuShoppingBag />, spark: cur.map((d) => d.orders) },
    { l: 'Avg. order value', v: rev / ord, f: (n: number) => money(n, 2), d: 4.3, icon: <LuReceipt />, spark: cur.map((d) => d.revenue / d.orders) },
    { l: 'Conversion rate', v: (ord / vis) * 100, f: (n: number) => n.toFixed(2) + '%', d: 0.4 / 3, icon: <LuUsers />, spark: cur.map((d) => d.orders / d.visitors) },
  ];

  const top = useMemo(() => [...products].filter((p) => p.status === 'active').sort((a, b) => b.sold30 * b.price - a.sold30 * a.price).slice(0, 5), [products]);
  const low = products.filter((p) => p.stock <= p.reorderAt);
  const recent = orders.slice(0, 6);
  const overdue = invoices.filter((i) => i.status === 'Overdue');
  const first = (user?.name ?? 'Mohamed').split(' ')[0];

  return (
    <div className="page">
      <PageHeader
        eyebrow={date('2026-10-26T12:00:00', { weekday: 'long', month: 'long', day: 'numeric' })}
        title={`Good evening, ${first}`}
        sub={
          <>
            Revenue is pacing <b className="txt-green">+21.4%</b> ahead of last month. Here’s what’s happening across Stride Athletics.
          </>
        }
        actions={
          <>
            <Segmented
              size="sm"
              value={range}
              onChange={setRange}
              options={[
                { value: '7', label: '7D' },
                { value: '30', label: '30D' },
                { value: '90', label: '90D' },
              ]}
            />
            <Button icon={<LuDownload />} onClick={() => toast({ title: 'Report exported', body: `overview-last-${range}-days.csv is downloading.` })}>
              Export
            </Button>
          </>
        }
      />

      <div className="ai-strip">
        <span className="ai-orb">
          <LuSparkles />
        </span>
        <p>
          <b>AI insight:</b> TikTok Shop orders grew <b>38%</b> this week, led by <b>Legacy One Retro · Emerald Rise</b>. Court Blazer Pine Green sells out in ~4 days.
        </p>
        <Button size="sm" variant="secondary" onClick={() => navigate('/app/analytics')} iconRight={<LuArrowUpRight />}>
          See analysis
        </Button>
      </div>

      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <Reveal key={k.l} delay={i * 70} variant="up" className="kpi">
            <div className="kpi-top">
              <span className="kpi-ic">{k.icon}</span>
              <span className="kpi-l">{k.l}</span>
              <Delta value={k.d} />
            </div>
            <div className="kpi-v">
              <CountUp value={k.v} format={k.f} key={range} />
            </div>
            <div className="kpi-foot">
              <span>vs. previous {range} days</span>
              <Sparkline values={k.spark} width={96} height={30} color={i % 2 ? 'var(--accent-2)' : 'var(--accent)'} />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid-2-1">
        <Card
          title="Revenue"
          sub={`${money(rev)} in the last ${range} days`}
          action={
            <div className="legend">
              <span>
                <i style={{ background: 'var(--accent)' }} /> Revenue
              </span>
              <span>
                <i style={{ background: 'var(--accent-2)' }} /> Previous period
              </span>
            </div>
          }
        >
          <AreaChart
            key={range}
            height={300}
            labels={cur.map((d) => date(d.date, { month: 'short', day: 'numeric' }))}
            series={[
              { key: 'p', label: 'Previous', color: 'var(--accent-2)', values: (prevRev.length === days ? prevRev : cur.map((d) => ({ ...d, revenue: d.revenue * 0.8 }))).map((d) => Math.round(d.revenue)), dashed: true },
              { key: 'r', label: 'Revenue', color: 'var(--accent)', values: cur.map((d) => d.revenue) },
            ]}
            format={(n) => '$' + compact(n)}
          />
        </Card>
        <Card title="Sales by channel" sub="Share of revenue, this month">
          <div className="donut-wrap">
            <Donut
              data={channelMix}
              size={190}
              center={
                <>
                  <b>$268K</b>
                  <span>Total revenue</span>
                </>
              }
            />
            <div className="donut-legend">
              {channelMix.map((c) => (
                <div key={c.label}>
                  <i style={{ background: c.color }} />
                  <span>{c.label}</span>
                  <b>{c.value}%</b>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid-1-2">
        <Card title="Monthly goal" sub="October target: $220,000">
          <div className="goal">
            <Gauge value={122} size={190} label="of target hit" />
            <div className="goal-stats">
              <div>
                <span>Achieved</span>
                <b>$268.4K</b>
              </div>
              <div>
                <span>Over target</span>
                <b className="txt-green">+$48.4K</b>
              </div>
            </div>
            <p className="goal-note">
              <LuTrendingUp /> Best month in company history — 122% of goal with 5 days left.
            </p>
          </div>
        </Card>
        <Card title="Revenue vs. target" sub="Last 12 months" action={<Badge tone="green">+89% YoY</Badge>}>
          <BarChart data={monthly.map((m) => ({ label: m.m, value: m.revenue, target: m.target }))} height={270} format={(n) => '$' + compact(n)} />
        </Card>
      </div>

      <div className="grid-2-1">
        <Card
          title="Recent orders"
          pad={false}
          action={
            <Link to="/app/orders" className="btn btn-ghost btn-sm">
              View all <LuArrowUpRight />
            </Link>
          }
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th className="hide-sm">Channel</th>
                  <th>Status</th>
                  <th className="r">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o, i) => {
                  const c = customerById(o.customerId);
                  return (
                    <tr key={o.id} className="row-in clickable" style={{ animationDelay: `${i * 50}ms` }} onClick={() => navigate(`/app/orders/${o.id}`)}>
                      <td>
                        <b className="mono">{o.number}</b>
                        <div className="sub">{relative(o.date)}</div>
                      </td>
                      <td>
                        <div className="cell-user">
                          <Avatar name={c?.name ?? '—'} hue={c?.avatarHue} size={28} />
                          <span>{c?.name}</span>
                        </div>
                      </td>
                      <td className="hide-sm muted">{o.channel}</td>
                      <td>
                        <Badge>{o.status}</Badge>
                      </td>
                      <td className="r tnum">
                        <b>{money(o.total, 2)}</b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Live activity" action={<span className="live-pill"><i /> Live</span>}>
          <ul className="feed">
            {activity.map((a, i) => (
              <li key={i} style={{ animationDelay: `${i * 80}ms` }}>
                <span className={`feed-ic f-${a.icon}`}>
                  {a.icon === 'order' ? <LuShoppingBag /> : a.icon === 'stock' ? <LuTriangleAlert /> : a.icon === 'review' ? <LuStar /> : a.icon === 'payout' ? <LuWallet /> : <LuUsers />}
                </span>
                <div>
                  <b>{a.text}</b>
                  <span>{a.meta}</span>
                </div>
                <time>{a.time}</time>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid-2-1">
        <Card
          title="Top products"
          sub="By revenue, last 30 days"
          action={
            <Link to="/app/products" className="btn btn-ghost btn-sm">
              All products <LuArrowUpRight />
            </Link>
          }
        >
          <div className="top-products">
            {top.map((p, i) => {
              const revenue = p.sold30 * p.price;
              const max = top[0].sold30 * top[0].price;
              return (
                <div key={p.id} className="tp-row" style={{ animationDelay: `${i * 70}ms` }}>
                  <span className="tp-rank">{i + 1}</span>
                  <span className="thumb">
                    <img src={p.image} alt="" />
                  </span>
                  <div className="tp-info">
                    <b>{p.name}</b>
                    <span>
                      {p.colorway} · {p.sold30} sold
                    </span>
                    <Progress value={(revenue / max) * 100} />
                  </div>
                  <b className="tnum">{money(revenue)}</b>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Needs attention" sub={`${low.length} products below reorder point`}>
          <div className="attention">
            {low.map((p) => (
              <div key={p.id} className="att-row">
                <span className="thumb sm">
                  <img src={p.image} alt="" />
                </span>
                <div>
                  <b>{p.name}</b>
                  <span>{p.colorway}</span>
                </div>
                <Badge tone={p.stock === 0 ? 'red' : 'amber'}>{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</Badge>
              </div>
            ))}
            <div className="att-row">
              <span className="att-ic">
                <LuChartLine />
              </span>
              <div>
                <b>
                  {overdue.length} invoice{overdue.length === 1 ? '' : 's'} overdue
                </b>
                <span>{money(overdue.reduce((s, i) => s + i.amount, 0))} outstanding</span>
              </div>
              <Link to="/app/invoices" className="btn btn-secondary btn-sm">
                Review
              </Link>
            </div>
            <Button variant="accent" onClick={() => toast({ title: 'Purchase order drafted', body: '180 pairs · Court Blazer Mid ’77 · sent to supplier for approval.' })}>
              <LuSparkles /> Auto-create restock POs
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
