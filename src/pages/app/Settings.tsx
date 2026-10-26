import { useState } from 'react';
import { LuUser, LuBuilding2, LuBell, LuShieldCheck, LuKey, LuPalette, LuCopy, LuEye, LuEyeOff, LuSun, LuMoon, LuMonitor, LuCamera } from 'react-icons/lu';
import { PageHeader, Card, Field, Input, Select, Switch, Button, Avatar, Segmented, Badge } from '../../components/ui';
import { useStore } from '../../lib/store';
import { cx } from '../../lib/format';

const sections = [
  { id: 'profile', label: 'Profile', icon: <LuUser /> },
  { id: 'workspace', label: 'Workspace', icon: <LuBuilding2 /> },
  { id: 'appearance', label: 'Appearance', icon: <LuPalette /> },
  { id: 'notifications', label: 'Notifications', icon: <LuBell /> },
  { id: 'security', label: 'Security', icon: <LuShieldCheck /> },
  { id: 'api', label: 'API keys', icon: <LuKey /> },
];

export default function Settings() {
  const { user, login, toast, theme, toggleTheme } = useStore();
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(user?.name ?? 'Mohamed Mohsen');
  const [email, setEmail] = useState(user?.email ?? 'mohamed@stride.co');
  const [company, setCompany] = useState(user?.company ?? 'Stride Athletics');
  const [notif, setNotif] = useState({ orders: true, stock: true, digest: true, invoices: false, team: true, product: false });
  const [twofa, setTwofa] = useState(true);
  const [reveal, setReveal] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      login({ name, email, company });
      setSaving(false);
      toast({ title: 'Settings saved' });
    }, 700);
  };

  return (
    <div className="page">
      <PageHeader title="Settings" sub="Manage your account and workspace preferences." />
      <div className="settings">
        <nav className="settings-nav">
          {sections.map((s) => (
            <button key={s.id} className={cx(tab === s.id && 'on')} onClick={() => setTab(s.id)}>
              {s.icon} {s.label}
            </button>
          ))}
        </nav>
        <div className="settings-body" key={tab}>
          {tab === 'profile' && (
            <Card title="Profile" sub="This is how teammates see you.">
              <div className="avatar-edit">
                <Avatar name={name} hue={250} size={72} />
                <div>
                  <Button size="sm" icon={<LuCamera />} onClick={() => toast({ title: 'Photo upload is simulated in the demo', tone: 'info' })}>
                    Upload photo
                  </Button>
                  <p className="muted">PNG or JPG, at least 256×256.</p>
                </div>
              </div>
              <div className="form-grid">
                <Field label="Full name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Email">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Job title">
                  <Input defaultValue="Founder & CEO" />
                </Field>
                <Field label="Time zone">
                  <Select defaultValue="Africa/Cairo">
                    <option>Africa/Cairo</option>
                    <option>Asia/Dubai</option>
                    <option>Europe/London</option>
                    <option>America/New_York</option>
                  </Select>
                </Field>
              </div>
              <div className="form-actions">
                <Button variant="accent" onClick={save} loading={saving}>
                  Save changes
                </Button>
              </div>
            </Card>
          )}
          {tab === 'workspace' && (
            <Card title="Workspace" sub="Details used across invoices, emails and reports.">
              <div className="form-grid">
                <Field label="Brand name">
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} />
                </Field>
                <Field label="Workspace URL">
                  <Input defaultValue="app.velora.io/stride-athletics" />
                </Field>
                <Field label="Reporting currency">
                  <Select defaultValue="USD">
                    <option>USD</option>
                    <option>EGP</option>
                    <option>AED</option>
                    <option>SAR</option>
                    <option>EUR</option>
                  </Select>
                </Field>
                <Field label="Fiscal year starts">
                  <Select defaultValue="January">
                    <option>January</option>
                    <option>April</option>
                    <option>July</option>
                  </Select>
                </Field>
              </div>
              <div className="form-actions">
                <Button variant="accent" onClick={save} loading={saving}>
                  Save workspace
                </Button>
              </div>
            </Card>
          )}
          {tab === 'appearance' && (
            <Card title="Appearance" sub="Make Velora feel like home.">
              <div className="theme-pick">
                {[
                  { id: 'dark', label: 'Dark', icon: <LuMoon /> },
                  { id: 'light', label: 'Light', icon: <LuSun /> },
                ].map((t) => (
                  <button key={t.id} className={cx('tp', `tp-${t.id}`, theme === t.id && 'on')} onClick={() => theme !== t.id && toggleTheme()}>
                    <div className="tp-preview">
                      <i />
                      <span />
                      <span />
                    </div>
                    <b>
                      {t.icon} {t.label}
                    </b>
                  </button>
                ))}
                <button className="tp tp-sys" onClick={() => toast({ title: 'System theme follows your OS setting', tone: 'info' })}>
                  <div className="tp-preview">
                    <i />
                    <span />
                    <span />
                  </div>
                  <b>
                    <LuMonitor /> System
                  </b>
                </button>
              </div>
              <div className="pref-row">
                <div>
                  <b>Density</b>
                  <span>Adjust spacing in tables and lists.</span>
                </div>
                <Segmented size="sm" value="comfortable" onChange={() => toast({ title: 'Density updated', tone: 'info' })} options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }]} />
              </div>
            </Card>
          )}
          {tab === 'notifications' && (
            <Card title="Notifications" sub="Choose what reaches your inbox and Slack.">
              {(
                [
                  ['orders', 'New high-value orders', 'Orders over $500 or from VIP customers.'],
                  ['stock', 'Low stock alerts', 'When a product drops below its reorder point.'],
                  ['digest', 'Daily AI briefing', 'A morning summary of what changed and why.'],
                  ['invoices', 'Invoice payments', 'When a wholesale partner pays an invoice.'],
                  ['team', 'Team activity', 'Invites accepted, role changes and removals.'],
                  ['product', 'Product updates', 'New features and improvements to Velora.'],
                ] as const
              ).map(([k, t, d]) => (
                <div key={k} className="pref-row">
                  <div>
                    <b>{t}</b>
                    <span>{d}</span>
                  </div>
                  <Switch checked={notif[k]} onChange={(v) => setNotif({ ...notif, [k]: v })} label={t} />
                </div>
              ))}
            </Card>
          )}
          {tab === 'security' && (
            <Card title="Security" sub="Keep your workspace safe.">
              <div className="pref-row">
                <div>
                  <b>Two-factor authentication</b>
                  <span>Require a code from your authenticator app at sign-in.</span>
                </div>
                <Switch
                  checked={twofa}
                  onChange={(v) => {
                    setTwofa(v);
                    toast({ title: v ? '2FA enabled' : '2FA disabled', tone: v ? 'success' : 'warning' });
                  }}
                />
              </div>
              <div className="pref-row">
                <div>
                  <b>Single sign-on (SAML)</b>
                  <span>Available on the Enterprise plan.</span>
                </div>
                <Badge tone="violet">Enterprise</Badge>
              </div>
              <h4 className="sub-h">Active sessions</h4>
              {[
                ['MacBook Pro · Chrome', 'Cairo, Egypt · this device', true],
                ['iPhone 17 · Velora app', 'Cairo, Egypt · 2 hours ago', false],
                ['Windows · Edge', 'Dubai, UAE · 3 days ago', false],
              ].map(([d, m, cur]) => (
                <div key={d as string} className="pref-row">
                  <div>
                    <b>{d}</b>
                    <span>{m}</span>
                  </div>
                  {cur ? <Badge tone="green">Current</Badge> : <Button size="sm" variant="ghost" onClick={() => toast({ title: 'Session revoked', tone: 'warning' })}>Revoke</Button>}
                </div>
              ))}
            </Card>
          )}
          {tab === 'api' && (
            <Card title="API keys" sub="Use these keys to access the Velora API.">
              {[
                ['Production', 'vel_live_8Kq2Tz7mVx4Rn1Lp9sW3f9a'],
                ['Staging', 'vel_test_3Hc6Jd2Qw8Yb5Nm0Ze7k21c'],
              ].map(([n, k]) => (
                <div key={n} className="api-key">
                  <div>
                    <b>{n}</b>
                    <code>{reveal ? k : k.slice(0, 9) + '•'.repeat(14) + k.slice(-4)}</code>
                  </div>
                  <button className="icon-btn" onClick={() => setReveal((r) => !r)} aria-label="Reveal">
                    {reveal ? <LuEyeOff /> : <LuEye />}
                  </button>
                  <button
                    className="icon-btn"
                    aria-label="Copy"
                    onClick={() => {
                      navigator.clipboard?.writeText(k).catch(() => {});
                      toast({ title: `${n} key copied`, tone: 'info' });
                    }}
                  >
                    <LuCopy />
                  </button>
                </div>
              ))}
              <div className="form-actions">
                <Button variant="secondary" onClick={() => toast({ title: 'New key generated', body: 'Store it somewhere safe — it’s shown only once.' })}>
                  Generate new key
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
