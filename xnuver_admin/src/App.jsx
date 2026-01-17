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
    Settings as SettingsIcon,
    LayoutDashboard,
    PieChart,
    BarChart3,
    Shield
} from 'lucide-react'
import Shuffle from './Shuffle'
import ProfileImg from './assets/gambar.png'
import ProfileImg from './assets/gambar.png'

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
        <div className="modal-overlay" style={{ background: '#0F1115' }}>
            <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '50px', background: '#1C1E26' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Shield size={32} color="#FFF" />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px' }}>Secure Login</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Xnuver Private Terminal</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Access Protocol</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '16px' }}>
                                <Key size={20} color="var(--text-secondary)" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                style={{ paddingLeft: '48px', paddingRight: '48px', width: '100%' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter system key..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: '54px' }}>
                        {loading ? 'VERIFYING...' : 'INITIATE SESSION'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>
            </div>
        </div>
    )
}

const HackerButton = ({ children, onClick, className = "", style = {}, icon: Icon, type = "button" }) => (
    <button type={type} className={`btn-hacker ${className}`} onClick={onClick} style={style}>
        <span className="fold" />
        <div className="points_wrapper">
            <i className="point" />
            <i className="point" />
            <i className="point" />
            <i className="point" />
            <i className="point" />
            <i className="point" />
            <i className="point" />
            <i className="point" />
            <i className="point" />
            <i className="point" />
        </div>
        <span className="btn-inner">
            {Icon && <Icon size={18} />}
            {children}
        </span>
    </button>
)

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
    const [onlineDevices, setOnlineDevices] = useState(0)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true)
            } else {
                setScrolled(false)
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const session = localStorage.getItem('xnuver_admin_session')
        if (session === 'true') setIsLoggedIn(true)
    }, [])

    useEffect(() => {
        if (isLoggedIn) {
            fetchAccounts()
            fetchOnlineDevices()
        }
    }, [isLoggedIn])

    async function fetchOnlineDevices() {
        const { count, error } = await supabase
            .from('devices')
            .select('*', { count: 'exact', head: true })
            .eq('network', 'Online')

        if (!error) setOnlineDevices(count || 0)
    }

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

        const { data: settings } = await supabase.from('admin_settings').select('id').single()

        const { error } = await supabase
            .from('admin_settings')
            .update({ admin_password: newAdminPassword, updated_at: new Date() })
            .eq('id', settings.id)

        if (error) {
            alert('Error updating password: ' + error.message)
        } else {
            alert('Admin password updated successfully!')
            setShowPasswordModal(false)
            setNewAdminPassword('')
        }
    }

    async function handleDelete(id) {
        if (confirm('Are you sure you want to delete this session?')) {
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
        <div className="container" style={{ padding: '0px' }}>
            <div className="dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '0px' }}>
                {/* Left Side Section (New) */}
                <div className="sidebar" style={{
                    paddingTop: '20px',
                    paddingLeft: '20px', // Moving it more to the left
                    maxWidth: '300px'
                }}>
                    <div className="card glass" style={{ padding: '30px', textAlign: 'center', position: 'sticky', top: '20px' }}>
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                            <div style={{
                                position: 'absolute',
                                inset: '-10px',
                                border: '2px dashed var(--accent-green)',
                                borderRadius: '50%',
                                animation: 'spin 10s linear infinite',
                                opacity: 0.3
                            }}></div>
                            <img
                                src={ProfileImg}
                                alt="System Operator"
                                style={{
                                    width: '160px',
                                    height: '160px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '4px solid var(--bg-main)',
                                    boxShadow: '0 0 20px rgba(0, 255, 204, 0.2)'
                                }}
                            />
                        </div>
                        <h3 style={{ color: 'var(--accent-green)', marginBottom: '5px' }}>OPERATOR_X</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Clearance: Level 5</p>

                        <div style={{ marginTop: '30px', textAlign: 'left', fontSize: '0.85rem' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>ACCESS_TIME:</div>
                                <div style={{ fontFamily: 'monospace' }}>{new Date().toLocaleTimeString()}</div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>IP_SOURCE:</div>
                                <div style={{ fontFamily: 'monospace' }}>192.168.1.104</div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>NODE_STATUS:</div>
                                <div style={{ color: 'var(--accent-green)', fontWeight: '700' }}>ONLINE</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="main-content">
                    {/* Sidebar Like Navigation in Reference Image (Top Mini Sidebar) */}
                    <div style={{
                        position: 'sticky',
                        top: '0px',
                        zIndex: 100,
                        marginBottom: '40px',
                        padding: '20px 0',
                        transition: 'all 0.3s ease',
                        background: scrolled ? 'var(--bg-main)' : 'transparent',
                        borderBottom: scrolled ? '1px solid var(--glass-border)' : 'none',
                        marginRight: '20px'
                    }}>
                        <div className="card glass" style={{
                            padding: '12px 30px',
                            borderRadius: scrolled ? '20px' : '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0px',
                            background: scrolled ? 'rgba(28, 30, 38, 0.95)' : 'rgba(28, 30, 38, 0.85)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                                <div style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-0.05em', color: 'var(--accent-green)', textShadow: '0 0 10px rgba(0, 255, 204, 0.2)' }}>XNV</div>
                                <nav style={{
                                    display: 'flex',
                                    gap: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '6px',
                                    borderRadius: '100px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    marginLeft: '10px' /* Shifting navbar to the left for better UX alignment */
                                }}>
                                    <HackerButton icon={LayoutDashboard}>
                                        Dashboard
                                    </HackerButton>
                                    <button className="btn btn-secondary" style={{ padding: '10px', width: '44px', height: '44px', border: 'none', borderRadius: '50%' }}><PieChart size={18} /></button>
                                    <button className="btn btn-secondary" style={{ padding: '10px', width: '44px', height: '44px', border: 'none', borderRadius: '50%' }}><BarChart3 size={18} /></button>
                                    <button className="btn btn-secondary" style={{ padding: '10px', width: '44px', height: '44px', border: 'none', borderRadius: '50%' }} onClick={() => setShowPasswordModal(true)}><SettingsIcon size={18} /></button>
                                </nav>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>System Root</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Admin Access</div>
                                </div>
                                <button className="btn btn-danger" style={{ padding: '10px 20px' }} onClick={handleLogout}>
                                    <LogOut size={18} />
                                    <span style={{ display: 'none', md: 'inline' }}>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Welcome Header */}
                    <div style={{ marginBottom: '40px', paddingLeft: '10px' }}>
                        <Shuffle
                            text="Control Panel"
                            tag="h2"
                            shuffleDirection="right"
                            duration={0.35}
                            animationMode="evenodd"
                            shuffleTimes={1}
                            ease="power3.out"
                            stagger={0.03}
                            threshold={0.1}
                            triggerOnce={true}
                            triggerOnHover={true}
                            respectReducedMotion={true}
                            style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '10px' }}
                        />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Global monitoring & account clearance portal.</p>
                    </div>

                    {/* Stats Grid - Matching Reference Logic */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                        <div className="card stat-card">
                            <span className="stat-label">Total Registered Accounts</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                                <span className="stat-value">{accounts.length}</span>
                                <span style={{ color: 'var(--accent-green)', fontWeight: '700', fontSize: '0.9rem' }}>+12%</span>
                            </div>
                            <div style={{ height: '40px', background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.1))', borderRadius: '8px', marginTop: '10px' }}></div>
                        </div>

                        <div className="card stat-card">
                            <span className="stat-label">System Protocols</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                                <span className="stat-value" style={{ color: 'var(--accent-blue)' }}>ENCRYPTED</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <div style={{ width: '30%', height: '6px', background: 'var(--accent-blue)', borderRadius: '10px' }}></div>
                                <div style={{ width: '50%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}></div>
                            </div>
                        </div>

                        <div className="card stat-card" style={{ border: '2px solid var(--accent-pink)' }}>
                            <span className="stat-label">System Health</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                                <span className="stat-value">99.8%</span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginTop: 'auto' }}>
                                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                    <div key={i} style={{ flex: 1, height: '24px', background: i > 5 ? 'rgba(255,255,255,0.05)' : 'var(--accent-pink)', borderRadius: '4px' }}></div>
                                ))}
                            </div>
                        </div>

                        <div className="card stat-card" style={{ border: '2px solid var(--accent-green)' }}>
                            <span className="stat-label">Online Systems</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                                <span className="stat-value" style={{ color: 'var(--accent-green)' }}>{onlineDevices}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Targets</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', alignItems: 'center' }}>
                                <div style={{ width: '12px', height: '12px', background: 'var(--accent-green)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-green)' }}></div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: '700' }}>LIVE MONITORING</span>
                            </div>
                        </div>
                    </div>

                    {/* Search and Action Bar */}
                    <div className="card glass" style={{ display: 'flex', gap: '20px', padding: '20px', borderRadius: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', padding: '0 20px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            <Search size={20} color="var(--text-secondary)" />
                            <input
                                type="text"
                                placeholder="Search by email protocols..."
                                style={{ background: 'none', border: 'none', width: '100%', height: '54px', color: '#fff' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <HackerButton icon={Plus} style={{ padding: '0 40px', height: '56px' }} onClick={() => {
                            setEditingAccount(null)
                            setFormData({ email: '', access_key: '', plan: 'Lite', controller_id: '' })
                            setShowModal(true)
                        }}>
                            Create Session
                        </HackerButton>
                    </div>

                    {/* Main Database View */}
                    <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
                        <div style={{ padding: '30px 40px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Account Database</h3>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{filteredAccounts.length} Result(s)</span>
                        </div>
                        <div className="table-container" style={{ padding: '20px' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Target Identity</th>
                                        <th>Session Link</th>
                                        <th>Subscription</th>
                                        <th>Deployment</th>
                                        <th style={{ textAlign: 'right' }}>Management</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Decrypting session data...</td></tr>
                                    ) : filteredAccounts.length > 0 ? (
                                        filteredAccounts.map(acc => (
                                            <tr key={acc.id}>
                                                <td data-label="Target Identity">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                                            {acc.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{acc.email}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: #{acc.id.slice(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td data-label="Session Link">
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <code style={{ color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: '700' }}>{acc.access_key}</code>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Controller: {acc.controller_id || 'unlinked'}</div>
                                                    </div>
                                                </td>
                                                <td data-label="Subscription">
                                                    <span className={`badge badge-${acc.plan.toLowerCase()}`}>
                                                        {acc.plan}
                                                    </span>
                                                </td>
                                                <td data-label="Deployment">
                                                    {new Date(acc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                        <button className="btn btn-secondary" style={{ width: '44px', height: '44px', padding: '0', borderRadius: '12px' }} onClick={() => {
                                                            setEditingAccount(acc)
                                                            setFormData({
                                                                email: acc.email,
                                                                access_key: acc.access_key,
                                                                plan: acc.plan,
                                                                controller_id: acc.controller_id || ''
                                                            })
                                                            setShowModal(true)
                                                        }}>
                                                            <Edit size={18} />
                                                        </button>
                                                        <button className="btn btn-danger" style={{ width: '44px', height: '44px', padding: '0', borderRadius: '12px' }} onClick={() => handleDelete(acc.id)}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Empty database cache.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MODAL: Account Form */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="card modal-content" style={{ background: '#1C1E26', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{editingAccount ? 'Modify Session' : 'Deploy New Session'}</h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>Configure target access parameters.</p>
                                </div>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Target Email</label>
                                        <input
                                            type="email"
                                            required
                                            style={{ width: '100%' }}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>License Key</label>
                                        <input
                                            type="text"
                                            required
                                            style={{ width: '100%' }}
                                            value={formData.access_key}
                                            onChange={(e) => setFormData({ ...formData, access_key: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Controller Sync ID</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="XNV-XXXX"
                                            style={{ width: '100%' }}
                                            value={formData.controller_id}
                                            onChange={(e) => setFormData({ ...formData, controller_id: e.target.value.toUpperCase() })}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Clearance Plan</label>
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

                                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                        <button type="button" className="btn btn-secondary" style={{ flex: 1, borderRadius: '0.75rem' }} onClick={() => setShowModal(false)}>ABORT</button>
                                        <HackerButton type="submit" style={{ flex: 1 }}>
                                            {editingAccount ? 'SAVE' : 'DEPLOY'}
                                        </HackerButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL: Change Admin Password */}
                    {showPasswordModal && (
                        <div className="modal-overlay">
                            <div className="card modal-content" style={{ background: '#1C1E26' }}>
                                <div style={{ marginBottom: '30px' }}>
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Security Protocol</h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>Update main terminal access key.</p>
                                </div>
                                <form onSubmit={handleChangeAdminPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>New System Key</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter new key..."
                                            style={{ width: '100%' }}
                                            value={newAdminPassword}
                                            onChange={(e) => setNewAdminPassword(e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowPasswordModal(false)}>CANCEL</button>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                            UPDATE KEY
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <footer style={{ padding: '60px 0', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
                        <div style={{ marginBottom: '10px', fontWeight: '800' }}>XNV CORE v4.0.2</div>
                        <p>&copy; 2026 Xnuver Security Division. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </div>
    )
}

export default App
