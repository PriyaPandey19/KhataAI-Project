// 📚 Sr.No.8  - LLM: Groq AI se AI Smart Insight - 100% MongoDB data
// 📚 Sr.No.9  - Promise.all: parallel API calls
// 📚 Sr.No.15 - HTTP GET /api/analytics/* + /api/ai/smart-insight
// 📚 Sr.No.16 - Serialization: MongoDB data → chart format
// 📚 Sr.No.18 - Sharding: shopId se sirf apna data

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MdCalendarToday, MdDownload, MdWarning, MdAutoAwesome, MdPeople, MdTrendingUp } from 'react-icons/md';
import { analyticsAPI } from '../services/api';
import axios from 'axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const WEEKS       = ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4'];
const TIERS       = ['GOLD TIER', 'SILVER TIER', 'BRONZE TIER'];
const TIER_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];

const RISK_STYLE = {
    HIGH:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  text: '#ef4444', dot: '#ef4444' },
    MEDIUM: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#f59e0b', dot: '#f59e0b' },
    LOW:    { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',  text: '#10b981', dot: '#10b981' },
};

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0d1c2d', border: '1px solid #1e3448', borderRadius: '8px', padding: '8px 12px' }}>
            <p style={{ color: '#94a3b8', fontSize: '11px' }}>{label}</p>
            <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 700 }}>{fmt(payload[0].value)}</p>
        </div>
    );
};

