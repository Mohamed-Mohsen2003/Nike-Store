import { useEffect, useMemo, useState } from 'react';
import { LuPlus, LuSearch, LuLayoutGrid, LuList, LuPencil, LuTrash2, LuStar, LuBox, LuEllipsis, LuCopy, LuTriangleAlert } from 'react-icons/lu';
import { PageHeader, Button, Input, Select, Badge, Segmented, Modal, Field, Empty, Menu, MenuItem, Progress } from '../../components/ui';
import { Sparkline } from '../../components/charts';
import { useStore } from '../../lib/store';
import { useRouter } from '../../lib/router';
import { money, cx } from '../../lib/format';
import type { Product } from '../../lib/data';
import { CountUp } from '../../lib/motion';

const images = ['air', 'air2', 'blazer', 'blazer2', 'crater', 'crater2', 'hippie', 'hippie2', 'jordan', 'jordan2'].map((i) => `products/${i}.webp`);

const blank = (): Product => ({
  id: 'p_' + Date.now(),
  sku: 'STR-NEW-' + Math.floor(1000 + Math.random() * 8999),
  name: '',
  collection: 'Force',
  image: images[0],
  price: 120,
  cost: 44,
  stock: 100,
  reorderAt: 25,
  sold30: 0,
  rating: 0,
  status: 'draft',
  colorway: '',
  trend: Array.from({ length: 14 }, () => 2),
});

