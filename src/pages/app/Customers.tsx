import { useEffect, useMemo, useState } from 'react';
import { LuSearch, LuDownload, LuMail, LuMapPin, LuCalendar, LuCrown, LuHeart, LuSparkles, LuTriangleAlert, LuArrowUpDown, LuSend, LuUsers } from 'react-icons/lu';
import { PageHeader, Button, Input, Badge, Avatar, Drawer, Pagination, Empty } from '../../components/ui';
import { useStore } from '../../lib/store';
import { match, useRouter } from '../../lib/router';
import { money, date, relative, cx } from '../../lib/format';
import type { Customer } from '../../lib/data';
import { CountUp } from '../../lib/motion';

const segs = [
  { k: 'VIP', icon: <LuCrown />, d: 'LTV over $3,200' },
  { k: 'Loyal', icon: <LuHeart />, d: '8+ orders' },
  { k: 'New', icon: <LuSparkles />, d: 'Recently acquired' },
  { k: 'At risk', icon: <LuTriangleAlert />, d: 'No order in 70+ days' },
] as const;

function CustomerDrawer({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
  const { orders, toast } = useStore();
  const { navigate } = useRouter();
  const [c, setC] = useState(customer);
  const [note, setNote] = useState('');
  useEffect(() => {
    if (customer) setC(customer);
  }, [customer]);
  if (!c) return null;
  const history = orders.filter((o) => o.customerId === c.id);
  return (
    <Drawer
      open={!!customer}
      onClose={onClose}
      width={500}
      title="Customer profile"
      footer={
        <>
          <Button variant="ghost" onClick={() => toast({ title: `Added ${c.name} to “Winter Drop” campaign`, tone: 'info' })}>
            Add to campaign
          </Button>
          <Button variant="accent" icon={<LuSend />} onClick={() => toast({ title: `Email sent to ${c.name.split(' ')[0]}`, body: c.email })}>
            Send email
          </Button>
        </>
      }
    >
      <div className="cp-hero">
        <Avatar name={c.name} hue={c.avatarHue} size={64} />
        <div>
          <h3>{c.name}</h3>
          <span>
            {c.flag} {c.city}, {c.country}
          </span>
        </div>
        <Badge>{c.segment}</Badge>
      </div>
      <div className="cp-stats">
        <div>
          <span>Lifetime value</span>
          <b>{money(c.spent)}</b>
        </div>
        <div>
          <span>Orders</span>
          <b>{c.orders}</b>
        </div>
        <div>
          <span>Avg. order</span>
          <b>{money(c.spent / c.orders)}</b>
        </div>
      </div>
      <div className="od-lines">
        <span>
          <LuMail /> {c.email}
        </span>
        <span>
          <LuMapPin /> {c.city}, {c.country}
        </span>
        <span>
          <LuCalendar /> Customer since {date(c.joined, { month: 'long', year: 'numeric' })} · last order {relative(c.lastOrder)}
        </span>
      </div>
      <section className="od-sec">
        <h4>Recent orders</h4>
        {history.length === 0 && <p className="muted">Orders older than 90 days are archived.</p>}
        {history.slice(0, 5).map((o) => (
          <button key={o.id} className="hist-row" onClick={() => navigate(`/app/orders/${o.id}`)}>
            <b className="mono">{o.number}</b>
            <span className="muted">{date(o.date, { month: 'short', day: 'numeric' })}</span>
            <Badge>{o.status}</Badge>
            <b className="tnum">{money(o.total, 2)}</b>
          </button>
        ))}
      </section>
      <section className="od-sec">
        <h4>Internal note</h4>
        <textarea className="textarea" placeholder="Prefers size 42, loves limited drops…" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button
          size="sm"
          disabled={!note.trim()}
          onClick={() => {
            toast({ title: 'Note saved' });
            setNote('');
          }}
        >
          Save note
        </Button>
      </section>
    </Drawer>
  );
}

export default function Customers() {
  const { customers, toast } = useStore();
  const { path, navigate } = useRouter();
  const [q, setQ] = useState('');
  const [seg, setSeg] = useState<string>('All');
  const [sort, setSort] = useState<'spent' | 'orders' | 'recent'>('spent');
  const [page, setPage] = useState(1);
  const per = 12;
  const params = match('/app/customers/:id', path.split('?')[0]);
  const open = params ? customers.find((c) => c.id === params.id) ?? null : null;

  const list = useMemo(() => {
    const s = q.toLowerCase();
    return customers
      .filter((c) => (seg === 'All' || c.segment === seg) && (!s || c.name.toLowerCase().includes(s) || c.email.includes(s) || c.city.toLowerCase().includes(s)))
      .sort((a, b) => (sort === 'spent' ? b.spent - a.spent : sort === 'orders' ? b.orders - a.orders : +new Date(b.lastOrder) - +new Date(a.lastOrder)));
  }, [customers, q, seg, sort]);
  useEffect(() => setPage(1), [q, seg, sort]);
  const rows = list.slice((page - 1) * per, page * per);

  return (
    <div className="page">
      <PageHeader
        title="Customers"
        sub="Understand who buys, what they love and who needs a nudge."
        actions={
          <Button icon={<LuDownload />} onClick={() => toast({ title: `Exported ${list.length} customers`, body: 'customers.csv is downloading.' })}>
            Export
          </Button>
        }
      />
      <div className="seg-grid">
        {segs.map((s, i) => {
          const n = customers.filter((c) => c.segment === s.k).length;
          const rev = customers.filter((c) => c.segment === s.k).reduce((a, c) => a + c.spent, 0);
          return (
            <button key={s.k} className={cx('seg-card', `seg-${i}`, seg === s.k && 'on')} onClick={() => setSeg(seg === s.k ? 'All' : s.k)} style={{ animationDelay: `${i * 70}ms` }}>
              <span className="seg-ic">{s.icon}</span>
              <div className="seg-n">
                <CountUp value={n} />
              </div>
              <b>{s.k}</b>
              <span className="seg-d">
                {s.d} · {money(rev)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="card card-flush">
        <div className="toolbar">
          <Input icon={<LuSearch />} placeholder="Search name, email or city" value={q} onChange={(e) => setQ(e.target.value)} className="grow" />
          {seg !== 'All' && (
            <Button size="sm" variant="secondary" onClick={() => setSeg('All')}>
              Segment: {seg} ✕
            </Button>
          )}
          <Button
            variant="ghost"
            icon={<LuArrowUpDown />}
            onClick={() => setSort((s) => (s === 'spent' ? 'orders' : s === 'orders' ? 'recent' : 'spent'))}
          >
            Sort: {sort === 'spent' ? 'Lifetime value' : sort === 'orders' ? 'Orders' : 'Recent activity'}
          </Button>
        </div>
        {rows.length === 0 ? (
          <Empty icon={<LuUsers />} title="No customers found" body="Try another search or segment." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th className="hide-sm">Location</th>
                  <th>Segment</th>
                  <th className="hide-md">Orders</th>
                  <th className="hide-md">Last order</th>
                  <th className="r">Lifetime value</th>
                </tr>
              </thead>
              <tbody key={`${seg}-${sort}-${page}`}>
                {rows.map((c, i) => (
                  <tr key={c.id} className="row-in clickable" style={{ animationDelay: `${i * 30}ms` }} onClick={() => navigate(`/app/customers/${c.id}`)}>
                    <td>
                      <div className="cell-user">
                        <Avatar name={c.name} hue={c.avatarHue} size={32} />
                        <div>
                          <b>{c.name}</b>
                          <div className="sub">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-sm muted">
                      {c.flag} {c.city}
                    </td>
                    <td>
                      <Badge>{c.segment}</Badge>
                    </td>
                    <td className="hide-md tnum">{c.orders}</td>
                    <td className="hide-md muted">{relative(c.lastOrder)}</td>
                    <td className="r tnum">
                      <b>{money(c.spent)}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={Math.ceil(list.length / per)} onChange={setPage} total={list.length} label="customers" />
      </div>
      <CustomerDrawer customer={open} onClose={() => navigate('/app/customers')} />
    </div>
  );
}
