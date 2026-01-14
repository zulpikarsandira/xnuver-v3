import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'
import {
    Plus,
    Trash2,
    Edit,
    Search,
    ShieldCheck,
    Mail,
    Key,
    ArrowRight,
    LogOut,
    Users,
    Lock,
    Eye,
    EyeOff,
    Settings as SettingsIcon
} from 'lucide-react'

function AdminLogin({ onLogin }) {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { data, error } = await supabase
            .from('admin_settings')
            .select('admin_password')
            .single()

        if (error) {
            setError('Database connection error')
        } else if (data.admin_password === password) {
            onLogin()
        } else {
            setError('Invalid admin password')
        }
        setLoading(false)
    }

    return (
        <div className="modal-overlay" style={{ background: 'var(--bg-dark)' }}>
            <div className="glass card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div className="glass" style={{ width: '64px', height: '64px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid var(--primary)' }}>
                        <Lock size={32} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', mb: '8px' }}>Xnuver Admin</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Secure Portal Access</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Admin Password</label>
                        <div style={{ position: 'relative' }}>
                            <Key size={18} style={{ position: 'absolute', left: '12px', top: '12px' }} color="var(--text-secondary)" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                style={{ paddingLeft: '40px', paddingRight: '40px', width: '100%' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <p style={{ color: 'var(--error)', fontSize: '0.8rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
                        {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
                        <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    )
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [editingAccount, setEditingAccount] = useState(null)
    const [formData, setFormData] = useState({
        email: '',
        access_key: '',
        plan: 'Lite',
        controller_id: ''
    })
    const [newAdminPassword, setNewAdminPassword] = useState('')

    useEffect(() => {
        const session = localStorage.getItem('xnuver_admin_session')
        if (session === 'true') setIsLoggedIn(true)
    }, [])

    useEffect(() => {
        if (isLoggedIn) fetchAccounts()
    }, [isLoggedIn])

    async function fetchAccounts() {
        setLoading(true)
        const { data, error } = await supabase
            .from('app_accounts')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching accounts:', error)
        else setAccounts(data)
        setLoading(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (editingAccount) {
            const { error } = await supabase
                .from('app_accounts')
                .update(formData)
                .eq('id', editingAccount.id)
            if (error) alert(error.message)
        } else {
            const { error } = await supabase
                .from('app_accounts')
                .insert([formData])
            if (error) alert(error.message)
        }
        setShowModal(false)
        setEditingAccount(null)
        setFormData({ email: '', access_key: '', plan: 'Lite', controller_id: '' })
        fetchAccounts()
    }

    async function handleChangeAdminPassword(e) {
        e.preventDefault()
        if (!newAdminPassword) return

        const { error } = await supabase
            .from('admin_settings')
            .update({ admin_password: newAdminPassword, updated_at: new Date() })
            .match({ id: (await supabase.from('admin_settings').select('id').single()).data.id })

        if (error) {
            alert('Error updating password: ' + error.message)
        } else {
            alert('Admin password updated successfully!')
            setShowPasswordModal(false)
            setNewAdminPassword('')
        }
    }

    async function handleDelete(id) {
        if (confirm('Are you sure you want to delete this account?')) {
            const { error } = await supabase
                .from('app_accounts')
                .delete()
                .eq('id', id)
            if (error) alert(error.message)
            fetchAccounts()
        }
    }

    function handleLogout() {
        localStorage.removeItem('xnuver_admin_session')
        setIsLoggedIn(false)
    }

    if (!isLoggedIn) {
        return <AdminLogin onLogin={() => {
            localStorage.setItem('xnuver_admin_session', 'true')
            setIsLoggedIn(true)
        }} />
    }

    const filteredAccounts = accounts.filter(acc =>
        acc.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="container">
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>Xnuver Admin</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Centralized Account Management System</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
                        <SettingsIcon size={18} />
                        Security
                    </button>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats Quick View */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass card">
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Accounts</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{accounts.length}</div>
                </div>
                <div className="glass card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Admin Protocol</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>Secure</div>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div className="glass" style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px' }}>
                    <Search size={20} color="var(--text-secondary)" />
                    <input
                        type="text"
                        placeholder="Search accounts by email..."
                        style={{ background: 'none', border: 'none', width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setEditingAccount(null)
                    setFormData({ email: '', access_key: '', plan: 'Lite', controller_id: '' })
                    setShowModal(true)
                }}>
                    <Plus size={20} />
                    Create New Account
                </button>
            </div>

            {/* Table */}
            <div className="glass card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Email Address</th>
                                <th>Access Key</th>
                                <th>Controller ID</th>
                                <th>Plan Level</th>
                                <th>Created At</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading encrypted data...</td></tr>
                            ) : filteredAccounts.length > 0 ? (
                                filteredAccounts.map(acc => (
                                    <tr key={acc.id}>
                                        <td style={{ fontWeight: '600' }}>{acc.email}</td>
                                        <td>
                                            <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
                                                {acc.access_key}
                                            </code>
                                        </td>
                                        <td>
                                            <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--primary)' }}>
                                                {acc.controller_id || 'NOT_SET'}
                                            </code>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${acc.plan.toLowerCase()}`}>
                                                {acc.plan}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {new Date(acc.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => {
                                                    setEditingAccount(acc)
                                                    setFormData({
                                                        email: acc.email,
                                                        access_key: acc.access_key,
                                                        plan: acc.plan,
                                                        controller_id: acc.controller_id || ''
                                                    })
                                                    setShowModal(true)
                                                }}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn btn-danger" style={{ padding: '8px' }} onClick={() => handleDelete(acc.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No accounts found in database.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL: Account Form */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="glass card modal-content" style={{ background: 'var(--bg-charcoal)' }}>
                        <h2 style={{ marginBottom: '24px' }}>{editingAccount ? 'Edit Account' : 'New Account'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px' }} color="var(--text-secondary)" />
                                    <input
                                        type="email"
                                        required
                                        style={{ paddingLeft: '40px', width: '100%' }}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Access Key</label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={18} style={{ position: 'absolute', left: '12px', top: '12px' }} color="var(--text-secondary)" />
                                    <input
                                        type="text"
                                        required
                                        style={{ paddingLeft: '40px', width: '100%' }}
                                        value={formData.access_key}
                                        onChange={(e) => setFormData({ ...formData, access_key: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Controller ID (Unique Link)</label>
                                <div style={{ position: 'relative' }}>
                                    <Users size={18} style={{ position: 'absolute', left: '12px', top: '12px' }} color="var(--text-secondary)" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. XNV-XXXX"
                                        style={{ paddingLeft: '40px', width: '100%' }}
                                        value={formData.controller_id}
                                        onChange={(e) => setFormData({ ...formData, controller_id: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Subscription Plan</label>
                                <select
                                    value={formData.plan}
                                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                    style={{ width: '100%' }}
                                >
                                    <option value="Lite">Lite Access (7 Days)</option>
                                    <option value="Pro">Pro Hack (30 Days)</option>
                                    <option value="Elite">Elite Master (Permanent)</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingAccount ? 'Update Access' : 'Grant Access'}
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Change Admin Password */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="glass card modal-content" style={{ background: 'var(--bg-charcoal)' }}>
                        <h2 style={{ marginBottom: '24px' }}>Change Admin Password</h2>
                        <form onSubmit={handleChangeAdminPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>New Admin Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px' }} color="var(--text-secondary)" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter new password..."
                                        style={{ paddingLeft: '40px', width: '100%' }}
                                        value={newAdminPassword}
                                        onChange={(e) => setNewAdminPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowPasswordModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer Info */}
            <footer style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <p>Xnuver Security Admin &copy; 2026</p>
                <p style={{ marginTop: '8px' }}>Only authorized personnel can access this terminal.</p>
            </footer>
        </div>
    )
}

export default App
