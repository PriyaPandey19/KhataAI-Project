// customer grid cards - customers page pe use hota hai
// risk badge, balance, last active, hover delete dikhata hai

import { useState } from 'react';
import RiskBadge from "./RiskBadge";
import HistoryDrawer from './HistoryDrawer';
import { MdWhatsapp, MdHistory, MdNotifications, MdDeleteOutline, MdClose, MdCheck } from "react-icons/md";

const timeAgo = (date) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
};

const CustomerCard = ({ customer, onDelete }) => {
    const [hovered, setHovered] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showReminder, setShowReminder] = useState(false);
    const [reminderSent, setReminderSent] = useState(false);
    const [msg, setMsg] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const balanceColor = customer.totalBalance > 10000
        ? '#f87171'
        : customer.totalBalance > 1000
        ? '#fb923c'
        : '#10b981';

    const leftBorder = customer.riskScore === 'high'
        ? '3px solid #f87171'
        : customer.riskScore === 'medium'
        ? '3px solid #fb923c'
        : '1px solid #1e3448';

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete ${customer.name}? This cannot be undone.`)) return;
        setDeleting(true);
        await onDelete(customer._id);
        setDeleting(false);
    };

    const openReminder = () => {
setMsg(`Hi ${customer.name}, your balance of ₹${Number(customer.totalBalance || 0).toLocaleString('en-IN')} is due. Please make the payment at your earliest convenience.`);        setReminderSent(false);
        setShowReminder(true);
    };

    const sendReminder = () => {
        setReminderSent(true);
        setTimeout(() => setShowReminder(false), 1500);
    };

    return (
        <>
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={openReminder}
                style={{
                    background: '#0d1c2d',
                    border: '1px solid #1e3448',
                    borderLeft: leftBorder,
                    borderRadius: '12px',
                    padding: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    borderColor: hovered ? '#10b981' : '#1e3448',
                }}
            >
                {/* header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '10px',
                            background: '#1e3448', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', position: 'relative', flexShrink: 0
                        }}>
                            <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>
                                {customer.name?.charAt(0).toUpperCase()}
                            </span>
                            <span style={{
                                position: 'absolute', bottom: '-2px', right: '-2px',
                                width: '10px', height: '10px', borderRadius: '50%',
                                background: customer.riskScore === 'high' ? '#f87171' : '#10b981',
                                border: '2px solid #0d1c2d'
                            }} />
                        </div>
                        <div>
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                                {customer.name}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '11px' }}>
                                +91 {customer.phone || 'No phone'}
                            </p>
                        </div>
                    </div>

                    {/* Risk badge + delete bin on hover */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RiskBadge risk={customer.riskScore || 'low'} />
                        <button
                            onClick={handleDelete}
                            title="Delete customer"
                            style={{
                                width: '26px', height: '26px',
                                borderRadius: '6px',
                                background: 'rgba(239,68,68,0.12)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: deleting ? 'not-allowed' : 'pointer',
                                color: '#ef4444',
                                opacity: hovered ? 1 : 0,
                                transform: hovered ? 'scale(1)' : 'scale(0.8)',
                                transition: 'opacity 0.15s, transform 0.15s',
                                flexShrink: 0,
                            }}
                        >
                            {deleting
                                ? <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #ef4444', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }} />
                                : <MdDeleteOutline style={{ fontSize: '14px' }} />
                            }
                        </button>
                    </div>
                </div>

                {/* balance + last active */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>
                            Balance Due
                        </p>
                        <p style={{ color: balanceColor, fontSize: '18px', fontWeight: 700 }}>
                            ₹{Number(customer.totalBalance || 0).toLocaleString('en-IN')}.00
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>
                            Last Active
                        </p>
                        <p style={{ color: '#fff', fontSize: '12px' }}>
                            {timeAgo(customer.updatedAt)}
                        </p>
                    </div>
                </div>

                {/* action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={e => e.stopPropagation()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: '#10b981', border: 'none', borderRadius: '8px',
                            color: '#fff', fontSize: '11px', fontWeight: 600,
                            padding: '6px 12px', cursor: 'pointer'
                        }}>
                        <MdWhatsapp style={{ fontSize: '14px' }} /> WhatsApp
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); setShowHistory(true); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: '#1e3448', border: '1px solid #2e4a62',
                            borderRadius: '8px', color: '#94a3b8', fontSize: '11px',
                            padding: '6px 12px', cursor: 'pointer'
                        }}>
                        <MdHistory style={{ fontSize: '14px' }} /> History
                    </button>
                    <button
                        onClick={e => {e.stopPropagation(); openReminder()}}
                        style={{
                            width: '30px', height: '30px', background: '#1e3448',
                            border: '1px solid #2e4a62', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#94a3b8', flexShrink: 0
                        }}>
                        <MdNotifications style={{ fontSize: '14px' }} />
                    </button>
                </div>
            </div>

            {/* ── History Drawer — outside card div so card onClick doesn't fire ── */}
            {showHistory && (
                <HistoryDrawer
                    customer={customer}
                    onClose={() => setShowHistory(false)}
                />
            )}

            {/* ── Reminder Popup ── */}
            {showReminder && (
                <>
                    <div
                        onClick={() => setShowReminder(false)}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.4)',
                            zIndex: 999,
                        }}
                    />
                    <div style={{
                        position: 'fixed', top: '16px', right: '16px',
                        width: '290px',
                        background: '#0d1c2d',
                        border: '1px solid #1e3448',
                        borderRadius: '12px',
                        padding: '16px',
                        zIndex: 1000,
                        animation: 'slideIn 0.18s ease',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MdNotifications style={{ color: '#10b981', fontSize: '16px' }} />
                                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Send Reminder</span>
                            </div>
                            <button
                                onClick={() => setShowReminder(false)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}
                            >
                                <MdClose style={{ fontSize: '16px' }} />
                            </button>
                        </div>

                        <div style={{ background: '#1e3448', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{customer.name}</span>
                            <span style={{ color: '#f87171', fontSize: '12px', fontWeight: 700 }}>
                                ₹{Number(customer.totalBalance || 0).toLocaleString('en-IN')}
                            </span>
                        </div>

                        <textarea
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                            rows={4}
                            style={{
                                width: '100%', background: '#1e3448',
                                border: '1px solid #2e4a62', borderRadius: '8px',
                                color: '#e2e8f0', fontSize: '12px', padding: '10px',
                                resize: 'none', outline: 'none',
                                boxSizing: 'border-box', lineHeight: '1.5',
                                marginBottom: '12px', fontFamily: 'inherit',
                            }}
                        />

                        <button
                            onClick={sendReminder}
                            disabled={reminderSent}
                            style={{
                                width: '100%', padding: '9px',
                                background: reminderSent ? '#064e3b' : '#10b981',
                                border: 'none', borderRadius: '8px',
                                color: '#fff', fontSize: '12px', fontWeight: 600,
                                cursor: reminderSent ? 'default' : 'pointer',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '6px',
                                transition: 'background 0.2s',
                            }}
                        >
                            {reminderSent
                                ? <><MdCheck style={{ fontSize: '14px' }} /> Reminder Sent!</>
                                : <><MdNotifications style={{ fontSize: '14px' }} /> Send Reminder</>
                            }
                        </button>
                    </div>

                    <style>{`
                        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                    `}</style>
                </>
            )}
        </>
    );
};

const CustomerCards = ({ customers = [], onDelete }) => {
    return (
        <div className='grid-customers'>
            {customers.map(customer => (
                <CustomerCard key={customer._id} customer={customer} onDelete={onDelete} />
            ))}
        </div>
    );
};

export default CustomerCards;