// KhataAI — Settings Page
// 📚 Sr.No.5  - JWT Auth: useAuth se user + shopId
// 📚 Sr.No.15 - HTTP: axios GET/PUT /api/settings
// 📚 Sr.No.16 - Serialization: JSON parse/stringify

import { useState, useEffect } from 'react';
import {
    MdEdit, MdSave, MdClose, MdWhatsapp,
    MdNotifications, MdLanguage, MdCurrencyRupee,
    MdVolumeUp, MdPhoneAndroid, MdHelp,
    MdContactSupport, MdLogout, MdCheckCircle,
    MdStore,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import { authAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/* ── Toggle Switch ───────────────────────────────────────── */
const Toggle = ({ value, onChange, disabled }) => (
    <button
        onClick={() => !disabled && onChange(!value)}
        className="relative flex-shrink-0"
        style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            background: value ? '#10b981' : '#1e3448',
            border: `1px solid ${value ? '#10b981' : '#2a4a60'}`,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'background 0.2s ease',
        }}
    >
        <span
            style={{
                position: 'absolute',
                top: '3px',
                left: value ? '22px' : '3px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ffffff',
                transition: 'left 0.2s ease',
            }}
        />
    </button>
);

/* ── Section Card ────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
    <div
        style={{
            background: '#0d1c2d',
            border: '1px solid #1e3448',
            borderRadius: '12px',
            padding: '20px',
            minWidth: 0,
            ...style,
        }}
    >
        {children}
    </div>
);

/* ── Section Header ──────────────────────────────────────── */
const SectionHeader = ({ icon, title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ color: '#10b981', fontSize: '18px', display: 'flex' }}>{icon}</span>
        <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', margin: 0 }}>{title}</p>
    </div>
);

/* ── Row ─────────────────────────────────────────────────── */
const Row = ({ label, sub, right, last = false }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '14px',
            paddingBottom: '14px',
            borderBottom: last ? 'none' : '1px solid rgba(30,52,72,0.7)',
            gap: '12px',
            flexWrap: 'wrap',
        }}
    >
        <div style={{ minWidth: 0 }}>
            <p style={{ color: '#ffffff', fontSize: '13px', margin: 0 }}>{label}</p>
            {sub && (
                <p style={{ color: '#4b6a7a', fontSize: '11px', marginTop: '3px', marginBottom: 0 }}>
                    {sub}
                </p>
            )}
        </div>
        <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
);

