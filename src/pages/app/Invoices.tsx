import { useEffect, useMemo, useState } from 'react';
import { LuPlus, LuSearch, LuSend, LuDownload, LuCheck, LuTrash2, LuFileText, LuBell } from 'react-icons/lu';
import { PageHeader, Button, Input, Badge, Drawer, Modal, Field, Select, Segmented, Empty } from '../../components/ui';
import { useStore } from '../../lib/store';
import { match, useRouter } from '../../lib/router';
import { money, date, cx } from '../../lib/format';
import type { Invoice } from '../../lib/data';
import { CountUp } from '../../lib/motion';
import { Logo } from '../../components/ui';

function Paper({ inv }: { inv: Invoice }) {
  const sub = inv.items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = Math.round(sub * 0.14);
  return (
    <div className="paper">
      <div className="paper-head">
        <div>
          <Logo size={26} />
          <p className="muted">
            Stride Athletics LLC
            <br />
            12 Nile Corniche, Cairo, Egypt
          </p>
        </div>
        <div className="paper-num">
          <span>Invoice</span>
          <b className="mono">{inv.number}</b>
          <Badge>{inv.status}</Badge>
        </div>
      </div>
      <div className="paper-meta">
        <div>
          <span>Billed to</span>
          <b>{inv.client}</b>
          <p className="muted">{inv.email}</p>
        </div>
        <div>
          <span>Issued</span>
          <b>{date(inv.issued)}</b>
        </div>
        <div>
          <span>Due</span>
          <b>{date(inv.due)}</b>
        </div>
      </div>
      <table className="paper-table">
        <thead>
          <tr>
            <th>Description</th>
            <th className="r">Qty</th>
            <th className="r">Unit</th>
            <th className="r">Amount</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it, i) => (
            <tr key={i}>
              <td>{it.desc}</td>
              <td className="r">{it.qty}</td>
              <td className="r">{money(it.price, 2)}</td>
              <td className="r">{money(it.qty * it.price, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="paper-tot">
        <div>
          <span>Subtotal</span>
          <span>{money(sub, 2)}</span>
        </div>
        <div>
          <span>VAT (14%)</span>
          <span>{money(tax, 2)}</span>
        </div>
        <div className="grand">
          <span>Total due</span>
          <b>{money(sub + tax, 2)}</b>
        </div>
      </div>
      <p className="paper-foot">Payment via bank transfer or card. Thank you for partnering with Stride Athletics.</p>
    </div>
  );
}

function NewInvoice({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addInvoice, products, invoices, toast } = useStore();
  const [client, setClient] = useState('Urban Sole Collective');
  const [items, setItems] = useState([{ desc: `${products[0].name} — ${products[0].colorway}`, qty: 24, price: Math.round(products[0].price * 0.58) }]);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const setItem = (i: number, k: 'desc' | 'qty' | 'price', v: string | number) => setItems((x) => x.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const create = (status: Invoice['status']) => {
    const issued = new Date('2026-10-26T12:00:00');
    const due = new Date(issued);
    due.setDate(due.getDate() + 30);
    addInvoice({
      id: 'inv_' + Date.now(),
      number: `INV-2026-${String(319 + invoices.length - 24).padStart(4, '0')}`,
      client,
      email: 'accounts@' + client.toLowerCase().replace(/[^a-z]/g, '') + '.com',
      issued: issued.toISOString(),
      due: due.toISOString(),
      amount: total,
      status,
      items,
    });
    toast({ title: status === 'Draft' ? 'Invoice saved as draft' : 'Invoice sent', body: `${client} · ${money(total, 2)}` });
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={640}
      title="New invoice"
      sub="Bill a wholesale partner. Totals update as you type."
      footer={
        <>
          <Button variant="ghost" onClick={() => create('Draft')}>
            Save draft
          </Button>
          <Button variant="accent" icon={<LuSend />} onClick={() => create('Open')}>
            Send invoice
          </Button>
        </>
      }
    >
      <Field label="Client">
        <Select value={client} onChange={(e) => setClient(e.target.value)}>
          {['Urban Sole Collective', 'Northline Sports', 'Kicks Lab Dubai', 'Cairo Street Supply', 'Sneaker District LDN', 'Atlas Running Co.', 'Mosaic Concept Store', 'Peak Outfitters'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>
      <div className="li-head">
        <span>Item</span>
        <span>Qty</span>
        <span>Unit price</span>
        <span />
      </div>
      {items.map((it, i) => (
        <div key={i} className="li-row">
          <Select value={it.desc} onChange={(e) => {
            const p = products.find((x) => `${x.name} — ${x.colorway}` === e.target.value);
            setItem(i, 'desc', e.target.value);
            if (p) setItem(i, 'price', Math.round(p.price * 0.58));
          }}>
            {products.map((p) => (
              <option key={p.id}>{`${p.name} — ${p.colorway}`}</option>
            ))}
          </Select>
          <Input type="number" value={it.qty} onChange={(e) => setItem(i, 'qty', +e.target.value)} />
          <Input type="number" value={it.price} onChange={(e) => setItem(i, 'price', +e.target.value)} />
          <button className="icon-btn" onClick={() => setItems((x) => x.filter((_, j) => j !== i))} disabled={items.length === 1} aria-label="Remove line">
            <LuTrash2 />
          </button>
        </div>
      ))}
      <Button
        size="sm"
        variant="ghost"
        icon={<LuPlus />}
        onClick={() => setItems((x) => [...x, { desc: `${products[1].name} — ${products[1].colorway}`, qty: 12, price: Math.round(products[1].price * 0.58) }])}
      >
        Add line item
      </Button>
      <div className="li-total">
        <span>Subtotal</span>
        <b>
          <CountUp value={total} format={(n) => money(n, 2)} duration={500} />
        </b>
      </div>
    </Modal>
  );
}

export default function Invoices() {
  const { invoices, setInvoiceStatus, toast } = useStore();
  const { path, navigate } = useRouter();
  const [status, setStatus] = useState<'All' | Invoice['status']>('All');
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const params = match('/app/invoices/:id', path.split('?')[0]);
  const open = params ? invoices.find((i) => i.id === params.id) ?? null : null;
  const [shown, setShown] = useState<Invoice | null>(open);
  useEffect(() => {
    if (open) setShown(open);
  }, [open]);
  useEffect(() => {
    if (path.includes('new=1')) setCreating(true);
  }, [path]);

  const list = useMemo(
    () => invoices.filter((i) => (status === 'All' || i.status === status) && (!q || i.client.toLowerCase().includes(q.toLowerCase()) || i.number.toLowerCase().includes(q.toLowerCase()))),
    [invoices, status, q],
  );
  const sumBy = (s: Invoice['status']) => invoices.filter((i) => i.status === s).reduce((a, i) => a + i.amount, 0);
  const cards = [
    { l: 'Outstanding', v: sumBy('Open'), tone: 'blue', n: invoices.filter((i) => i.status === 'Open').length },
    { l: 'Overdue', v: sumBy('Overdue'), tone: 'red', n: invoices.filter((i) => i.status === 'Overdue').length },
    { l: 'Paid (90 days)', v: sumBy('Paid'), tone: 'green', n: invoices.filter((i) => i.status === 'Paid').length },
    { l: 'Drafts', v: sumBy('Draft'), tone: 'gray', n: invoices.filter((i) => i.status === 'Draft').length },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Invoices"
        sub="Bill wholesale partners and get paid faster."
        actions={
          <Button variant="primary" icon={<LuPlus />} onClick={() => setCreating(true)}>
            New invoice
          </Button>
        }
      />
      <div className="inv-cards">
        {cards.map((c, i) => (
          <div key={c.l} className={`inv-card tone-${c.tone}`} style={{ animationDelay: `${i * 70}ms` }}>
            <span>
              <i /> {c.l}
            </span>
            <b>
              <CountUp value={c.v} format={(n) => money(n)} />
            </b>
            <em>{c.n} invoices</em>
          </div>
        ))}
      </div>
      <div className="card card-flush">
        <div className="toolbar">
          <Segmented
            size="sm"
            value={status}
            onChange={setStatus}
            options={(['All', 'Open', 'Overdue', 'Paid', 'Draft'] as const).map((s) => ({ value: s, label: s }))}
          />
          <Input icon={<LuSearch />} placeholder="Search client or invoice #" value={q} onChange={(e) => setQ(e.target.value)} className="grow" />
        </div>
        {list.length === 0 ? (
          <Empty icon={<LuFileText />} title="No invoices" body="Nothing matches those filters yet." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th className="hide-sm">Issued</th>
                  <th className="hide-md">Due</th>
                  <th>Status</th>
                  <th className="r">Amount</th>
                </tr>
              </thead>
              <tbody key={status}>
                {list.map((inv, i) => (
                  <tr key={inv.id} className="row-in clickable" style={{ animationDelay: `${i * 25}ms` }} onClick={() => navigate(`/app/invoices/${inv.id}`)}>
                    <td>
                      <b className="mono">{inv.number}</b>
                    </td>
                    <td>
                      <b>{inv.client}</b>
                      <div className="sub">{inv.email}</div>
                    </td>
                    <td className="hide-sm muted">{date(inv.issued)}</td>
                    <td className={cx('hide-md', inv.status === 'Overdue' ? 'txt-red' : 'muted')}>{date(inv.due)}</td>
                    <td>
                      <Badge>{inv.status}</Badge>
                    </td>
                    <td className="r tnum">
                      <b>{money(inv.amount, 2)}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Drawer
        open={!!open}
        onClose={() => navigate('/app/invoices')}
        width={640}
        title={shown ? <span className="mono">{shown.number}</span> : ''}
        footer={
          shown && (
            <>
              <Button variant="ghost" icon={<LuDownload />} onClick={() => toast({ title: 'PDF downloaded', body: `${shown.number}.pdf` })}>
                PDF
              </Button>
              <div style={{ flex: 1 }} />
              {(shown.status === 'Open' || shown.status === 'Overdue') && (
                <Button variant="secondary" icon={<LuBell />} onClick={() => toast({ title: 'Reminder sent', body: shown.email, tone: 'info' })}>
                  Remind
                </Button>
              )}
              {shown.status !== 'Paid' && (
                <Button
                  variant="accent"
                  icon={shown.status === 'Draft' ? <LuSend /> : <LuCheck />}
                  onClick={() => {
                    const next = shown.status === 'Draft' ? 'Open' : 'Paid';
                    setInvoiceStatus(shown.id, next);
                    setShown({ ...shown, status: next });
                    toast({ title: next === 'Paid' ? 'Invoice marked as paid' : 'Invoice sent', body: `${shown.client} · ${money(shown.amount, 2)}` });
                  }}
                >
                  {shown.status === 'Draft' ? 'Send invoice' : 'Mark as paid'}
                </Button>
              )}
            </>
          )
        }
      >
        {shown && <Paper inv={shown} />}
      </Drawer>
      <NewInvoice
        open={creating}
        onClose={() => {
          setCreating(false);
          if (path.includes('?')) navigate('/app/invoices');
        }}
      />
    </div>
  );
}
