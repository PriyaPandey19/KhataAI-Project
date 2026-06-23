// KhataAI — Transactions Page
// 📚 Sr.No.1  - WebSocket: live new transaction events
// 📚 Sr.No.5  - JWT Auth: useAuth se user + shopId
// 📚 Sr.No.9  - API Performance: Promise.all parallel queries
// 📚 Sr.No.15 - HTTP: axios GET/POST /api/transactions
// 📚 Sr.No.16 - Serialization: JSON parse/stringify
// 📚 Sr.No.18 - Sharding: shopId se sirf apna data

import { useState, useEffect, useCallback } from 'react';
import {
    MdAdd, MdDownload, MdFilterList, MdClose,
    MdTrendingUp, MdAccountBalanceWallet, MdPeople,
    MdMic, MdArrowForward, MdCalendarToday,
} from 'react-icons/md';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import TransactionTable from '../components/TransactionTable';
import { transactionAPI, analyticsAPI, customerAPI } from '../services/api';
import useAuth from '../hooks/useAuth';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const TYPE_FILTERS = [
    { key: 'all',        label: 'All'        },
    { key: 'credit',     label: 'Credit'     },
    { key: 'collection', label: 'Collection' },
];

/* ─── Add Transaction Modal ──────────────────────────────── */
const AddModal = ({ onClose, onSuccess, customers }) => {
    const [form, setForm] = useState({
        customerId:  '',
        type:        'credit',
        amount:      '',
        description: '',
    });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.customerId) { toast.error('Select a customer'); return; }
        if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
            toast.error('Enter a valid amount'); return;
        }
        setSaving(true);
        try {
            await transactionAPI.create({
                customerId:  form.customerId,
                type:        form.type,
                amount:      Number(form.amount),
                description: form.description.trim() || undefined,
            });
            toast.success('Transaction added!');
            onSuccess();
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to add transaction');
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
                maxHeight: '90vh',
                overflowY: 'auto',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '15px', margin: 0 }}>New Transaction</p>
                    <p style={{ color: '#4b6a7a', fontSize: '11px', marginTop: '4px' }}>Add credit or collection entry</p>
                </div>
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
                        flexShrink: 0,
                    }}
                >
                    <MdClose />
                </button>
            </div>

            {/* Type toggle */}
            <div
                style={{
                    display: 'flex', borderRadius: '8px', padding: '4px',
                    background: '#051424', border: '1px solid #1e3448',
                    marginBottom: '16px',
                }}
            >
                {['credit', 'collection'].map(t => (
                    <button
                        key={t}
                        onClick={() => set('type', t)}
                        style={{
                            flex: 1, padding: '10px 0', borderRadius: '6px',
                            fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
                            border: 'none', cursor: 'pointer',
                            background: form.type === t
                                ? t === 'credit' ? 'rgba(249,115,22,0.2)' : 'rgba(16,185,129,0.2)'
                                : 'transparent',
                            color: form.type === t
                                ? t === 'credit' ? '#fb923c' : '#10b981'
                                : '#4b6a7a',
                        }}
                    >
                        {t === 'credit' ? 'Credit (Udhar)' : 'Collection (Vasuli)'}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '6px' }}>Customer</label>
                <select value={form.customerId} onChange={e => set('customerId', e.target.value)} style={inputStyle}>
                    <option value="">Select customer...</option>
                    {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '6px' }}>Amount (₹)</label>
                <input
                    type="number" placeholder="0" value={form.amount}
                    onChange={e => set('amount', e.target.value)} style={inputStyle}
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                    Description <span style={{ color: '#4b6a7a' }}>(optional)</span>
                </label>
                <input
                    type="text" placeholder="e.g. Monthly groceries, Invoice #123..."
                    value={form.description} onChange={e => set('description', e.target.value)} style={inputStyle}
                />
            </div>

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
                    onClick={handleSubmit}
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
                    {saving ? (
                        <>
                            <div style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                border: '2px solid #ffffff', borderTopColor: 'transparent',
                                animation: 'spin 0.7s linear infinite',
                            }} />
                            Saving...
                        </>
                    ) : (
                        <><MdArrowForward /> Save Entry</>
                    )}
                </button>
            </div>
        </div>
    </div>
);
};