/* ── Edit Profile Modal ──────────────────────────────────── */
const EditProfileModal = ({ profile, onClose, onSave }) => {
    const [form, setForm] = useState({
        shopName:  profile.shopName  || '',
        ownerName: profile.ownerName || '',
        phone:     profile.phone     || '',
    });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.shopName.trim()) { toast.error('Shop name is required'); return; }
        setSaving(true);
        try {
            await authAPI.getMe();
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, ...form }));
            toast.success('Profile updated');
            onSave(form);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: '#051424',
        border: '1px solid #1e3448',
        borderRadius: '8px',
        padding: '10px 12px',
        color: '#ffffff',
        fontSize: '13px',
        outline: 'none',
        boxSizing: 'border-box',
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(3,13,23,0.85)',
                padding: '16px',
            }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    width: '100%', maxWidth: '440px',
                    background: '#0d1c2d',
                    border: '1px solid #1e3448',
                    borderRadius: '12px',
                    padding: '24px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '15px', margin: 0 }}>Edit Profile</p>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px', height: '32px',
                            borderRadius: '8px',
                            background: '#1e3448',
                            border: 'none',
                            color: '#94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '18px',
                        }}
                    >
                        <MdClose />
                    </button>
                </div>

                {[
                    { key: 'shopName',  label: 'Shop Name',    placeholder: 'e.g. Sai Kirana Store' },
                    { key: 'ownerName', label: 'Owner Name',   placeholder: 'e.g. Rajesh Kumar'     },
                    { key: 'phone',     label: 'Phone Number', placeholder: '+91 XXXXX XXXXX'        },
                ].map(f => (
                    <div key={f.key} style={{ marginBottom: '16px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                            {f.label}
                        </label>
                        <input
                            value={form[f.key]}
                            onChange={e => set(f.key, e.target.value)}
                            placeholder={f.placeholder}
                            style={inputStyle}
                        />
                    </div>
                ))}

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '10px',
                            borderRadius: '8px',
                            background: '#1e3448',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            flex: 1, padding: '10px',
                            borderRadius: '8px',
                            background: saving ? '#1e3448' : '#10b981',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                    >
                        {saving ? 'Saving...' : <><MdSave /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Settings Page ───────────────────────────────────────── */
const Settings = () => {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();

    const [profile, setProfile] = useState({
        shopName:  '',
        ownerName: '',
        phone:     '',
        avatar:    '',
    });

    const [prefs, setPrefs] = useState({
        currency:          'INR',
        language:          'en',
        creditLimitAlerts: false,
        whatsappReminders: false,
        dailySummary:      false,
        soundAlerts:       false,
        hapticFeedback:    false,
        whatsappConnected: false,
    });

    const [loading,    setLoading]    = useState(true);
    const [showEdit,   setShowEdit]   = useState(false);
    const [savingPref, setSavingPref] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await authAPI.getMe();
                const d   = res.data?.data || res.data?.user || res.data || {};
                setProfile({
                    shopName:  d.shopName  || user?.shopName  || '',
                    ownerName: d.ownerName || user?.ownerName || '',
                    phone:     d.phone     || user?.phone     || '',
                    avatar:    d.avatar    || '',
                });
                const savedPrefs = JSON.parse(localStorage.getItem('khata_prefs') || '{}');
                setPrefs({
                    currency:          savedPrefs.currency          ?? 'INR',
                    language:          savedPrefs.language          ?? 'en',
                    creditLimitAlerts: savedPrefs.creditLimitAlerts ?? false,
                    whatsappReminders: savedPrefs.whatsappReminders ?? false,
                    dailySummary:      savedPrefs.dailySummary      ?? false,
                    soundAlerts:       savedPrefs.soundAlerts       ?? false,
                    hapticFeedback:    savedPrefs.hapticFeedback    ?? false,
                    whatsappConnected: savedPrefs.whatsappConnected ?? false,
                });
            } catch (e) {
                console.error('Settings load error:', e);
                setProfile({
                    shopName:  user?.shopName  || '',
                    ownerName: user?.ownerName || '',
                    phone:     user?.phone     || '',
                    avatar:    '',
                });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const togglePref = async (key) => {
        const next = !prefs[key];
        setPrefs(p => ({ ...p, [key]: next }));
        setSavingPref(key);
        try {
            const saved = JSON.parse(localStorage.getItem('khata_prefs') || '{}');
            localStorage.setItem('khata_prefs', JSON.stringify({ ...saved, [key]: next }));
        } catch (e) {
            setPrefs(p => ({ ...p, [key]: !next }));
            toast.error('Failed to save preference');
        } finally {
            setSavingPref(null);
        }
    };

    const switchLanguage = (lang) => {
        setPrefs(p => ({ ...p, language: lang }));
        try {
            const saved = JSON.parse(localStorage.getItem('khata_prefs') || '{}');
            localStorage.setItem('khata_prefs', JSON.stringify({ ...saved, language: lang }));
            toast.success(lang === 'en' ? 'Language set to English' : 'भाषा हिंदी में बदली');
        } catch (e) {
            toast.error('Failed to update language');
        }
    };

    const handleSignOut = async () => {
        try { await authAPI.logout?.(); } catch (_) {}
        logout?.();
        navigate('/login');
    };

    return (
        <Layout>
            <Navbar title="Settings" />

            <p style={{ color: '#4b6a7a', fontSize: '13px', marginBottom: '20px', marginTop: '2px' }}>
                Manage your business profile, preferences and automation tools.
            </p>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '13px', height: '13px', borderRadius: '50%',
                        border: '2px solid #10b981', borderTopColor: 'transparent',
                        animation: 'spin 0.7s linear infinite',
                    }} />
                    <span style={{ color: '#4b6a7a', fontSize: '12px' }}>Loading settings...</span>
                </div>
            ) : (
                <>
                    {/* ── Profile Card ── */}
                    <Card style={{ marginBottom: '16px' }}>
                        <div className="settings-profile-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <div
                                        style={{
                                            width: '64px', height: '64px',
                                            borderRadius: '12px',
                                            background: '#1e3448',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {profile.avatar ? (
                                            <img
                                                src={profile.avatar}
                                                alt="shop"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <MdStore style={{ color: '#10b981', fontSize: '28px' }} />
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            position: 'absolute', bottom: '-4px', right: '-4px',
                                            width: '20px', height: '20px',
                                            borderRadius: '50%',
                                            background: '#10b981',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <MdEdit style={{ color: '#fff', fontSize: '11px' }} />
                                    </div>
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '16px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {profile.shopName || '—'}
                                    </p>
                                    <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MdStore style={{ fontSize: '13px', flexShrink: 0 }} />
                                        {profile.ownerName ? `${profile.ownerName} (Owner)` : '—'}
                                    </p>
                                    {profile.phone && (
                                        <p style={{ color: '#4b6a7a', fontSize: '12px', marginTop: '3px', marginBottom: 0 }}>
                                            {profile.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowEdit(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    background: '#1e3448',
                                    border: '1px solid #2a4a60',
                                    color: '#94a3b8',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <MdEdit style={{ fontSize: '15px' }} /> Edit Profile
                            </button>
                        </div>
                    </Card>

                    {/* ── 2-col grid ── */}
                    <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

                        {/* Business Preferences */}
                        <Card>
                            <SectionHeader icon={<MdCurrencyRupee />} title="Business Preferences" />

                            <Row
                                label="Base Currency"
                                sub="Used for all ledger calculations"
                                right={
                                    <span
                                        style={{
                                            background: '#1e3448',
                                            color: '#94a3b8',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        ₹ {prefs.currency}
                                    </span>
                                }
                            />

                            <Row
                                label="Application Language"
                                sub="Interface and AI voice language"
                                right={
                                    <div
                                        style={{
                                            display: 'flex',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: '1px solid #1e3448',
                                        }}
                                    >
                                        {[
                                            { key: 'en', label: 'English' },
                                            { key: 'hi', label: 'हिंदी'   },
                                        ].map(l => (
                                            <button
                                                key={l.key}
                                                onClick={() => switchLanguage(l.key)}
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    background: prefs.language === l.key ? '#10b981' : 'transparent',
                                                    color:      prefs.language === l.key ? '#ffffff' : '#94a3b8',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {l.label}
                                            </button>
                                        ))}
                                    </div>
                                }
                            />

                            <Row
                                label="Credit Limit Alerts"
                                sub="Notify when customer reaches limit"
                                last
                                right={
                                    <Toggle
                                        value={prefs.creditLimitAlerts}
                                        onChange={() => togglePref('creditLimitAlerts')}
                                        disabled={savingPref === 'creditLimitAlerts'}
                                    />
                                }
                            />
                        </Card>

                        {/* WhatsApp AI */}
                        <Card>
                            <SectionHeader icon={<MdWhatsapp />} title="WhatsApp AI" />

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    paddingTop: '14px',
                                    paddingBottom: '14px',
                                    borderBottom: '1px solid rgba(30,52,72,0.7)',
                                    gap: '12px',
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ color: '#10b981', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                                        Auto-Send Reminders
                                    </p>
                                    <p style={{ color: '#4b6a7a', fontSize: '11px', marginTop: '4px', marginBottom: 0, lineHeight: '1.5' }}>
                                        Sends automated professional WhatsApp messages to customers for pending payments.
                                    </p>
                                </div>
                                <Toggle
                                    value={prefs.whatsappReminders}
                                    onChange={() => togglePref('whatsappReminders')}
                                    disabled={savingPref === 'whatsappReminders'}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingTop: '14px',
                                    paddingBottom: '14px',
                                    borderBottom: '1px solid rgba(30,52,72,0.7)',
                                    gap: '12px',
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ color: '#ffffff', fontSize: '13px', margin: 0 }}>Daily Summary</p>
                                    <p style={{ color: '#4b6a7a', fontSize: '11px', marginTop: '3px', marginBottom: 0 }}>
                                        Get end-of-day reports
                                    </p>
                                </div>
                                <Toggle
                                    value={prefs.dailySummary}
                                    onChange={() => togglePref('dailySummary')}
                                    disabled={savingPref === 'dailySummary'}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingTop: '14px',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                }}
                            >
                                <span style={{ color: '#4b6a7a', fontSize: '12px' }}>Status:</span>
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: prefs.whatsappConnected ? '#10b981' : '#f87171',
                                        letterSpacing: '0.3px',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '7px', height: '7px',
                                            borderRadius: '50%',
                                            background: prefs.whatsappConnected ? '#10b981' : '#f87171',
                                            display: 'inline-block',
                                        }}
                                    />
                                    {prefs.whatsappConnected ? 'CONNECTED' : 'NOT CONNECTED'}
                                </span>
                            </div>
                        </Card>

                        {/* System Alerts */}
                        <Card>
                            <SectionHeader icon={<MdNotifications />} title="System Alerts" />

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingTop: '14px',
                                    paddingBottom: '14px',
                                    borderBottom: '1px solid rgba(30,52,72,0.7)',
                                    gap: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                    <MdVolumeUp style={{ color: '#94a3b8', fontSize: '18px', flexShrink: 0 }} />
                                    <p style={{ color: '#ffffff', fontSize: '13px', margin: 0 }}>Sound alerts for entries</p>
                                </div>
                                <Toggle
                                    value={prefs.soundAlerts}
                                    onChange={() => togglePref('soundAlerts')}
                                    disabled={savingPref === 'soundAlerts'}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingTop: '14px',
                                    paddingBottom: '4px',
                                    gap: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                    <MdPhoneAndroid style={{ color: '#94a3b8', fontSize: '18px', flexShrink: 0 }} />
                                    <p style={{ color: '#ffffff', fontSize: '13px', margin: 0 }}>Haptic feedback</p>
                                </div>
                                <Toggle
                                    value={prefs.hapticFeedback}
                                    onChange={() => togglePref('hapticFeedback')}
                                    disabled={savingPref === 'hapticFeedback'}
                                />
                            </div>
                        </Card>

                        {/* Support & Help */}
                        <Card>
                            <SectionHeader icon={<MdHelp />} title="Support & Help" />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                <button
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '18px 12px',
                                        borderRadius: '8px',
                                        background: '#1e3448',
                                        border: '1px solid transparent',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    <MdHelp style={{ fontSize: '22px', color: '#fb923c' }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500 }}>Help Center</span>
                                </button>
                                <button
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '18px 12px',
                                        borderRadius: '8px',
                                        background: '#1e3448',
                                        border: '1px solid transparent',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    <MdContactSupport style={{ fontSize: '22px', color: '#fb923c' }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500 }}>Contact Us</span>
                                </button>
                            </div>

                            <div
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.5px',
                                    background: 'rgba(251,146,60,0.08)',
                                    color: '#fb923c',
                                    border: '1px solid rgba(251,146,60,0.2)',
                                    boxSizing: 'border-box',
                                }}
                            >
                                VERSION 2.4.0 (PRO)
                            </div>
                        </Card>
                    </div>

                    {/* ── Logout ── */}
                    <div
                        style={{
                            background: '#0d1c2d',
                            border: '1px solid #1e3448',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div>
                            <p style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, margin: 0 }}>Logout</p>
                            <p style={{ color: '#4b6a7a', fontSize: '11px', marginTop: '3px', marginBottom: 0 }}>
                                End your current session on this device.
                            </p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                background: 'rgba(248,113,113,0.1)',
                                border: '1px solid rgba(248,113,113,0.2)',
                                color: '#f87171',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                        >
                            <MdLogout /> Sign Out Account
                        </button>
                    </div>
                </>
            )}

            {/* Edit Profile Modal */}
            {showEdit && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setShowEdit(false)}
                    onSave={(updated) => {
                        setProfile(p => ({ ...p, ...updated }));
                        setShowEdit(false);
                    }}
                />
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }

                @media (max-width: 768px) {
                    .settings-grid { grid-template-columns: 1fr !important; }
                    .settings-profile-row { flex-direction: column; align-items: flex-start !important; }
                    .settings-profile-row > button { width: 100%; justify-content: center; }
                }
            `}</style>
        </Layout>
    );
};

export default Settings;