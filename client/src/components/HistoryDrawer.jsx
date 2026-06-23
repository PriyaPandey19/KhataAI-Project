import { useEffect, useState } from 'react';
import { MdClose, MdArrowUpward, MdArrowDownward } from 'react-icons/md';

const HistoryDrawer = ({ customer, onClose }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!customer) return;
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/transactions/${customer._id}`);
                const data = await res.json();
                setTransactions(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [customer]);

    if (!customer) return null;

    const totalCredit = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalDebit  = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

    return (
        <>
            {/* backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    zIndex: 998,
                    animation: 'fadeIn 0.2s ease',
                }}
            />

            {/* drawer */}
            <div style={{
                position: 'fixed', top: 0, right: 0,
                width: '360px', height: '100vh',
                background: '#0d1c2d',
                borderLeft: '1px solid #1e3448',
                zIndex: 999,
                display: 'flex', flexDirection: 'column',
                animation: 'slideInRight 0.25s ease',
            }}>

                {/* header */}
                <div style={{
                    padding: '18px 20px',
                    borderBottom: '1px solid #1e3448',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: '#1e3448', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>
                                {customer.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                                {customer.name}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>
                                Transaction History
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#1e3448', border: '1px solid #2e4a62',
                            borderRadius: '8px', width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#94a3b8',
                        }}
                    >
                        <MdClose style={{ fontSize: '16px' }} />
                    </button>
                </div>

                {/* summary strip */}
                <div style={{
                    display: 'flex', gap: '1px',
                    borderBottom: '1px solid #1e3448', flexShrink: 0,
                }}>
                    <div style={{ flex: 1, padding: '14px 20px', background: '#0a1628' }}>
                        <p style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', margin: '0 0 4px' }}>TOTAL IN</p>
                        <p style={{ color: '#10b981', fontSize: '16px', fontWeight: 700, margin: 0 }}>
                            ₹{totalCredit.toLocaleString('en-IN')}
                        </p>
                    </div>
                    <div style={{ flex: 1, padding: '14px 20px', background: '#0a1628' }}>
                        <p style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', margin: '0 0 4px' }}>TOTAL OUT</p>
                        <p style={{ color: '#f87171', fontSize: '16px', fontWeight: 700, margin: 0 }}>
                            ₹{Math.abs(totalDebit).toLocaleString('en-IN')}
                        </p>
                    </div>
                    <div style={{ flex: 1, padding: '14px 20px', background: '#0a1628' }}>
                        <p style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', margin: '0 0 4px' }}>BALANCE</p>
                        <p style={{ color: '#fb923c', fontSize: '16px', fontWeight: 700, margin: 0 }}>
                            ₹{Number(customer.totalBalance || 0).toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>

                {/* transaction list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                border: '2px solid #1e3448', borderTopColor: '#10b981',
                                animation: 'spin 0.7s linear infinite',
                            }} />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingTop: '48px' }}>
                            <p style={{ color: '#94a3b8', fontSize: '13px' }}>No transactions found</p>
                        </div>
                    ) : (
                        transactions.map((txn, i) => (
                            <div key={txn._id || i} style={{
                                display: 'flex', alignItems: 'flex-start',
                                gap: '12px', padding: '12px 0',
                                borderBottom: '1px solid #1e3448',
                            }}>
                                {/* icon */}
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                                    background: txn.amount > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {txn.amount > 0
                                        ? <MdArrowDownward style={{ color: '#10b981', fontSize: '16px' }} />
                                        : <MdArrowUpward style={{ color: '#f87171', fontSize: '16px' }} />
                                    }
                                </div>

                                {/* note + date */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        color: '#fff', fontSize: '13px', fontWeight: 500,
                                        margin: '0 0 3px', whiteSpace: 'nowrap',
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {txn.note || txn.description || '—'}
                                    </p>
                                    <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>
                                        {new Date(txn.date || txn.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* amount */}
                                <p style={{
                                    color: txn.amount > 0 ? '#10b981' : '#f87171',
                                    fontSize: '13px', fontWeight: 700,
                                    margin: 0, flexShrink: 0,
                                }}>
                                    {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default HistoryDrawer;