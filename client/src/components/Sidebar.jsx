// Sr.No.1 — WebSocket: Voice Entry button se real time entry
// Sr.No.8  — LLM: Groq se voice text parse hota hai

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MdHome, MdPeople, MdReceipt, MdBarChart, MdSettings, MdMic } from 'react-icons/md';
import { voiceAPI } from '../services/api';
import toast from 'react-hot-toast';

const navItems = [
    { path: '/dashboard',    icon: MdHome,     label: 'Home'         },
    { path: '/customers',    icon: MdPeople,   label: 'Customers'    },
    { path: '/transactions', icon: MdReceipt,  label: 'Transactions' },
    { path: '/analytics',    icon: MdBarChart, label: 'Analytics'    },
    { path: '/settings',     icon: MdSettings, label: 'Settings'     },
];

const Sidebar = ({ onNavigate }) => {
    const [listening, setListening] = useState(false);
    const [processing, setProcessing] = useState(false);

    const startVoiceEntry = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error('Voice input not supported in this browser. Try Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setListening(true);
            toast('🎤 Listening... speak now', { duration: 2000 });
        };

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setListening(false);
            setProcessing(true);
            toast(`Heard: "${transcript}"`, { duration: 3000 });

            try {
                const res = await voiceAPI.process(transcript);
                const data = res.data?.data;
                const action = data.type === 'credit' ? 'Udhaar diya' : 'Payment mili';
                toast.success(`${action}: ${data.customerName} — ₹${data.amount}`, { duration: 4000 });
            } catch (e) {
                console.error('Voice entry error:', e);
                toast.error(e?.response?.data?.message || 'Could not process voice entry');
            } finally {
                setProcessing(false);
            }
        };

        recognition.onerror = (event) => {
            setListening(false);
            if (event.error === 'no-speech') {
                toast.error('No speech detected. Try again.');
            } else {
                toast.error('Voice input failed. Try again.');
            }
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.start();
    };

    return (
        <div
            className='flex flex-col justify-between'
            style={{
                width: '208px',
                minHeight: '100vh',
                background: '#051424',
                zIndex: 50,
                padding: '24px 16px',
            }}
        >
            <div>
                {/* Logo */}
                <div className='flex items-center gap-3' style={{ marginBottom: '40px', paddingLeft: '4px' }}>
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: '#10b981', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <MdReceipt style={{ color: '#fff', fontSize: '20px' }} />
                    </div>
                    <div>
                        <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px', lineHeight: '1.2' }}>KhataAI</p>
                        <p style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '2px' }}>Kirana Ledger</p>
                    </div>
                </div>

                {/* Nav links */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {navItems.map(({ path, icon: Icon, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={() => onNavigate?.()}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: isActive ? 600 : 400,
                                background: isActive ? '#10b981' : 'transparent',
                                color: isActive ? '#ffffff' : '#94a3b8',
                                textDecoration: 'none',
                                transition: 'all 0.15s',
                            })}
                            onMouseEnter={e => {
                                if (!e.currentTarget.style.background.includes('10b981')) {
                                    e.currentTarget.style.background = 'rgba(16,185,129,0.08)';
                                    e.currentTarget.style.color = '#ffffff';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!e.currentTarget.classList.contains('active')) {
                                    const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#94a3b8';
                                    }
                                }
                            }}
                        >
                            <Icon style={{ fontSize: '18px', flexShrink: 0 }} />
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Voice Entry button with pulse */}
            <div style={{ position: 'relative', padding: '8px 0' }}>
                {/* Pulse rings */}
                <span style={{
                    position: 'absolute',
                    inset: '4px',
                    borderRadius: '10px',
                    background: 'rgba(16,185,129,0.35)',
                    animation: 'sidebarPulse 2s ease-out infinite',
                    pointerEvents: 'none',
                }} />
                <span style={{
                    position: 'absolute',
                    inset: '0px',
                    borderRadius: '12px',
                    background: 'rgba(16,185,129,0.15)',
                    animation: 'sidebarPulse 2s ease-out infinite 0.6s',
                    pointerEvents: 'none',
                }} />
                <button
                    onClick={startVoiceEntry}
                    disabled={listening || processing}
                    style={{
                        position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '8px', width: '100%', padding: '12px 0',
                        borderRadius: '10px', background: '#10b981', border: 'none',
                        color: '#ffffff', fontSize: '13px', fontWeight: 600,
                        cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#34d399'}
                    onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                >
                    <MdMic style={{ fontSize: '18px' }} />
                    {processing ? 'Processing...' : listening ? 'Listening...' : 'Voice Entry'}
                </button>
            </div>

            <style>{`
                @keyframes sidebarPulse {
                    0%   { transform: scale(1);    opacity: 1; }
                    100% { transform: scale(1.12); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default Sidebar;