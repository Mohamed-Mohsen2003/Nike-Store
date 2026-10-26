import { useEffect, useMemo, useState } from 'react';
import { LuSearch, LuDownload, LuPlus, LuPrinter, LuTruck, LuRotateCcw, LuCheck, LuPackageCheck, LuCreditCard, LuMapPin, LuMail, LuInbox, LuEllipsis, LuCopy } from 'react-icons/lu';
import { PageHeader, Button, Input, Select, Badge, Avatar, Drawer, Pagination, Empty, Menu, MenuItem } from '../../components/ui';
import { useStore } from '../../lib/store';
import { match, useRouter } from '../../lib/router';
import { money, date, time, relative, cx } from '../../lib/format';
import type { Order, OrderStatus } from '../../lib/data';
import { CountUp } from '../../lib/motion';

const tabs: ('All' | OrderStatus)[] = ['All', 'Pending', 'Paid', 'Fulfilled', 'Shipped', 'Delivered', 'Refunded'];
const flow: OrderStatus[] = ['Pending', 'Paid', 'Fulfilled', 'Shipped', 'Delivered'];

function OrderDrawer({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const { customerById, productById, setOrderStatus, toast } = useStore();
  const [o, setO] = useState(order);
  useEffect(() => {
    if (order) setO(order);
  }, [order]);
  if (!o) return null;
  const c = customerById(o.customerId);
  const stepIdx = flow.indexOf(o.status);
  const advance = () => {
    const next = flow[Math.min(flow.length - 1, stepIdx + 1)];
    setOrderStatus(o.id, next);
    setO({ ...o, status: next });
    toast({ title: `Order ${o.number} marked as ${next}`, body: next === 'Shipped' ? `${o.carrier} label created · ${o.tracking}` : undefined });
  };
  return (
    <Drawer
      open={!!order}
      onClose={onClose}
      width={520}
      title={
        <>
          <span className="mono">Order {o.number}</span>
          <Badge>{o.status}</Badge>
        </>
      }
      footer={
        <>
          <Menu
            align="left"
            trigger={() => (
              <Button variant="ghost" icon={<LuEllipsis />}>
                More
              </Button>
            )}
          >
            <MenuItem icon={<LuPrinter />} onClick={() => toast({ title: 'Packing slip sent to printer', tone: 'info' })}>
              Print packing slip
            </MenuItem>
            <MenuItem icon={<LuCopy />} onClick={() => toast({ title: 'Tracking number copied', body: o.tracking, tone: 'info' })}>
              Copy tracking number
            </MenuItem>
            <MenuItem
              icon={<LuRotateCcw />}
              danger
              onClick={() => {
                setOrderStatus(o.id, 'Refunded');
                setO({ ...o, status: 'Refunded' });
                toast({ title: `Refund of ${money(o.total, 2)} issued`, tone: 'warning' });
              }}
            >
              Refund order
            </MenuItem>
          </Menu>
          <div style={{ flex: 1 }} />
          {stepIdx >= 0 && stepIdx < flow.length - 1 && (
            <Button variant="accent" icon={stepIdx === 1 ? <LuPackageCheck /> : stepIdx === 2 ? <LuTruck /> : <LuCheck />} onClick={advance}>
              {['Mark as paid', 'Fulfill order', 'Ship with ' + o.carrier.split(' ')[0], 'Mark delivered'][stepIdx]}
            </Button>
          )}
        </>
      }
    >
      <div className="od-meta">
        <span>{date(o.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {time(o.date)}</span>
        <span>·</span>
        <span>{o.channel}</span>
      </div>

      <div className="timeline">
        {flow.map((s, i) => (
          <div key={s} className={cx('tl-step', i <= stepIdx && 'done', i === stepIdx && 'cur', (o.status === 'Refunded' || o.status === 'Cancelled') && 'void')}>
            <i>{i <= stepIdx ? <LuCheck /> : null}</i>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <section className="od-sec">
        <h4>Items</h4>
        {o.items.map((it, i) => {
          const p = productById(it.productId);
          if (!p) return null;
          return (
            <div key={i} className="od-item">
              <span className="thumb">
                <img src={p.image} alt="" />
              </span>
              <div>
                <b>{p.name}</b>
                <span>
                  {p.colorway} · EU {it.size} · {p.sku}
                </span>
              </div>
              <span className="muted">×{it.qty}</span>
              <b className="tnum">{money(p.price * it.qty, 2)}</b>
            </div>
          );
        })}
        <div className="od-totals">
          <div>
            <span>Subtotal</span>
            <span>{money(o.subtotal, 2)}</span>
          </div>
          <div>
            <span>Shipping</span>
            <span>{o.shipping ? money(o.shipping, 2) : 'Free'}</span>
          </div>
          <div className="total">
            <span>Total</span>
            <b>{money(o.total, 2)}</b>
          </div>
        </div>
      </section>

      {c && (
        <section className="od-sec">
          <h4>Customer</h4>
          <div className="od-cust">
            <Avatar name={c.name} hue={c.avatarHue} size={42} />
            <div>
              <b>{c.name}</b>
              <span>
                {c.orders} orders · {money(c.spent)} lifetime
              </span>
            </div>
            <Badge>{c.segment}</Badge>
          </div>
          <div className="od-lines">
            <span>
              <LuMail /> {c.email}
            </span>
            <span>
              <LuMapPin /> {c.city}, {c.country} {c.flag}
            </span>
            <span>
              <LuCreditCard /> {o.payment}
            </span>
            <span>
              <LuTruck /> {o.carrier} · <span className="mono">{o.tracking}</span>
            </span>
          </div>
        </section>
      )}
    </Drawer>
  );
}

export default function Orders() {
  const { orders, customerById, setOrderStatus, toast } = useStore();
  const { path, navigate } = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]>('All');
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState('All');
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<string[]>([]);
  const per = 12;

  const params = match('/app/orders/:id', path.split('?')[0]);
  const open = params ? orders.find((o) => o.id === params.id) ?? null : null;

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return orders.filter((o) => {
      if (tab !== 'All' && o.status !== tab) return false;
      if (channel !== 'All' && o.channel !== channel) return false;
      if (!s) return true;
      const c = customerById(o.customerId);
      return o.number.includes(s) || c?.name.toLowerCase().includes(s) || c?.email.includes(s);
    });
  }, [orders, tab, q, channel, customerById]);

  useEffect(() => setPage(1), [tab, q, channel]);
  const pages = Math.ceil(filtered.length / per);
  const rows = filtered.slice((page - 1) * per, page * per);
  const count = (t: (typeof tabs)[number]) => (t === 'All' ? orders.length : orders.filter((o) => o.status === t).length);
  const allOn = rows.length > 0 && rows.every((r) => sel.includes(r.id));

  const stats = [
    { l: 'Orders today', v: orders.filter((o) => relative(o.date).match(/[mh] ago|just/)).length, f: (n: number) => Math.round(n).toString() },
    { l: 'Awaiting fulfillment', v: orders.filter((o) => o.status === 'Paid' || o.status === 'Pending').length, f: (n: number) => Math.round(n).toString() },
    { l: 'In transit', v: orders.filter((o) => o.status === 'Shipped' || o.status === 'Fulfilled').length, f: (n: number) => Math.round(n).toString() },
    { l: 'Avg. order value', v: orders.reduce((s, o) => s + o.total, 0) / Math.max(1, orders.length), f: (n: number) => money(n, 2) },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Orders"
        sub="Every order from every channel, in one place."
        actions={
          <>
            <Button icon={<LuDownload />} onClick={() => toast({ title: `Exported ${filtered.length} orders`, body: 'orders.csv is downloading.' })}>
              Export
            </Button>
            <Button variant="primary" icon={<LuPlus />} onClick={() => toast({ title: 'Draft order created', body: 'Add products and a customer to continue.', tone: 'info' })}>
              Create order
            </Button>
          </>
        }
      />

      <div className="mini-stats">
        {stats.map((s) => (
          <div key={s.l} className="mini-stat">
            <span>{s.l}</span>
            <b>
              <CountUp value={s.v} format={s.f} />
            </b>
          </div>
        ))}
      </div>

      <div className="card card-flush">
        <div className="tabs-bar">
          {tabs.map((t) => (
            <button key={t} className={cx('tab', tab === t && 'on')} onClick={() => setTab(t)}>
              {t} <span>{count(t)}</span>
            </button>
          ))}
        </div>
        <div className="toolbar">
          <Input icon={<LuSearch />} placeholder="Search by order #, customer or email" value={q} onChange={(e) => setQ(e.target.value)} className="grow" />
          <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
            {['All', 'Online store', 'Instagram', 'TikTok Shop', 'Retail POS', 'Wholesale'].map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All channels' : c}
              </option>
            ))}
          </Select>
        </div>

        <div className={cx('bulk', sel.length > 0 && 'on')}>
          <b>{sel.length} selected</b>
          <Button
            size="sm"
            variant="secondary"
            icon={<LuPackageCheck />}
            onClick={() => {
              sel.forEach((id) => setOrderStatus(id, 'Fulfilled'));
              toast({ title: `${sel.length} orders fulfilled` });
              setSel([]);
            }}
          >
            Fulfill
          </Button>
          <Button size="sm" variant="secondary" icon={<LuPrinter />} onClick={() => toast({ title: `${sel.length} shipping labels generated`, tone: 'info' })}>
            Print labels
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSel([])}>
            Clear
          </Button>
        </div>

        {rows.length === 0 ? (
          <Empty icon={<LuInbox />} title="No orders found" body="Try a different status, channel or search term." action={<Button onClick={() => { setQ(''); setTab('All'); setChannel('All'); }}>Clear filters</Button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="chk">
                    <input type="checkbox" checked={allOn} onChange={() => setSel(allOn ? sel.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...sel, ...rows.map((r) => r.id)])])} />
                  </th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th className="hide-md">Channel</th>
                  <th className="hide-md">Items</th>
                  <th className="hide-sm">Payment</th>
                  <th>Status</th>
                  <th className="r">Total</th>
                </tr>
              </thead>
              <tbody key={`${tab}-${page}-${channel}`}>
                {rows.map((o, i) => {
                  const c = customerById(o.customerId);
                  const on = sel.includes(o.id);
                  return (
                    <tr key={o.id} className={cx('row-in clickable', on && 'selected')} style={{ animationDelay: `${i * 30}ms` }} onClick={() => navigate(`/app/orders/${o.id}`)}>
                      <td className="chk" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={on} onChange={() => setSel(on ? sel.filter((x) => x !== o.id) : [...sel, o.id])} />
                      </td>
                      <td>
                        <b className="mono">{o.number}</b>
                        <div className="sub">
                          {date(o.date, { month: 'short', day: 'numeric' })} · {time(o.date)}
                        </div>
                      </td>
                      <td>
                        <div className="cell-user">
                          <Avatar name={c?.name ?? '?'} hue={c?.avatarHue} size={28} />
                          <div>
                            <span>{c?.name}</span>
                            <div className="sub">
                              {c?.city} {c?.flag}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hide-md muted">{o.channel}</td>
                      <td className="hide-md muted">{(() => { const n = o.items.reduce((s, x) => s + x.qty, 0); return `${n} item${n === 1 ? '' : 's'}`; })()}</td>
                      <td className="hide-sm muted">{o.payment}</td>
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
        )}
        <Pagination page={page} pages={pages} onChange={setPage} total={filtered.length} label="orders" />
      </div>

      <OrderDrawer order={open} onClose={() => navigate('/app/orders')} />
    </div>
  );
}
