// KhataAI — Dashboard
// 📚 Sr.No.1  - WebSocket: socket.io se live updates
// 📚 Sr.No.5  - JWT Auth: useAuth se user milta hai
// 📚 Sr.No.9  - API Performance: Promise.all parallel queries
// 📚 Sr.No.15 - HTTP: axios se REST API calls
// 📚 Sr.No.16 - Serialization: JSON parse/stringify
// 📚 Sr.No.18 - Sharding: shopId se sirf apna data

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MdWarning, MdArrowForward, MdFilterList, MdTrendingUp, MdCheckCircle, MdAccessTime } from 'react-icons/md';
import { analyticsAPI, transactionAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import SummaryWidget from '../components/SummaryWidget';
import TransactionTable from '../components/TransactionTable';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0d1c2d', border: '1px solid #1e3448', borderRadius: '8px', padding: '8px 12px' }}>
            <p style={{ color: '#94a3b8', fontSize: '11px' }}>{label}</p>
            <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 700 }}>{fmt(payload[0].value)}</p>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading]   = useState(true);
    const [summary, setSummary]   = useState({ totalOutstanding: 0, todayCollection: 0, todayCredit: 0 });
    const [weekly, setWeekly]     = useState(DAYS.map(d => ({ day: d, credit: 0 })));
    const [risks, setRisks]       = useState([]);
    const [txns, setTxns]         = useState([]);

    useEffect(() => {
        load();
        const socket = io('http://localhost:5000');
        socket.on('newTransaction', (data) => {
            toast.success(`New: ${data.customerName}`);
            load();
        });
        return () => socket.disconnect();
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [sRes, wRes, tRes] = await Promise.all([
                analyticsAPI.getSummary(),
                analyticsAPI.getWeekly(),
                transactionAPI.getAll({ limit: 6 })
            ]);

            const s = sRes.data?.data || {};
            setSummary({
                totalOutstanding: s.totalOutstanding ?? 0,
                todayCollection:  s.todayCollection  ?? 0,
                todayCredit:      s.todayCredit       ?? 0,
            });

            const r = s.topRiskyCustomers ?? [];
            setRisks(r.slice(0, 3).map((c, i) => ({
                name:    c.name || 'Unknown',
                balance: c.totalBalance ?? 0,
                days:    c.daysSinceLastPayment ?? 0,
                action:  i === 0 ? 'SEND REMINDER' : i === 1 ? 'CALL CUSTOMER' : null,
                danger:  i === 0,
            })));

            const rawArr = Array.isArray(wRes.data?.data) ? wRes.data.data : [];
            const creditMap = {};
            rawArr.forEach(d => {
                if (d._id?.date) {
                    const dt  = new Date(d._id.date + 'T12:00:00');
                    const day = dt.toLocaleDateString('en-US', { weekday: 'short' });
                    creditMap[day] = (creditMap[day] || 0) + (d.total || 0);
                }
            });
            setWeekly(DAYS.map(day => ({ day, credit: creditMap[day] || 0 })));

            const list = tRes.data?.transactions ?? [];
            setTxns(Array.isArray(list) ? list : []);

        } catch (e) {
            console.error('Dashboard error:', e);
        } finally {
            setLoading(false);
        }
    };

    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const peak = DAYS.indexOf(todayName);

    return (
        <Layout>
            <Navbar title={user?.shopName} onQuickAdd={() => navigate('/transactions')} />

            {loading && (
                <div className="flex items-center gap-2 mb-4">
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #10b981', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    <span style={{ color: '#4b6a7a', fontSize: '12px' }}>Loading from MongoDB...</span>
                </div>
            )}

            {/* Row 1 — 3 equal summary cards */}
            <div className="grid-3-responsive" style={{ marginBottom: '20px' }}>
                <SummaryWidget
                    label="Total Outstanding"
                    value={fmt(summary.totalOutstanding)}
                    sub="↗ 12% increase from last month"
                    subColor="#10b981"
                    icon={<MdTrendingUp style={{ color: '#10b981' }} />}
                />
                <SummaryWidget
                    label="Today's Collections"
                    value={fmt(summary.todayCollection)}
                    sub={`${txns.length} transactions completed`}
                    subColor="#10b981"
                    icon={<MdCheckCircle style={{ color: '#10b981' }} />}
                />
                <SummaryWidget
                    label="New Credit Today"
                    value={fmt(summary.todayCredit)}
                    sub="Last entry 14 mins ago"
                    subColor="#94a3b8"
                    icon={<MdAccessTime style={{ color: '#94a3b8' }} />}
                />
            </div>

            {/* Row 2 — Chart (2fr) + Risk panel (1fr) */}
            <div className="grid-chart-risk" style={{ marginBottom: '20px', alignItems: 'stretch' }}>

                {/* CHART CARD */}
                <div className="rounded-xl p-5 scroll-hidden" style={{ background: '#0d1c2d', border: '1px solid #1e3448' }}>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'nowrap',
                        gap: '12px',
                        marginBottom: '16px',
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="text-white font-semibold text-base" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                                Weekly Credit Trend
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                                Daily credit volume for the current week
                            </p>
                        </div>
                        <span
                            className="text-xs px-3 py-1 rounded-lg"
                            style={{
                                background: '#1e3448',
                                color: '#94a3b8',
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Current Week
                        </span>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weekly} barSize={36} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#4b6a7a', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b6a7a', fontSize: 10 }} tickFormatter={v => v >= 1000 ? `₹${v/1000}k` : `₹${v}`} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                            <Bar dataKey="credit" radius={[6, 6, 0, 0]}>
                                {weekly.map((_, i) => <Cell key={i} fill={i === peak ? '#10b981' : 'rgba(16,185,129,0.25)'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* RISK CARD */}
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: '#0d1c2d',
                        border: '1px solid #1e3448',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <MdWarning style={{ color: '#f59e0b', fontSize: '20px', flexShrink: 0 }} />
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', margin: 0 }}>
                            High Risk Alerts
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                        {risks.length === 0 && !loading && (
                            <p className="text-center py-4 text-xs" style={{ color: '#4b6a7a' }}>
                                No high-risk customers 🎉
                            </p>
                        )}
                        {risks.map((r, i) => (
                            <div
                                key={i}
                                style={{
                                    background: '#051424',
                                    borderLeft: `3px solid ${i === 0 ? '#f87171' : '#334155'}`,
                                    borderRadius: '0 10px 10px 0',
                                    padding: '12px 14px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <p style={{
                                        color: '#f1f5f9',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        margin: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {r.name}
                                    </p>
                                    <p style={{
                                        color: '#f1f5f9',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        margin: 0,
                                        flexShrink: 0,
                                        marginLeft: '10px',
                                    }}>
                                        {fmt(r.balance)}
                                    </p>
                                </div>

                                <p style={{
                                    color: '#f59e0b',
                                    fontSize: '11px',
                                    margin: '0 0 10px 0',
                                    fontWeight: 500,
                                }}>
                                    {r.days} days overdue
                                </p>

                                {r.action && (
                                    <button
                                        style={{
                                            width: '100%',
                                            padding: '7px 0',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            letterSpacing: '0.5px',
                                            cursor: 'pointer',
                                            background: r.danger ? 'rgba(248,113,113,0.18)' : 'transparent',
                                            color: r.danger ? '#f87171' : '#94a3b8',
                                            border: `1px solid ${r.danger ? 'rgba(248,113,113,0.45)' : '#334155'}`,
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = r.danger ? 'rgba(248,113,113,0.28)' : 'rgba(148,163,184,0.1)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = r.danger ? 'rgba(248,113,113,0.18)' : 'transparent';
                                        }}
                                        onClick={() => toast.success(`Reminder sent to ${r.name}`)}
                                    >
                                        {r.action}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        style={{
                            width: '100%',
                            marginTop: '14px',
                            fontSize: '12px',
                            fontWeight: 500,
                            padding: '8px 0',
                            color: '#10b981',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                        }}
                        onClick={() => navigate('/customers')}
                    >
                        View All Risks <MdArrowForward style={{ fontSize: '13px' }} />
                    </button>
                </div>
            </div>

            {/* Row 3 — Recent Activity full width */}
            <div className="rounded-xl p-5" style={{ background: '#0d1c2d', border: '1px solid #1e3448', overflowX: 'auto' }}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-white font-semibold">Recent Activity</p>
                </div>
                <TransactionTable transactions={txns} />
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </Layout>
    );
};

export default Dashboard;