// KhataAI — Login page

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff, MdSecurity, MdLock, MdPhone } from 'react-icons/md';
import useAuth from '../hooks/useAuth';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ phone: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(formData);
        if (result.success) navigate('/dashboard');
        setLoading(false);
    };

    const bars = [4, 7, 12, 18, 26, 32, 26, 18, 12, 7, 4, 7, 12, 18, 26, 32, 26, 18, 12, 7, 4];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#030d17', fontFamily: "'Sora', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                input::placeholder { color: #2e4a62; }
                input:focus { outline: none; }
                @keyframes bar-pulse {
                    0%   { opacity: 0.45; transform: scaleY(0.55); }
                    100% { opacity: 1;    transform: scaleY(1); }
                }
                .login-left {
                    width: 420px;
                    flex-shrink: 0;
                    display: flex;
                }
                .login-right {
                    flex: 1;
                    background: #0a1628;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 56px;
                }
                @media (max-width: 768px) {
                    .login-left { display: none !important; }
                    .login-right { padding: 32px 24px; min-height: 100vh; }
                    .login-mobile-logo {
                        display: flex !important;
                    }
                }
                @media (min-width: 769px) {
                    .login-mobile-logo { display: none !important; }
                }
            `}</style>

            {/* ══ LEFT PANEL ══ */}
            <div className="login-left" style={{
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
                        Manage Your<br />Shop with<br />Confidence.
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.65', fontWeight: 400 }}>
                        Join over 10,000+ businesses using AI-driven
                        ledgers to streamline their daily accounts.
                    </p>
                </div>
            </div>

            {/* ══ RIGHT PANEL ══ */}
            <div className="login-right">
                <div style={{ width: '100%', maxWidth: '400px' }}>

                    {/* Mobile-only logo */}
                    <div className="login-mobile-logo" style={{
                        alignItems: 'center', gap: '10px', marginBottom: '32px'
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
                        Welcome Back
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
                        Enter your details to access your dashboard
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Mobile Number */}
                        <div>
                            <label style={{
                                display: 'block', fontSize: '11px', fontWeight: 600,
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                color: '#94a3b8', marginBottom: '8px'
                            }}>
                                Mobile Number
                            </label>
                            <div style={{
                                display: 'flex', alignItems: 'stretch',
                                background: '#0d1c2d', border: '1px solid #1e3448',
                                borderRadius: '8px', overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '12px 16px', background: '#1e3448',
                                    borderRight: '1px solid #2e4a62',
                                    display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0
                                }}>
                                    <MdPhone style={{ color: '#10b981', fontSize: '16px' }} />
                                    <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>+91</span>
                                </div>
                                <input
                                    type="tel" name="phone"
                                    value={formData.phone} onChange={handleChange}
                                    placeholder="6266034194"
                                    maxLength={10}
                                    style={{
                                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                                        color: '#ffffff', fontSize: '14px', padding: '12px 16px',
                                        fontFamily: "'Sora', sans-serif", caretColor: '#10b981',
                                        minWidth: 0,
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Security PIN */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{
                                    fontSize: '11px', fontWeight: 600,
                                    letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8'
                                }}>
                                    Security PIN
                                </label>
                                <button type="button" style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: '#10b981', fontSize: '12px', fontWeight: 600,
                                    fontFamily: "'Sora', sans-serif"
                                }}>
                                    Forgot PIN?
                                </button>
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: '#0d1c2d', border: '1px solid #1e3448',
                                borderRadius: '8px', padding: '12px 16px'
                            }}>
                                <MdLock style={{ color: '#10b981', fontSize: '18px', flexShrink: 0 }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password} onChange={handleChange}
                                    placeholder="******"
                                    maxLength={6} pattern="[0-9]{6}" inputMode="numeric"
                                    style={{
                                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                                        color: '#ffffff', fontSize: '14px',
                                        fontFamily: "'Sora', sans-serif", caretColor: '#10b981',
                                        letterSpacing: '0.3em', minWidth: 0,
                                    }}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    {showPassword
                                        ? <MdVisibility style={{ color: '#10b981', fontSize: '20px' }} />
                                        : <MdVisibilityOff style={{ color: '#10b981', fontSize: '20px' }} />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
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
                            {loading ? 'Logging in...' : (
                                <>
                                    Secure Login
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '20px' }}>
                        New to KhataAI?{' '}
                        <Link to="/register" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                            Register Business
                        </Link>
                    </p>

                    <div style={{ marginTop: '28px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MdSecurity style={{ color: '#10b981', fontSize: '15px' }} />
                                <span style={{ color: '#4b6a7a', fontSize: '12px' }}>PCI DSS Compliant</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MdLock style={{ color: '#10b981', fontSize: '15px' }} />
                                <span style={{ color: '#4b6a7a', fontSize: '12px' }}>256-bit AES</span>
                            </div>
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

export default Login;