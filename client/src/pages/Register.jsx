// KhataAI — Register page

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MdPerson, MdStorefront, MdPhone, MdLock, MdSecurity, MdCloud, MdFingerprint, MdWhatsapp } from 'react-icons/md';
import useAuth from "../hooks/useAuth";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        ownerName: '',
        shopName: '',
        phone: '',
        password: '',
        whatsapp: true
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await register({
            ownerName: formData.ownerName,
            shopName: formData.shopName,
            phone: formData.phone,
            password: formData.password,
            whatsapp: formData.whatsapp
        });
        if (result.success) navigate('/dashboard');
        setLoading(false);
    };

    const TWILIO_NUMBER = '14155238886';
    const JOIN_CODE = 'join skill-straw';
    const waLink = `https://wa.me/${TWILIO_NUMBER}?text=${encodeURIComponent(JOIN_CODE)}`;

    const inputWrap = {
        display: 'flex', alignItems: 'center', gap: '10px',
        background: '#0d1c2d', border: '1px solid #1e3448',
        borderRadius: '8px', padding: '12px 16px'
    };
    const inputStyle = {
        background: 'transparent', border: 'none', outline: 'none',
        color: '#ffffff', fontSize: '14px', width: '100%', minWidth: 0,
        fontFamily: "'Sora', sans-serif", caretColor: '#10b981'
    };
    const labelStyle = {
        display: 'block', fontSize: '11px', fontWeight: 600,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#94a3b8', marginBottom: '8px'
    };
    const iconStyle = { color: '#10b981', fontSize: '18px', flexShrink: 0 };

    const bars = [4, 7, 12, 18, 26, 32, 26, 18, 12, 7, 4, 7, 12, 18, 26, 32, 26, 18, 12, 7, 4];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#030d17', fontFamily: "'Sora', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                input::placeholder { color: #2e4a62; }
                @keyframes bar-pulse {
                    0%   { opacity: 0.45; transform: scaleY(0.55); }
                    100% { opacity: 1;    transform: scaleY(1); }
                }
                .reg-left {
                    width: 420px;
                    flex-shrink: 0;
                    display: flex;
                }
                .reg-right {
                    flex: 1;
                    background: #0a1628;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 56px;
                }
                .reg-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                }
                .reg-mobile-logo { display: none; }
                @media (max-width: 768px) {
                    .reg-left { display: none !important; }
                    .reg-right { padding: 32px 24px; align-items: flex-start; }
                    .reg-grid { grid-template-columns: 1fr !important; }
                    .reg-mobile-logo { display: flex !important; }
                }
            `}</style>

            {/* ══ LEFT PANEL ══ */}
            <div className="reg-left" style={{
                background: '#051424', minHeight: '100vh',
                padding: '32px 36px', flexDirection: 'column',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                            <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
                        </svg>
                    </div>
                    <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.01em' }}>
                        KhataAI
                    </span>
                </div>

                <div style={{
                    borderRadius: '16px', overflow: 'hidden',
                    width: '100%', aspectRatio: '1 / 1.05',
                    background: '#0a2236', position: 'relative', flexShrink: 0
                }}>
                    <img
                        src="/shopkeeper.jpg"
                        alt="Shopkeeper using KhataAI"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
                        background: 'linear-gradient(to top, rgba(3,13,23,0.75) 0%, transparent 100%)'
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '40%', left: 0, right: 0,
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px',
                        padding: '0 20px'
                    }}>
                        {bars.map((h, i) => (
                            <div key={i} style={{
                                width: '4px', height: `${h}px`, borderRadius: '2px',
                                background: '#10b981',
                                animation: `bar-pulse ${0.38 + i * 0.065}s ease-in-out infinite alternate`,
                                transformOrigin: 'bottom'
                            }} />
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '28px' }}>
                    <h2 style={{
                        color: '#ffffff', fontWeight: 800, fontSize: '24px',
                        lineHeight: '1.25', marginBottom: '10px', letterSpacing: '-0.02em'
                    }}>
                        Your Voice,<br />Your Ledger.
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.65', fontWeight: 400 }}>
                        Manage your business transactions naturally with AI-powered voice
                        recording and automated bookkeeping.
                    </p>
                </div>
            </div>

            {/* ══ RIGHT PANEL ══ */}
            <div className="reg-right">
                <div style={{ width: '100%', maxWidth: '440px' }}>

                    {/* Mobile-only logo */}
                    <div className="reg-mobile-logo" style={{
                        alignItems: 'center', gap: '10px', marginBottom: '28px'
                    }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '8px',
                            background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                                <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
                            </svg>
                        </div>
                        <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '20px' }}>KhataAI</span>
                    </div>

                    <h1 style={{
                        color: '#ffffff', fontSize: '28px', fontWeight: 700,
                        marginBottom: '6px', letterSpacing: '-0.02em'
                    }}>
                        Create Account
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px', fontWeight: 400 }}>
                        Setup your digital ledger in less than a minute.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <div style={inputWrap}>
                                <MdPerson style={iconStyle} />
                                <input type="text" name="ownerName" value={formData.ownerName}
                                    onChange={handleChange} placeholder="e.g. Rajesh Kumar"
                                    style={inputStyle} required />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Shop Name</label>
                            <div style={inputWrap}>
                                <MdStorefront style={iconStyle} />
                                <input type="text" name="shopName" value={formData.shopName}
                                    onChange={handleChange} placeholder="e.g. Kumar General Store"
                                    style={inputStyle} required />
                            </div>
                        </div>

                        {/* Phone + PIN — stacks to 1 col on mobile */}
                        <div className="reg-grid">
                            <div>
                                <label style={labelStyle}>Mobile Number</label>
                                <div style={inputWrap}>
                                    <MdPhone style={iconStyle} />
                                    <input type="tel" name="phone" value={formData.phone}
                                        onChange={handleChange} placeholder="6266034195"
                                        maxLength={10} style={inputStyle} required />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Create 6-Digit PIN</label>
                                <div style={inputWrap}>
                                    <MdLock style={iconStyle} />
                                    <input type="password" name="password" value={formData.password}
                                        onChange={handleChange} placeholder="******"
                                        maxLength={6} inputMode="numeric"
                                        style={{ ...inputStyle, letterSpacing: '0.3em' }} required />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                                onClick={() => setFormData({ ...formData, whatsapp: !formData.whatsapp })}
                                style={{
                                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                                    background: formData.whatsapp ? '#10b981' : 'transparent',
                                    border: `1.5px solid ${formData.whatsapp ? '#10b981' : '#2e4a62'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.15s'
                                }}
                            >
                                {formData.whatsapp && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                        stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <label
                                onClick={() => setFormData({ ...formData, whatsapp: !formData.whatsapp })}
                                style={{ color: '#94a3b8', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}
                            >
                                Receive WhatsApp Notifications for transactions
                            </label>
                        </div>

                           <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                width: '100%', padding: '11px',
                                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px',
                                color: '#10b981', fontSize: '13px', fontWeight: 600,
                                textDecoration: 'none', fontFamily: "'Sora', sans-serif",
                                transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.18)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}>
                            <MdWhatsapp style={{ fontSize: '16px' }} />
                            Connect WhatsApp
                        </a>

                        <button
                            type="submit" disabled={loading}
                            style={{
                                width: '100%', padding: '14px',
                                background: '#10b981', border: 'none', borderRadius: '8px',
                                color: '#ffffff', fontSize: '15px', fontWeight: 700,
                                fontFamily: "'Sora', sans-serif",
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'background 0.15s', opacity: loading ? 0.7 : 1
                            }}
                            onMouseEnter={e => !loading && (e.currentTarget.style.background = '#34d399')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#10b981')}
                        >
                            {loading ? 'Creating Account...' : (
                                <>
                                    Register Business
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '20px' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                            Login
                        </Link>
                    </p>

                    <div style={{ marginTop: '28px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
                            <MdSecurity style={{ color: '#10b981', fontSize: '15px' }} />
                            <span style={{ color: '#4b6a7a', fontSize: '12px' }}>PCI DSS Compliant</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '12px' }}>
                            <MdSecurity style={{ color: '#10b981', fontSize: '20px' }} />
                            <MdCloud style={{ color: '#10b981', fontSize: '20px' }} />
                            <MdFingerprint style={{ color: '#10b981', fontSize: '20px' }} />
                        </div>
                        <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2e4a62' }}>
                            © 2024 KhataAI. Secure & Encrypted.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;