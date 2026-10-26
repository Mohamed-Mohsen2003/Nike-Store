import { useEffect, useState } from 'react';
import { LuUserPlus, LuEllipsis, LuTrash2, LuMail, LuShieldCheck, LuSearch, LuSend } from 'react-icons/lu';
import { PageHeader, Button, Avatar, Badge, Modal, Field, Input, Select, Menu, MenuItem, Card } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useRouter } from '../../lib/router';
import type { Member } from '../../lib/data';

const roles: Member['role'][] = ['Admin', 'Manager', 'Analyst', 'Support'];
const perms = [
  ['View dashboards & analytics', [1, 1, 1, 1, 1]],
  ['Manage orders & fulfillment', [1, 1, 1, 0, 1]],
  ['Edit products & inventory', [1, 1, 1, 0, 0]],
  ['Create & send invoices', [1, 1, 0, 0, 0]],
  ['Manage team & billing', [1, 1, 0, 0, 0]],
  ['Delete workspace', [1, 0, 0, 0, 0]],
] as const;

export default function Team() {
  const { team, inviteMember, removeMember, updateMemberRole, toast } = useStore();
  const { path, navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: 'Support' as Member['role'] });
  const [err, setErr] = useState('');
  useEffect(() => {
    if (path.includes('invite=1')) setOpen(true);
  }, [path]);
  const close = () => {
    setOpen(false);
    setErr('');
    if (path.includes('?')) navigate('/app/team');
  };
  const invite = () => {
    if (form.name.trim().length < 2) return setErr('Enter their full name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr('Enter a valid email address.');
    inviteMember(form);
    toast({ title: `Invite sent to ${form.name.split(' ')[0]}`, body: form.email });
    setForm({ name: '', email: '', role: 'Support' });
    close();
  };
  const list = team.filter((m) => !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.email.includes(q.toLowerCase()));

  return (
    <div className="page">
      <PageHeader
        title="Team"
        sub={`${team.length} of 15 seats used on the Scale plan.`}
        actions={
          <Button variant="primary" icon={<LuUserPlus />} onClick={() => setOpen(true)}>
            Invite teammate
          </Button>
        }
      />
      <div className="card card-flush">
        <div className="toolbar">
          <Input icon={<LuSearch />} placeholder="Search teammates" value={q} onChange={(e) => setQ(e.target.value)} className="grow" />
        </div>
        <div className="members">
          {list.map((m, i) => (
            <div key={m.id} className="member" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="member-av">
                <Avatar name={m.name} hue={m.hue} size={40} />
                {m.lastActive === 'Online now' && <span className="online" />}
              </div>
              <div className="member-info">
                <b>
                  {m.name} {m.id === 'u1' && <span className="you">You</span>}
                </b>
                <span>
                  {m.title} · {m.email}
                </span>
              </div>
              <span className="member-last muted hide-sm">{m.lastActive}</span>
              {m.status === 'Invited' && <Badge>Invited</Badge>}
              {m.role === 'Owner' ? (
                <Badge>Owner</Badge>
              ) : (
                <select className="role-select" value={m.role} onChange={(e) => { updateMemberRole(m.id, e.target.value as Member['role']); toast({ title: `${m.name.split(' ')[0]} is now ${e.target.value}` }); }}>
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              )}
              {m.role !== 'Owner' ? (
                <Menu
                  trigger={() => (
                    <button className="icon-btn" aria-label="Member actions">
                      <LuEllipsis />
                    </button>
                  )}
                >
                  {m.status === 'Invited' && (
                    <MenuItem icon={<LuMail />} onClick={() => toast({ title: 'Invite resent', body: m.email, tone: 'info' })}>
                      Resend invite
                    </MenuItem>
                  )}
                  <MenuItem
                    icon={<LuTrash2 />}
                    danger
                    onClick={() => {
                      removeMember(m.id);
                      toast({ title: `${m.name} removed from workspace`, tone: 'warning' });
                    }}
                  >
                    Remove from team
                  </MenuItem>
                </Menu>
              ) : (
                <span style={{ width: 34 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card title="Roles & permissions" sub="What each role can do in this workspace" action={<Badge tone="violet">RBAC</Badge>} pad={false}>
        <div className="table-wrap">
          <table className="table perms">
            <thead>
              <tr>
                <th>Permission</th>
                {['Owner', 'Admin', 'Manager', 'Analyst', 'Support'].map((r) => (
                  <th key={r} className="c">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perms.map(([p, v]) => (
                <tr key={p}>
                  <td>{p}</td>
                  {v.map((on, i) => (
                    <td key={i} className="c">
                      {on ? (
                        <span className="perm on">
                          <LuShieldCheck />
                        </span>
                      ) : (
                        <span className="perm">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={close}
        title="Invite a teammate"
        sub="They’ll get an email to join Stride Athletics on Velora."
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button variant="accent" icon={<LuSend />} onClick={invite}>
              Send invite
            </Button>
          </>
        }
      >
        <Field label="Full name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Hana Saleh" />
        </Field>
        <Field label="Email">
          <Input icon={<LuMail />} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="hana@stride.co" />
        </Field>
        <Field label="Role" hint="You can change this at any time.">
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Member['role'] })}>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>
        {err && <div className="form-err">{err}</div>}
      </Modal>
    </div>
  );
}