/* ─── Transactions Page ──────────────────────────────────── */
const Transactions = () => {
    const { user } = useAuth();

    const [txns,       setTxns]       = useState([]);
    const [customers,  setCustomers]  = useState([]);
    const [summary,    setSummary]    = useState({
        totalCreditToday:     0,
        totalCollectionToday: 0,
        activeCustomers:      0,
        targetCollection:     0,
    });
    const [loading,    setLoading]    = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFrom,   setDateFrom]   = useState('');
    const [dateTo,     setDateTo]     = useState('');
    const [page,       setPage]       = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal,  setShowModal]  = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const LIMIT = 10;

    const load = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const params = {
                page: p, limit: LIMIT,
                ...(typeFilter !== 'all' && { type: typeFilter }),
                ...(dateFrom && { from: dateFrom }),
                ...(dateTo   && { to:   dateTo   }),
            };

            const [tRes, sRes, cRes] = await Promise.all([
                transactionAPI.getAll(params),
                analyticsAPI.getSummary(),
                customerAPI.getAll({ limit: 200 }),
            ]);

            const list = tRes.data?.transactions ?? tRes.data?.data ?? [];
            setTxns(Array.isArray(list) ? list : []);
            setTotalPages(tRes.data?.totalPages ?? 1);
            setPage(p);

            const s = sRes.data?.data || {};
            setSummary({
                totalCreditToday:     s.todayCredit      ?? 0,
                totalCollectionToday: s.todayCollection  ?? 0,
                activeCustomers:      s.totalCustomers   ?? 0,
                targetCollection:     s.targetCollection ?? 0,
            });

            const cList = cRes.data?.customers ?? cRes.data?.data ?? [];
            setCustomers(Array.isArray(cList) ? cList : []);

        } catch (e) {
            console.error('Transactions load error:', e);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, [typeFilter, dateFrom, dateTo]);

    useEffect(() => { load(1); }, [typeFilter, dateFrom, dateTo]);

    useEffect(() => {
        const socket = io('https://khataai-project.onrender.com');
        socket.on('newTransaction', (data) => {
            toast.success(`New entry: ${data.customerName}`);
            load(1);
        });
        return () => socket.disconnect();
    }, []);

    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setTypeFilter('all');
    };

    const hasActiveFilter = typeFilter !== 'all' || dateFrom || dateTo;

    return (
        <Layout>
            <Navbar
                title="Transaction "
                onSearch={() => load(1)}
                onQuickAdd={() => setShowModal(true)}
            />

            {/* ── Page Content wrapper — gives breathing room below Navbar ── */}
            <div className="responsive-page-padding" style={{ paddingBottom: '100px' }}>

                {/* ── Summary Cards ── */}
                <div className="grid-3-responsive" style={{ marginBottom: '20px' }}>

                    {/* Credit Card */}
                    <div style={{
                        background: '#0d1c2d',
                        border: '1px solid #1e3448',
                        borderRadius: '12px',
                        padding: '20px',
                        minHeight: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                    }}>
                        <span style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'rgba(251,146,60,0.15)', color: '#fb923c',
                            fontSize: '10px', fontWeight: 700,
                            padding: '3px 10px', borderRadius: '20px',
                        }}>Today</span>
                        <div>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'rgba(251,146,60,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '12px',
                            }}>
                                <MdTrendingUp style={{ color: '#fb923c', fontSize: '18px' }} />
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Total Credit Given</p>
                            <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                                {fmt(summary.totalCreditToday)}
                            </p>
                        </div>
                        <p style={{ color: '#10b981', fontSize: '12px', marginTop: '8px' }}>↑ 12% vs yesterday</p>
                    </div>

                    {/* Collection Card */}
                    <div style={{
                        background: '#0d1c2d',
                        border: '1px solid #1e3448',
                        borderRadius: '12px',
                        padding: '20px',
                        minHeight: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                    }}>
                        <span style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'rgba(16,185,129,0.15)', color: '#10b981',
                            fontSize: '10px', fontWeight: 700,
                            padding: '3px 10px', borderRadius: '20px',
                        }}>Today</span>
                        <div>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'rgba(16,185,129,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '12px',
                            }}>
                                <MdAccountBalanceWallet style={{ color: '#10b981', fontSize: '18px' }} />
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Total Collected</p>
                            <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                                {fmt(summary.totalCollectionToday)}
                            </p>
                        </div>
                        <p style={{ color: '#10b981', fontSize: '12px', marginTop: '8px' }}>↑ 8.4% vs yesterday</p>
                    </div>

                    {/* Customers / Target Card */}
                    <div style={{
                        background: '#0d1c2d',
                        border: '1px solid #1e3448',
                        borderRadius: '12px',
                        padding: '20px',
                        minHeight: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Active Customers</p>
                                <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>
                                    {loading ? '—' : summary.activeCustomers}
                                </p>
                            </div>
                            <div style={{ height: '3px', background: '#1e3448', borderRadius: '99px', marginBottom: '16px' }}>
                                <div style={{ height: '3px', width: '62%', background: '#10b981', borderRadius: '99px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Target Collection</p>
                                <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>
                                    {summary.targetCollection ? fmt(summary.targetCollection) : '₹50,000'}
                                </p>
                            </div>
                        </div>
                        <button style={{
                            width: '100%', marginTop: '12px', padding: '8px',
                            borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                            background: '#1e3448', color: '#94a3b8',
                            border: '1px solid #243a50', cursor: 'pointer',
                        }}>
                            View Detailed Insights
                        </button>
                    </div>
                </div>

                {/* ── Table Card ── */}
                <div style={{
                    background: '#0d1c2d',
                    border: '1px solid #1e3448',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}>
                    {/* Controls row */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderBottom: '1px solid #1e3448',
                        flexWrap: 'wrap', gap: '10px',
                    }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {TYPE_FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setTypeFilter(f.key)}
                                    style={{
                                        background: typeFilter === f.key ? '#10b981' : '#1e3448',
                                        color:      typeFilter === f.key ? '#ffffff'  : '#94a3b8',
                                        border: 'none', cursor: 'pointer',
                                        fontSize: '12px', fontWeight: 600,
                                        padding: '6px 16px', borderRadius: '8px',
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setShowFilter(s => !s)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '12px', padding: '6px 12px', borderRadius: '8px',
                                    background: showFilter ? 'rgba(16,185,129,0.1)' : '#1e3448',
                                    color:      showFilter ? '#10b981' : '#94a3b8',
                                    border: `1px solid ${showFilter ? 'rgba(16,185,129,0.3)' : '#1e3448'}`,
                                    cursor: 'pointer',
                                }}
                            >
                                <MdCalendarToday style={{ fontSize: '12px' }} />
                                {dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : 'Oct 12 – Oct 19'}
                            </button>

                            {hasActiveFilter && (
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        fontSize: '12px', padding: '6px 12px', borderRadius: '8px',
                                        background: 'rgba(248,113,113,0.1)', color: '#f87171',
                                        border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer',
                                    }}
                                >
                                    <MdClose style={{ fontSize: '11px' }} /> Clear
                                </button>
                            )}

                            <button style={{
                                width: '28px', height: '28px', borderRadius: '8px',
                                background: '#1e3448', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <MdFilterList style={{ color: '#94a3b8', fontSize: '16px' }} />
                            </button>

                            <button style={{
                                width: '28px', height: '28px', borderRadius: '8px',
                                background: '#1e3448', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <MdDownload style={{ color: '#94a3b8', fontSize: '16px' }} />
                            </button>
                        </div>
                    </div>

                    {/* Date range inputs */}
                    {showFilter && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 16px', borderBottom: '1px solid #1e3448',
                            background: '#08121e', flexWrap: 'wrap',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ color: '#94a3b8', fontSize: '12px' }}>From</label>
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                    style={{ background: '#051424', border: '1px solid #1e3448', color: '#ffffff',
                                        fontSize: '12px', padding: '6px 12px', borderRadius: '8px', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ color: '#94a3b8', fontSize: '12px' }}>To</label>
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                    style={{ background: '#051424', border: '1px solid #1e3448', color: '#ffffff',
                                        fontSize: '12px', padding: '6px 12px', borderRadius: '8px', outline: 'none' }} />
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
                            <div style={{
                                width: '13px', height: '13px', borderRadius: '50%',
                                border: '2px solid #10b981', borderTopColor: 'transparent',
                                animation: 'spin 0.7s linear infinite',
                            }} />
                            <span style={{ color: '#4b6a7a', fontSize: '11px' }}>Fetching transactions...</span>
                        </div>
                    )}

                    <TransactionTable transactions={txns} />

                    {/* Footer */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 16px', borderTop: '1px solid #1e3448',
                        flexWrap: 'wrap', gap: '8px',
                    }}>
                        <span style={{ color: '#4b6a7a', fontSize: '12px' }}>
                            Showing {txns.length} of {totalPages * LIMIT} transactions
                            {hasActiveFilter ? ' (filtered)' : ''}
                        </span>
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => load(page - 1)} disabled={page === 1}
                                    style={{
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        background: '#1e3448', border: 'none',
                                        color: page === 1 ? '#2a4a60' : '#94a3b8',
                                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                    }}>←</button>
                                <button onClick={() => load(page + 1)} disabled={page === totalPages}
                                    style={{
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        background: '#1e3448', border: 'none',
                                        color: page === totalPages ? '#2a4a60' : '#94a3b8',
                                        cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                    }}>→</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>{/* end page content wrapper */}

            {/* ── Voice Entry FAB ── */}
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 40 }}>
    <span style={{
        position: 'absolute', inset: '-4px', borderRadius: '50%',
        background: 'rgba(16,185,129,0.35)',
        animation: 'sidebarPulse 2s ease-out infinite',
        pointerEvents: 'none',
    }} />
    <span style={{
        position: 'absolute', inset: '-10px', borderRadius: '50%',
        background: 'rgba(16,185,129,0.15)',
        animation: 'sidebarPulse 2s ease-out infinite 0.6s',
        pointerEvents: 'none',
    }} />
    <button
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ position: 'relative', background: '#10b981', border: 'none', cursor: 'pointer' }}
        onClick={() => toast('Voice entry coming soon!')}
    >
        <MdMic style={{ color: '#ffffff', fontSize: '24px' }} />
    </button>
</div>

            {/* ── Add Modal ── */}
            {showModal && (
                <AddModal
                    customers={customers}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); load(1); }}
                />
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
                select option { background: #0d1c2d; color: #ffffff; }
            `}</style>
        </Layout>
    );
};

export default Transactions;