function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { upsertProduct, toast } = useStore();
  const [p, setP] = useState<Product>(product ?? blank());
  const [err, setErr] = useState('');
  useEffect(() => {
    if (product) {
      setP(product);
      setErr('');
    }
  }, [product]);
  const isNew = !!product && product.name === '';
  const margin = p.price ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));
  const save = () => {
    if (p.name.trim().length < 2) return setErr('Give the product a name.');
    if (!p.colorway.trim()) return setErr('Add a colorway, e.g. “Triple Black”.');
    if (p.price <= 0) return setErr('Price must be greater than zero.');
    upsertProduct(p);
    toast({ title: isNew ? 'Product created' : 'Product saved', body: `${p.name} · ${p.colorway}` });
    onClose();
  };
  return (
    <Modal
      open={!!product}
      onClose={onClose}
      width={680}
      title={isNew ? 'New product' : 'Edit product'}
      sub={isNew ? 'Add a product to your catalog. You can publish it when ready.' : p.sku}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={save}>
            {isNew ? 'Create product' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="pm-grid">
        <div className="pm-media">
          <div className="pm-preview">
            <img src={p.image} alt="" key={p.image} />
          </div>
          <div className="pm-thumbs">
            {images.map((img) => (
              <button key={img} className={cx(img === p.image && 'on')} onClick={() => set('image', img)} type="button">
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="pm-fields">
          <Field label="Product name">
            <Input value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="Stride Force High" />
          </Field>
          <div className="row-2">
            <Field label="Colorway">
              <Input value={p.colorway} onChange={(e) => set('colorway', e.target.value)} placeholder="Triple Black" />
            </Field>
            <Field label="Collection">
              <Select value={p.collection} onChange={(e) => set('collection', e.target.value)}>
                {['Force', 'Court', 'Crater', 'Space', 'Legacy'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="row-2">
            <Field label="Price (USD)">
              <Input type="number" value={p.price} onChange={(e) => set('price', +e.target.value)} />
            </Field>
            <Field label="Unit cost" hint={`Gross margin: ${margin}%`}>
              <Input type="number" value={p.cost} onChange={(e) => set('cost', +e.target.value)} />
            </Field>
          </div>
          <div className="row-2">
            <Field label="Stock on hand">
              <Input type="number" value={p.stock} onChange={(e) => set('stock', +e.target.value)} />
            </Field>
            <Field label="Status">
              <Segmented
                size="sm"
                value={p.status}
                onChange={(v) => set('status', v)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </Field>
          </div>
          {err && <div className="form-err">{err}</div>}
        </div>
      </div>
    </Modal>
  );
}

export default function Products() {
  const { products, deleteProduct, upsertProduct, toast } = useStore();
  const { path, navigate } = useRouter();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [q, setQ] = useState('');
  const [col, setCol] = useState('All');
  const [stock, setStock] = useState('All');
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirm, setConfirm] = useState<Product | null>(null);

  useEffect(() => {
    const qs = new URLSearchParams(path.split('?')[1] ?? '');
    if (qs.get('new')) setEditing(blank());
    const id = qs.get('edit');
    if (id) setEditing(products.find((p) => p.id === id) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const close = () => {
    setEditing(null);
    if (path.includes('?')) navigate('/app/products');
  };

  const list = useMemo(
    () =>
      products.filter((p) => {
        if (col !== 'All' && p.collection !== col) return false;
        if (stock === 'Low' && !(p.stock > 0 && p.stock <= p.reorderAt)) return false;
        if (stock === 'Out' && p.stock !== 0) return false;
        if (stock === 'In' && p.stock <= p.reorderAt) return false;
        const s = q.toLowerCase();
        return !s || p.name.toLowerCase().includes(s) || p.colorway.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s);
      }),
    [products, q, col, stock],
  );

  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const value = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const low = products.filter((p) => p.stock <= p.reorderAt).length;

  const stockTone = (p: Product) => (p.stock === 0 ? 'red' : p.stock <= p.reorderAt ? 'amber' : 'green');
  const actions = (p: Product) => (
    <Menu
      trigger={() => (
        <button className="icon-btn sm" aria-label="Actions" onClick={(e) => e.stopPropagation()}>
          <LuEllipsis />
        </button>
      )}
    >
      <MenuItem icon={<LuPencil />} onClick={() => setEditing(p)}>
        Edit product
      </MenuItem>
      <MenuItem
        icon={<LuCopy />}
        onClick={() => {
          upsertProduct({ ...p, id: 'p_' + Date.now(), sku: p.sku + '-C', name: p.name + ' (copy)', status: 'draft' });
          toast({ title: 'Product duplicated', body: 'Saved as a draft.' });
        }}
      >
        Duplicate
      </MenuItem>
      <MenuItem
        icon={<LuBox />}
        onClick={() => {
          upsertProduct({ ...p, stock: p.stock + 120 });
          toast({ title: 'Restocked +120 pairs', body: `${p.name} · ${p.colorway}` });
        }}
      >
        Restock +120
      </MenuItem>
      <div className="menu-sep" />
      <MenuItem icon={<LuTrash2 />} danger onClick={() => setConfirm(p)}>
        Delete
      </MenuItem>
    </Menu>
  );

  return (
    <div className="page">
      <PageHeader
        title="Products"
        sub="Manage your catalog, pricing and inventory levels."
        actions={
          <Button variant="primary" icon={<LuPlus />} onClick={() => setEditing(blank())}>
            Add product
          </Button>
        }
      />

      <div className="mini-stats">
        <div className="mini-stat">
          <span>Active products</span>
          <b>
            <CountUp value={products.filter((p) => p.status === 'active').length} />
          </b>
        </div>
        <div className="mini-stat">
          <span>Units in stock</span>
          <b>
            <CountUp value={totalUnits} />
          </b>
        </div>
        <div className="mini-stat">
          <span>Inventory value (cost)</span>
          <b>
            <CountUp value={value} format={(n) => money(n)} />
          </b>
        </div>
        <div className="mini-stat warn">
          <span>
            <LuTriangleAlert /> Low or out of stock
          </span>
          <b>
            <CountUp value={low} />
          </b>
        </div>
      </div>

      <div className="toolbar card">
        <Input icon={<LuSearch />} placeholder="Search name, colorway or SKU" value={q} onChange={(e) => setQ(e.target.value)} className="grow" />
        <Select value={col} onChange={(e) => setCol(e.target.value)}>
          {['All', 'Force', 'Court', 'Crater', 'Space', 'Legacy'].map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All collections' : c}
            </option>
          ))}
        </Select>
        <Select value={stock} onChange={(e) => setStock(e.target.value)}>
          <option value="All">Any stock</option>
          <option value="In">In stock</option>
          <option value="Low">Low stock</option>
          <option value="Out">Out of stock</option>
        </Select>
        <Segmented
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: 'grid', label: <LuLayoutGrid /> },
            { value: 'list', label: <LuList /> },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <div className="card">
          <Empty icon={<LuBox />} title="No products match" body="Adjust your filters or add a new product to your catalog." action={<Button variant="primary" icon={<LuPlus />} onClick={() => setEditing(blank())}>Add product</Button>} />
        </div>
      ) : view === 'grid' ? (
        <div className="product-grid" key={`${col}-${stock}`}>
          {list.map((p, i) => (
            <article key={p.id} className="pcard" style={{ animationDelay: `${i * 50}ms` }} onClick={() => setEditing(p)}>
              <div className="pcard-media">
                <img src={p.image} alt={p.name} />
                <div className="pcard-tags">
                  <Badge tone={p.status === 'active' ? 'green' : 'gray'}>{p.status === 'active' ? 'Active' : p.status === 'draft' ? 'Draft' : 'Archived'}</Badge>
                </div>
                <div className="pcard-actions">{actions(p)}</div>
              </div>
              <div className="pcard-body">
                <div className="pcard-title">
                  <div>
                    <b>{p.name}</b>
                    <span>{p.colorway}</span>
                  </div>
                  <b className="tnum">{money(p.price)}</b>
                </div>
                <div className="pcard-stats">
                  <span>
                    <LuStar /> {p.rating || '—'}
                  </span>
                  <span>{p.sold30} sold / 30d</span>
                  <Sparkline values={p.trend} width={64} height={22} fill={false} />
                </div>
                <div className="pcard-stock">
                  <div>
                    <span>Stock</span>
                    <b className={`txt-${stockTone(p)}`}>{p.stock === 0 ? 'Out of stock' : `${p.stock} pairs`}</b>
                  </div>
                  <Progress value={Math.min(100, (p.stock / 400) * 100)} tone={stockTone(p) === 'green' ? 'accent' : stockTone(p)} />
                </div>
              </div>
            </article>
          ))}
          <button className="pcard pcard-new" onClick={() => setEditing(blank())} style={{ animationDelay: `${list.length * 50}ms` }}>
            <span>
              <LuPlus />
            </span>
            <b>Add product</b>
            <p>Create a new SKU in seconds</p>
          </button>
        </div>
      ) : (
        <div className="card card-flush">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="hide-sm">SKU</th>
                  <th>Status</th>
                  <th className="hide-md">Sold / 30d</th>
                  <th>Stock</th>
                  <th className="r">Price</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((p, i) => (
                  <tr key={p.id} className="row-in clickable" style={{ animationDelay: `${i * 30}ms` }} onClick={() => setEditing(p)}>
                    <td>
                      <div className="cell-user">
                        <span className="thumb sm">
                          <img src={p.image} alt="" />
                        </span>
                        <div>
                          <b>{p.name}</b>
                          <div className="sub">{p.colorway}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-sm mono muted">{p.sku}</td>
                    <td>
                      <Badge>{p.status}</Badge>
                    </td>
                    <td className="hide-md">
                      <div className="cell-spark">
                        <span>{p.sold30}</span>
                        <Sparkline values={p.trend} width={70} height={22} fill={false} />
                      </div>
                    </td>
                    <td>
                      <Badge tone={stockTone(p)}>{p.stock === 0 ? 'Out' : p.stock}</Badge>
                    </td>
                    <td className="r tnum">
                      <b>{money(p.price)}</b>
                    </td>
                    <td className="r" onClick={(e) => e.stopPropagation()}>
                      {actions(p)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProductModal product={editing} onClose={close} />
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        width={420}
        title="Delete product?"
        sub={confirm ? `“${confirm.name} · ${confirm.colorway}” will be removed from your catalog. This can’t be undone.` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<LuTrash2 />}
              onClick={() => {
                if (confirm) {
                  deleteProduct(confirm.id);
                  toast({ title: 'Product deleted', tone: 'warning' });
                }
                setConfirm(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
