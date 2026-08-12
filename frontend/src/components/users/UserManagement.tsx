import React, { useEffect, useState } from 'react';
import { Users, Search, RefreshCw, Shield, Mail } from 'lucide-react';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  title: string;
  avatar: string;
  email: string;
  permissions: string[];
}

interface EditUserForm {
  name: string;
  title: string;
  role: string;
  email: string;
  avatar: string;
  permissions: string;
  password: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>({
    name: '',
    title: '',
    role: 'SUPPORT_SPECIALIST',
    email: '',
    avatar: '',
    permissions: '',
    password: '',
  });
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const roleOptions = [
    'SUPPORT_SPECIALIST',
    'PRODUCT_MANAGER',
    'ENGINEERING_LEAD',
    'ENTERPRISE_ADMIN'
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      title: user.title || '',
      role: user.role,
      email: user.email || '',
      avatar: user.avatar || '',
      permissions: (user.permissions || []).join(', '),
      password: '',
    });
    setEditError('');
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({
      name: '',
      title: '',
      role: 'SUPPORT_SPECIALIST',
      email: '',
      avatar: '',
      permissions: '',
      password: '',
    });
    setEditError('');
  };

  const handleEditInput = (field: keyof EditUserForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const trimmedName = editForm.name.trim();
    if (!trimmedName) {
      setEditError('Name is required.');
      return;
    }

    const permissions = editForm.permissions
      .split(',')
      .map((permission) => permission.trim())
      .filter(Boolean);

    if (editForm.password && editForm.password.length > 0) {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{16,}$/;
      if (!passwordPattern.test(editForm.password)) {
        setEditError('Password must be at least 16 characters and include upper/lowercase letters plus one special character.');
        return;
      }
    }

    setIsSaving(true);
    setEditError('');

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          title: editForm.title.trim(),
          role: editForm.role,
          email: editForm.email.trim(),
          avatar: editForm.avatar.trim(),
          permissions,
          password: editForm.password || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save user');
      }

      setUsers((prevUsers) => prevUsers.map((user) => user.id === data.id ? data : user));
      closeEditModal();
    } catch (error: any) {
      setEditError(error.message || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} />
            User Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Manage enterprise identities and role-based access.
          </p>
        </div>
        
        <button className="btn btn-outline" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        {editingUser && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            padding: '16px',
          }}>
            <div className="glass-modal" style={{
              width: '100%',
              maxWidth: '540px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-medium)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Edit User: {editingUser.name}
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Update role, email, permissions, or reset the password.
                  </p>
                </div>
                <button className="btn btn-ghost" onClick={closeEditModal} style={{ padding: '8px' }}>
                  Close
                </button>
              </div>

              <form onSubmit={saveUser} style={{ padding: '24px' }}>
                {editError && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                  }}>
                    {editError}
                  </div>
                )}

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full name</label>
                    <input
                      className="input"
                      value={editForm.name}
                      onChange={(e) => handleEditInput('name', e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Username</label>
                    <input
                      className="input"
                      value={editingUser.username}
                      readOnly
                    />
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email address</label>
                    <input
                      type="email"
                      className="input"
                      value={editForm.email}
                      onChange={(e) => handleEditInput('email', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Title</label>
                    <input
                      className="input"
                      value={editForm.title}
                      onChange={(e) => handleEditInput('title', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Role</label>
                    <select
                      className="select"
                      value={editForm.role}
                      onChange={(e) => handleEditInput('role', e.target.value)}
                    >
                      {roleOptions.map((option) => (
                        <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Permissions</label>
                    <input
                      className="input"
                      value={editForm.permissions}
                      onChange={(e) => handleEditInput('permissions', e.target.value)}
                      placeholder="ENCAPSULATE_FEEDBACK, COMMENT_FEEDBACK"
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Separate permissions with commas.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Reset password</label>
                    <input
                      type="password"
                      className="input"
                      value={editForm.password}
                      onChange={(e) => handleEditInput('password', e.target.value)}
                      placeholder="Leave blank to keep current password"
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Optional. Must be 16+ characters, mixed case, and include one special character.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-ghost" onClick={closeEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>User</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Username</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Permissions</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          backgroundColor: 'var(--bg-card-active)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 600, color: 'var(--text-primary)',
                          border: '1px solid var(--border-medium)'
                        }}>
                          {user.avatar}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{user.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={10} /> {user.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      @{user.username}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        {user.role.replace(/_/g, ' ')}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.title}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {user.permissions && user.permissions.length > 0 ? user.permissions.map(p => (
                          <span key={p} className="badge" style={{ backgroundColor: 'var(--bg-card-active)', color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                            <Shield size={10} style={{ marginRight: '4px' }} />
                            {p.replace(/_/g, ' ')}
                          </span>
                        )) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No special permissions</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => openEditModal(user)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
