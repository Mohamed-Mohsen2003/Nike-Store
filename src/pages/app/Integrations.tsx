import { useState } from 'react';
import { LuSearch, LuCheck, LuPlus, LuCode, LuWebhook, LuArrowUpRight } from 'react-icons/lu';
import { PageHeader, Input, Segmented, Switch, Badge, Button } from '../../components/ui';
import { BrandIcon } from '../../components/brands';
import { useStore } from '../../lib/store';
import { useSpotlight } from '../../lib/motion';
import { cx } from '../../lib/format';

export default function Integrations() {
  const { integrations, toggleIntegration, toast } = useStore();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const spot = useSpotlight<HTMLDivElement>();
  const list = integrations.filter((i) => (cat === 'All' || (cat === 'Connected' ? i.connected : i.category === cat)) && (!q || i.name.toLowerCase().includes(q.toLowerCase())));
  const connected = integrations.filter((i) => i.connected).length;

  return (
    <div className="page">
      <PageHeader title="Integrations" sub={`${connected} apps connected · syncing every 30 seconds`} actions={<Button icon={<LuCode />} onClick={() => toast({ title: 'API key copied', body: 'vel_live_••••••••3f9a', tone: 'info' })}>API & webhooks</Button>} />
      <div className="toolbar card">
        <Input icon={<LuSearch />} placeholder="Search 80+ integrations" value={q} onChange={(e) => setQ(e.target.value)} className="grow" />
        <div className="scroll-x">
          <Segmented size="sm" value={cat} onChange={setCat} options={['All', 'Connected', 'Sales', 'Payments', 'Marketing', 'Shipping', 'Finance', 'Workflow'].map((c) => ({ value: c, label: c }))} />
        </div>
      </div>
      <div className="int-grid" ref={spot} key={cat}>
        {list.map((it, i) => (
          <div key={it.id} className={cx('int-card', it.connected && 'on')} data-spot style={{ animationDelay: `${i * 45}ms` }}>
            <div className="int-top">
              <BrandIcon id={it.id} name={it.name} color={it.color} size={46} />
              <Switch
                checked={it.connected}
                label={`Toggle ${it.name}`}
                onChange={() => {
                  if (it.connected) {
                    toggleIntegration(it.id);
                    toast({ title: `${it.name} disconnected`, tone: 'warning' });
                    return;
                  }
                  setBusy(it.id);
                  setTimeout(() => {
                    toggleIntegration(it.id);
                    setBusy(null);
                    toast({ title: `${it.name} connected`, body: 'Historical data is syncing in the background.' });
                  }, 1100);
                }}
              />
            </div>
            <div>
              <h4>{it.name}</h4>
              <p>{it.desc}</p>
            </div>
            <div className="int-foot">
              <Badge tone="gray" dot={false}>
                {it.category}
              </Badge>
              {busy === it.id ? (
                <span className="int-state busy">
                  <span className="spinner" /> Connecting…
                </span>
              ) : it.connected ? (
                <span className="int-state ok">
                  <LuCheck /> Synced
                </span>
              ) : (
                <span className="int-state">
                  <LuPlus /> Connect
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="int-card int-custom" data-spot>
          <span className="int-custom-ic">
            <LuWebhook />
          </span>
          <h4>Build your own</h4>
          <p>Use our REST & GraphQL API or webhooks to connect anything.</p>
          <Button size="sm" variant="secondary" iconRight={<LuArrowUpRight />} onClick={() => toast({ title: 'Developer docs opened', tone: 'info' })}>
            Read the docs
          </Button>
        </div>
      </div>
    </div>
  );
}