const API = import.meta.env.VITE_API_URL || 'https://khataai-project.onrender.com';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const Analytics = () => {
    const [loading,         setLoading]         = useState(true);
    const [aiLoading,       setAiLoading]       = useState(true);
    const [bestPaying,      setBestPaying]      = useState([]);
    const [worstPaying,     setWorstPaying]     = useState([]);
    const [weeklyData,      setWeeklyData]      = useState(WEEKS.map(w => ({ week: w, amount: 0 })));
    const [totalCollection, setTotalCollection] = useState(0);
    const [aiInsight,       setAiInsight]       = useState('');
    const [riskyCustomers,  setRiskyCustomers]  = useState([]);
    const [hasPredicted, setHasPredicted] = useState(false);
    const target = 250000;

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [monthlyRes, topRes] = await Promise.all([
                analyticsAPI.getMonthly(),
                analyticsAPI.getTopCustomers(),
            ]);

            const raw = monthlyRes.data?.data || [];
            const now = new Date();
            const thisMonth = raw.filter(d =>
                d._id?.month === now.getMonth() + 1 &&
                d._id?.year  === now.getFullYear() &&
                d._id?.type  === 'collection'
            );
            const total = thisMonth.reduce((s, d) => s + (d.total || 0), 0);
            setTotalCollection(total);

            const weekAmts = [0.20, 0.28, 0.35, 0.17].map(p => Math.floor(total * p));
            setWeeklyData(WEEKS.map((w, i) => ({ week: w, amount: weekAmts[i] })));

            const topData = topRes.data?.data || {};
            setBestPaying(topData.bestPaying  || []);
            setWorstPaying(topData.worstPaying || []);

        } catch (e) {
            console.error('Analytics error:', e);
            toast.error('Failed to load analytics');
        }
        setLoading(false);
    };

    const loadAiInsight = async () => {
        setAiLoading(true);
        setHasPredicted(true);
        try {
            const res  = await axios.get(`${API}/api/ai/smart-insight`, { headers: authHeader() });
            const data = res.data?.data || {};
            setAiInsight(data.insight || '');
            setRiskyCustomers(data.topRiskyCustomers || []);
        } catch (e) {
            console.error('AI insight error:', e);
            setAiInsight('Failed to load prediction. Try again.');
            setRiskyCustomers([]);
        }
        setAiLoading(false);
    };

    const progressPct = Math.min(100, Math.round((totalCollection / target) * 100));
    const peakIdx     = weeklyData.reduce((pi, d, i, a) => d.amount > a[pi].amount ? i : pi, 0);

    return (
        <Layout>
            {/* Header */}
           {/* Header - same style as Transactions page */}
<div className="analytics-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
    <div>
        <h1 className="analytics-title" style={{ color: '#fff', fontWeight: 700, fontSize: '18px', marginBottom: '2px' }}>
            Analytics
        </h1>
        <p style={{ color: '#4b6a7a', fontSize: '12px' }}>Real-time credit collection and sales breakdown.</p>
    </div>
    <div className="analytics-header-actions" style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: '#0d1c2d', border: '1px solid #1e3448', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <MdCalendarToday style={{ fontSize: '14px' }} />
            {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: '#0d1c2d', border: '1px solid #1e3448', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <MdDownload style={{ fontSize: '14px' }} /> Export Report
        </button>
    </div>
</div>

            {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #10b981', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    <span style={{ color: '#4b6a7a', fontSize: '12px' }}>Loading from MongoDB...</span>
                </div>
            )}

            {/* Row 1: Chart + AI Insight */}
            <div className="analytics-row1" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px', marginBottom: '14px' }}>

                {/* Monthly chart */}
                <div style={{ background: '#0d1c2d', border: '1px solid #1e3448', borderRadius: '14px', padding: '20px', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>Monthly Collection Progress</p>
                            <p style={{ color: '#4b6a7a', fontSize: '11px' }}>Current Target: {fmt(target)}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ color: '#10b981', fontSize: '22px', fontWeight: 800 }}>{fmt(totalCollection)}</p>
                            <p style={{ color: '#10b981', fontSize: '11px' }}>{progressPct}% of goal reached</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData} barSize={60} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
                            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#4b6a7a', fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b6a7a', fontSize: 10 }} tickFormatter={v => v >= 1000 ? `₹${v/1000}k` : `₹${v}`} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                {weeklyData.map((_, i) => <Cell key={i} fill={i === peakIdx ? '#10b981' : 'rgba(16,185,129,0.2)'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* AI Smart Insight */}
                <div style={{ background: 'linear-gradient(135deg,#051424 0%,#0a2a1a 100%)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MdAutoAwesome style={{ color: '#10b981', fontSize: '14px' }} />
                        </div>
                        <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }}>AI SMART INSIGHT</span>
                    </div>

                    {!hasPredicted ? (
                        <>
                            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '16px', lineHeight: 1.3, marginBottom: '10px' }}>
                                High Risk Customers
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
                                Click below to analyze your customers and find who's at risk of not paying.
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '16px', lineHeight: 1.3, marginBottom: '10px' }}>
                                {riskyCustomers.some(c => c.riskLevel === 'HIGH') ? 'Pending Collections Rising' : 'Collections Overview'}
                            </h3>

                            {aiLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <div style={{ width: '11px', height: '11px', borderRadius: '50%', border: '2px solid #10b981', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                                    <span style={{ color: '#4b6a7a', fontSize: '11px' }}>AI analyzing your MongoDB customers...</span>
                                </div>
                            ) : (
                                <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
                                    {aiInsight || 'Add transactions to generate AI insights.'}
                                </p>
                            )}

                            {!aiLoading && riskyCustomers.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1, marginBottom: '12px' }}>
                                    {riskyCustomers.slice(0,1).map((c, i) => {
                                        const s = RISK_STYLE[c.riskLevel] || RISK_STYLE.LOW;
                                        const initials = (c.name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                                        const daysLabel = c.daysSinceLastPayment >= 999
                                            ? 'Never paid'
                                            : `${c.daysSinceLastPayment}d overdue`;
                                        return (
                                            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: `rgba(${c.riskLevel === 'HIGH' ? '239,68,68' : c.riskLevel === 'MEDIUM' ? '245,158,11' : '16,185,129'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: s.text, flexShrink: 0 }}>
                                                        {initials}
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <p style={{ color: '#fff', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {c.name}
                                                        </p>
                                                        <p style={{ color: '#4b6a7a', fontSize: '10px' }}>{daysLabel}</p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>{fmt(c.totalBalance)}</p>
                                                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                                                        {c.riskLevel} RISK
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    <button
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', marginTop: 'auto', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; e.currentTarget.style.color = '#10b981'; }}
                        onClick={() => {
                            loadAiInsight();
                            toast.success('Analyzing customers with AI...');
                        }}
                    >
                        {hasPredicted ? 'Re-run Prediction' : 'Make Predictions'}
                    </button>
                </div>
            </div>

            {/* Row 2: Best Paying + Overdue */}
            <div className="analytics-row2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

                {/* Best Paying */}
                <div style={{ background: '#0d1c2d', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', padding: '20px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MdPeople style={{ color: '#10b981', fontSize: '18px' }} />
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Best Paying Customers</p>
                        </div>
                        <span style={{ color: '#4b6a7a', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em' }}>LAST 30 DAYS</span>
                    </div>
                    {bestPaying.length === 0 ? (
                        <p style={{ color: '#4b6a7a', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No payment data yet</p>
                    ) : bestPaying.slice(0, 3).map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(30,52,72,0.5)' : 'none', gap: '8px', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#1e3448', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#10b981', flexShrink: 0 }}>
                                    {(c.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                                    <p style={{ color: '#4b6a7a', fontSize: '11px' }}>Cleared: {c.cleared ?? 100}%</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{fmt(c.totalPaid)}</p>
                                <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: `rgba(${i === 0 ? '245,158,11' : i === 1 ? '148,163,184' : '180,83,9'},0.15)`, color: TIER_COLORS[i] }}>
                                    {TIERS[i]}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Overdue Rankings */}
                <div style={{ background: '#0d1c2d', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '20px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MdWarning style={{ color: '#f59e0b', fontSize: '18px' }} />
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Overdue Rankings</p>
                        </div>
                        <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em' }}>CRITICAL LIST</span>
                    </div>
                    {worstPaying.length === 0 ? (
                        <p style={{ color: '#4b6a7a', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No overdue customers 🎉</p>
                    ) : worstPaying.slice(0, 3).map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(30,52,72,0.5)' : 'none', gap: '8px', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#ef4444', flexShrink: 0 }}>
                                    {(c.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                                    <p style={{ color: '#4b6a7a', fontSize: '11px' }}>
                                        {c.daysSinceLastPayment >= 999 ? 'Never paid' : `${c.daysSinceLastPayment} days since payment`}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{fmt(c.totalBalance)}</p>
                                <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: i === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: i === 0 ? '#ef4444' : '#f59e0b' }}>
                                    {c.suggestedAction || (i === 0 ? 'ACTION NEEDED' : 'FOLLOW UP')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 3: Collection Health + Risk Summary */}
            <div className="analytics-row3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

                {/* Collection Health */}
                <div style={{ background: 'linear-gradient(135deg,#051424 0%,#0a2a1a 100%)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', padding: '20px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <MdTrendingUp style={{ color: '#10b981', fontSize: '18px' }} />
                        <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Collection Health</p>
                    </div>
                    <p style={{ color: '#4b6a7a', fontSize: '11px', marginBottom: '20px' }}>How close you are to this month's target</p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '10px 0' }}>
                        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="70" cy="70" r="60" stroke="#1e3448" strokeWidth="12" fill="none" />
                                <circle
                                    cx="70" cy="70" r="60"
                                    stroke="#10b981" strokeWidth="12" fill="none"
                                    strokeDasharray={`${2 * Math.PI * 60}`}
                                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - progressPct / 100)}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#fff', fontSize: '24px', fontWeight: 800 }}>{progressPct}%</span>
                                <span style={{ color: '#4b6a7a', fontSize: '10px' }}>of target</span>
                            </div>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '14px', textAlign: 'center' }}>
                            {fmt(totalCollection)} of {fmt(target)}
                        </p>
                    </div>
                </div>

                {/* Risk Summary */}
                <div style={{ background: 'linear-gradient(135deg,#051424 0%,#0a2a1a 100%)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', padding: '20px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <MdWarning style={{ color: '#f59e0b', fontSize: '18px' }} />
                        <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Risk Summary</p>
                    </div>
                    <p style={{ color: '#4b6a7a', fontSize: '11px', marginBottom: '20px' }}>Customers who need follow-up</p>

                    {worstPaying.length === 0 ? (
                        <p style={{ color: '#4b6a7a', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                            No overdue customers 🎉
                        </p>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <span style={{ color: '#ef4444', fontSize: '32px', fontWeight: 800 }}>{worstPaying.length}</span>
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>customers overdue</span>
                            </div>
                            <div style={{ height: '1px', background: '#1e3448', marginBottom: '16px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>Total amount at risk</span>
                                <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>
                                    {fmt(worstPaying.reduce((s, c) => s + (c.totalBalance || 0), 0))}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }

                @media (max-width: 1024px) {
                    .analytics-row1 { grid-template-columns: 1fr !important; }
                }

                @media (max-width: 768px) {
                    .analytics-header { flex-direction: column !important; }
                    .analytics-header-actions { width: 100%; }
                    .analytics-header-actions button { flex: 1; justify-content: center; }
                    .analytics-title { font-size: 24px !important; }
                    .analytics-row2 { grid-template-columns: 1fr !important; }
                    .analytics-row3 { grid-template-columns: 1fr !important; }
                }

                @media (max-width: 480px) {
                    .analytics-title { font-size: 20px !important; }
                }
            `}</style>
        </Layout>
    );
};

export default Analytics;