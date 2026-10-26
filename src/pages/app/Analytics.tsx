import { useMemo, useState } from 'react';
import { LuDownload, LuCalendar } from 'react-icons/lu';
import { PageHeader, Button, Card, Delta, Segmented, Progress } from '../../components/ui';
import { AreaChart, Donut } from '../../components/charts';
import { CountUp, Reveal, useInView } from '../../lib/motion';
import { revenueDaily, funnel, cohorts, geo, products } from '../../lib/data';
import { compact, money, date, cx } from '../../lib/format';
import { useStore } from '../../lib/store';

function Funnel() {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const max = funnel[0].value;
  return (
    <div className="funnel" ref={ref}>
      {funnel.map((f, i) => {
        const w = (f.value / max) * 100;
        const drop = i > 0 ? (1 - f.value / funnel[i - 1].value) * 100 : 0;
        return (
          <div key={f.label} className="fn-row">
            <div className="fn-label">
              <b>{f.label}</b>
              <span>{compact(f.value)}</span>
            </div>
            <div className="fn-track">
              <i style={{ width: seen ? `${w}%` : 0, transitionDelay: `${i * 140}ms`, opacity: 1 - i * 0.12 }} />
            </div>
            <div className="fn-pct">
              <b>{((f.value / max) * 100).toFixed(1)}%</b>
              {i > 0 && <span>−{drop.toFixed(0)}% drop</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Cohorts() {
  const [ref, seen] = useInView<HTMLDivElement>(0.15);
  return (
    <div className="cohort-wrap" ref={ref}>
      <table className="cohort">
        <thead>
          <tr>
            <th>Cohort</th>
            <th>Users</th>
            {Array.from({ length: 8 }).map((_, i) => (
              <th key={i}>M{i}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c, r) => (
            <tr key={c.label}>
              <td>
                <b>{c.label} 2026</b>
              </td>
              <td className="muted tnum">{c.size.toLocaleString()}</td>
              {Array.from({ length: 8 }).map((_, k) => {
                const v = c.values[k];
                return (
                  <td key={k}>
                    {v !== undefined && (
                      <span
                        className={cx('cell', seen && 'in')}
                        style={{ ['--v' as string]: v / 100, transitionDelay: `${(r + k) * 40}ms` }}
                        title={`${v}% retained`}
                      >
                        {v}%
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Heatmap() {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = useMemo(
    () =>
      days.map((_, d) =>
        Array.from({ length: 24 }, (_, h) => {
          const evening = Math.exp(-Math.pow((h - 21) / 3, 2));
          const lunch = Math.exp(-Math.pow((h - 13) / 2, 2)) * 0.55;
          const weekend = d >= 4 ? 1.25 : 1;
          return Math.min(1, (evening + lunch) * weekend * (0.75 + ((d * 7 + h * 13) % 10) / 40));
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <div className="heatmap" ref={ref}>
      {data.map((row, d) => (
        <div key={d} className="hm-row">
          <span>{days[d]}</span>
          {row.map((v, h) => (
            <i key={h} className={seen ? 'in' : ''} style={{ ['--v' as string]: v, transitionDelay: `${(d * 24 + h) * 4}ms` }} title={`${days[d]} ${h}:00 — ${Math.round(v * 100)} orders`} />
          ))}
        </div>
      ))}
      <div className="hm-row hm-axis">
        <span />
        {Array.from({ length: 24 }, (_, h) => (
          <em key={h}>{h % 6 === 0 ? `${h}h` : ''}</em>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { toast } = useStore();
  const [metric, setMetric] = useState<'rev' | 'traffic'>('rev');
  const kpis = [
    { l: 'Sessions', v: 284120, f: (n: number) => compact(n), d: 14.2 },
    { l: 'Conversion rate', v: 3.1, f: (n: number) => n.toFixed(2) + '%', d: 6.8 },
    { l: 'Returning customers', v: 42.6, f: (n: number) => n.toFixed(1) + '%', d: 3.1 },
    { l: 'Customer acq. cost', v: 18.4, f: (n: number) => '$' + n.toFixed(2), d: -9.4, inv: true },
    { l: 'Refund rate', v: 2.4, f: (n: number) => n.toFixed(1) + '%', d: -1.2, inv: true },
  ];
  const labels = revenueDaily.map((d) => date(d.date, { month: 'short', day: 'numeric' }));
  const byCollection = ['Force', 'Court', 'Crater', 'Space', 'Legacy'].map((c, i) => ({
    label: c,
    value: Math.round((products.filter((p) => p.collection === c).reduce((s, p) => s + p.sold30 * p.price, 0) / products.reduce((s, p) => s + p.sold30 * p.price, 0)) * 100),
    color: `var(--c${i + 1})`,
  }));

  return (
    <div className="page">
      <PageHeader
        title="Analytics"
        sub="Deep insight into traffic, conversion and retention."
        actions={
          <>
            <Button icon={<LuCalendar />} variant="secondary">
              Jul 28 – Oct 26, 2026
            </Button>
            <Button icon={<LuDownload />} onClick={() => toast({ title: 'Analytics report exported', body: 'velora-analytics-q4.pdf is ready.' })}>
              Export PDF
            </Button>
          </>
        }
      />

      <div className="kpi-strip">
        {kpis.map((k, i) => (
          <Reveal key={k.l} delay={i * 60} className="kpi-s">
            <span>{k.l}</span>
            <b>
              <CountUp value={k.v} format={k.f} />
            </b>
            <Delta value={k.d} invert={'inv' in k} />
          </Reveal>
        ))}
      </div>

      <Card
        title={metric === 'rev' ? 'Revenue & orders' : 'Traffic'}
        sub="Last 90 days, daily"
        action={
          <Segmented
            size="sm"
            value={metric}
            onChange={setMetric}
            options={[
              { value: 'rev', label: 'Revenue' },
              { value: 'traffic', label: 'Traffic' },
            ]}
          />
        }
      >
        <AreaChart
          key={metric}
          height={320}
          labels={labels}
          series={
            metric === 'rev'
              ? [{ key: 'r', label: 'Revenue', color: 'var(--accent)', values: revenueDaily.map((d) => d.revenue) }]
              : [{ key: 'v', label: 'Visitors', color: 'var(--c3)', values: revenueDaily.map((d) => d.visitors) }]
          }
          format={(n) => (metric === 'rev' ? '$' + compact(n) : compact(n))}
        />
      </Card>

      <div className="grid-1-1">
        <Card title="Conversion funnel" sub="Sessions → purchase, last 30 days">
          <Funnel />
        </Card>
        <Card title="Revenue by collection" sub="Last 30 days">
          <div className="donut-wrap">
            <Donut data={byCollection} size={180} center={<><b>5</b><span>Collections</span></>} />
            <div className="donut-legend">
              {byCollection.map((c) => (
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

      <Card title="Retention cohorts" sub="% of customers who purchased again, by first-order month">
        <Cohorts />
      </Card>

      <div className="grid-1-1">
        <Card title="Top markets" sub="Revenue by country, this quarter">
          <div className="geo">
            {geo.map((g, i) => (
              <div key={g.country} className="geo-row" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="flag">{g.flag}</span>
                <div>
                  <div className="geo-top">
                    <b>{g.country}</b>
                    <span className="tnum">{money(g.revenue)}</span>
                  </div>
                  <Progress value={g.share * 3.5} />
                </div>
                <span className="muted tnum">{g.share}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="When customers buy" sub="Orders by weekday & hour (Cairo time)">
          <Heatmap />
        </Card>
      </div>
    </div>
  );
}
