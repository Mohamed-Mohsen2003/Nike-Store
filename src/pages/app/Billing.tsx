import { useState } from 'react';
import { LuCheck, LuDownload, LuCreditCard, LuSparkles, LuZap } from 'react-icons/lu';
import { SiVisa } from 'react-icons/si';
import { PageHeader, Card, Button, Badge, Progress, Modal, Segmented } from '../../components/ui';
import { useStore } from '../../lib/store';
import { money, cx } from '../../lib/format';
import { CountUp } from '../../lib/motion';

const plans = [
  { id: 'Starter', p: 39, f: ['1,000 orders / mo', '2 channels', '3 seats'] },
  { id: 'Scale', p: 119, f: ['25,000 orders / mo', 'Unlimited channels', '15 seats', 'AI forecasting'] },
  { id: 'Enterprise', p: 499, f: ['Unlimited orders', 'SSO & audit logs', 'Unlimited seats', 'Dedicated CSM'] },
];

export default function Billing() {
  const { toast, team } = useStore();
  const [plan, setPlan] = useState('Scale');
  const [cycle, setCycle] = useState<'m' | 'y'>('y');
  const [choosing, setChoosing] = useState(false);
  const cur = plans.find((p) => p.id === plan)!;
  const price = cycle === 'y' ? Math.round(cur.p * 0.8) : cur.p;
  const usage = [
    { l: 'Orders this cycle', v: 18420, max: 25000 },
    { l: 'Team seats', v: team.length, max: 15 },
    { l: 'Automation runs', v: 31, max: 50, unit: 'rules' },
    { l: 'API requests', v: 812000, max: 1000000 },
  ];
  const history = ['Oct', 'Sep', 'Aug', 'Jul', 'Jun', 'May'].map((m, i) => ({ m, id: `VEL-${(2610 - i).toString()}`, amount: 1142.4 }));

  return (
    <div className="page">
      <PageHeader title="Billing" sub="Manage your plan, usage and payment details." />
      <div className="grid-2-1">
        <div className="plan-hero">
          <div className="ph-glow" />
          <div className="ph-top">
            <span className="ph-badge">
              <LuSparkles /> Current plan
            </span>
            <Segmented
              size="sm"
              value={cycle}
              onChange={setCycle}
              options={[
                { value: 'm', label: 'Monthly' },
                { value: 'y', label: 'Yearly −20%' },
              ]}
            />
          </div>
          <h2>{plan}</h2>
          <div className="ph-price">
            <b>
              <CountUp value={price} format={(n) => '$' + Math.round(n)} duration={600} />
            </b>
            <span>/ month {cycle === 'y' && '· billed yearly'}</span>
          </div>
          <ul>
            {cur.f.map((f) => (
              <li key={f}>
                <LuCheck /> {f}
              </li>
            ))}
          </ul>
          <div className="ph-actions">
            <Button variant="accent" icon={<LuZap />} onClick={() => setChoosing(true)}>
              Change plan
            </Button>
            <span className="muted">Renews Nov 26, 2026</span>
          </div>
        </div>
        <Card title="Payment method">
          <div className="cc">
            <div className="cc-top">
              <SiVisa className="cc-brand" />
              <span className="cc-chip" />
            </div>
            <div className="cc-num mono">•••• •••• •••• 4417</div>
            <div className="cc-bottom">
              <div>
                <span>Card holder</span>
                <b>Mohamed Mohsen</b>
              </div>
              <div>
                <span>Expires</span>
                <b>08 / 29</b>
              </div>
            </div>
          </div>
          <Button variant="secondary" icon={<LuCreditCard />} onClick={() => toast({ title: 'Secure card update opened', body: 'Card details are handled by Stripe.', tone: 'info' })} style={{ width: '100%', marginTop: 14 }}>
            Update card
          </Button>
        </Card>
      </div>

      <Card title="Usage" sub="Current billing cycle · Oct 26 – Nov 26">
        <div className="usage">
          {usage.map((u) => {
            const pct = (u.v / u.max) * 100;
            return (
              <div key={u.l} className="usage-row">
                <div className="usage-top">
                  <b>{u.l}</b>
                  <span className="tnum">
                    <CountUp value={u.v} /> / {u.max.toLocaleString()}
                  </span>
                </div>
                <Progress value={pct} tone={pct > 85 ? 'amber' : 'accent'} />
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Billing history" pad={false}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Period</th>
                <th>Status</th>
                <th className="r">Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={h.id} className="row-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <td className="mono">{h.id}</td>
                  <td className="muted">{h.m} 2026</td>
                  <td>
                    <Badge>Paid</Badge>
                  </td>
                  <td className="r tnum">{money(h.amount, 2)}</td>
                  <td className="r">
                    <button className="icon-btn sm" onClick={() => toast({ title: `${h.id}.pdf downloaded` })} aria-label="Download">
                      <LuDownload />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={choosing} onClose={() => setChoosing(false)} width={760} title="Choose your plan" sub="Upgrade or downgrade anytime — changes are prorated.">
        <div className="plan-pick">
          {plans.map((p) => (
            <button
              key={p.id}
              className={cx('pp', p.id === plan && 'on')}
              onClick={() => {
                setPlan(p.id);
                setChoosing(false);
                toast({ title: `Switched to ${p.id}`, body: 'Your new limits are active immediately.' });
              }}
            >
              {p.id === plan && <Badge tone="lime">Current</Badge>}
              <h4>{p.id}</h4>
              <b>
                ${cycle === 'y' ? Math.round(p.p * 0.8) : p.p}
                <span>/mo</span>
              </b>
              <ul>
                {p.f.map((f) => (
                  <li key={f}>
                    <LuCheck /> {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
