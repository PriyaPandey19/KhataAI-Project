// KhataAI — Customers Page
// 📚 Sr.No.5  - JWT Auth
// 📚 Sr.No.9  - Promise.all
// 📚 Sr.No.15 - HTTP GET/DELETE /api/customers
// 📚 Sr.No.18 - Sharding: shopId filter

import { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import CustomerCards from '../components/CustomerCards';
import { MdPersonAdd, MdCheckCircle, MdError } from 'react-icons/md';

// ── Validation rules ──
const validate = (form) => {
    const errors = {};
    const name = form.name.trim();
    const phone = form.phone.trim();
    const balance = form.initialBalance;

    if (!name) {
        errors.name = 'Name is required';
    } else if (name.length < 2) {
        errors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        errors.name = 'Name can only contain letters';
    }

    if (!phone) {
        errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
        errors.phone = 'Enter valid 10-digit phone number';
    }

    if (balance && (isNaN(balance) || Number(balance) < 0)) {
        errors.initialBalance = 'Balance must be a positive number';
    }

    return errors;
};

// Add Customer Modal
const AddModal = ({ onClose, onAdd }) => {
    const [form,    setForm]    = useState({ name: '', phone: '', initialBalance: '' });
    const [errors,  setErrors]  = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);

    const setField = (key, val) => {
        setForm(p => ({ ...p, [key]: val }));
        // clear error on change
        if (touched[key]) {
            const newErrors = validate({ ...form, [key]: val });
            setErrors(p => ({ ...p, [key]: newErrors[key] }));
        }
    };

    const handleBlur = (key) => {
        setTouched(p => ({ ...p, [key]: true }));
        const newErrors = validate(form);
        setErrors(p => ({ ...p, [key]: newErrors[key] }));
    };

    const submit = async () => {
        // touch all fields
        setTouched({ name: true, phone: true, initialBalance: true });
        const newErrors = validate(form);
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setLoading(true);
        try {
            const payload = {
                name:  form.name.trim(),
                phone: form.phone.trim(),
                ...(form.initialBalance ? { totalBalance: Number(form.initialBalance) } : {})
            };
            const res = await customerAPI.add(payload);
            toast.success('Customer added!');
            onAdd(res.data.customer);
            onClose();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to add');
        }
        setLoading(false);
    };

    const fields = [
        { key: 'name',           label: 'Full Name',           placeholder: 'e.g. Rajesh Kumar',     type: 'text'   },
        { key: 'phone',          label: 'Phone Number',        placeholder: 'e.g. 6266034111',       type: 'tel'    },
        { key: 'initialBalance', label: 'Opening Balance (₹)', placeholder: 'e.g. 5000 (optional)',  type: 'number' },
    ];

    const isValid = Object.keys(validate(form)).length === 0 && form.name && form.phone;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ background: '#0d1c2d', border: '1px solid #1e3448', borderRadius: '16px', width: '400px', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '24px 28px 20px 28px' }}>
                    <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', margin: 0 }}>Add New Customer</h2>
                    <p style={{ color: '#4b6a7a', fontSize: '12px', marginTop: '4px' }}>All fields marked with * are required</p>
                </div>

                {/* Body */}
                <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {fields.map(f => {
                        const hasError   = touched[f.key] && errors[f.key];
                        const hasSuccess = touched[f.key] && !errors[f.key] && form[f.key];
                        return (
                            <div key={f.key}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '8px' }}>
                                    {f.label} {f.key !== 'initialBalance' && <span style={{ color: '#ef4444' }}>*</span>}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        value={form[f.key]}
                                        onChange={e => setField(f.key, e.target.value)}
                                        onBlur={() => handleBlur(f.key)}
                                        placeholder={f.placeholder}
                                        type={f.type}
                                        maxLength={f.key === 'phone' ? 10 : undefined}
                                        style={{
                                            width: '100%', borderRadius: '8px',
                                            padding: '10px 36px 10px 14px',
                                            fontSize: '13px', color: '#fff',
                                            background: '#051424', outline: 'none',
                                            caretColor: '#10b981', boxSizing: 'border-box',
                                            border: `1px solid ${hasError ? '#ef4444' : hasSuccess ? '#10b981' : '#1e3448'}`,
                                            transition: 'border-color 0.15s',
                                        }}
                                    />
                                    {/* validation icon */}
                                    {hasError && (
                                        <MdError style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', fontSize: '16px' }} />
                                    )}
                                    {hasSuccess && (
                                        <MdCheckCircle style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontSize: '16px' }} />
                                    )}
                                </div>
                                {/* error message */}
                                {hasError && (
                                    <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {errors[f.key]}
                                    </p>
                                )}
                                {/* phone hint */}
                                {f.key === 'phone' && !hasError && (
                                    <p style={{ color: '#4b6a7a', fontSize: '11px', marginTop: '4px' }}>
                                        10 digits only, no +91 needed
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', gap: '12px', padding: '24px 28px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', background: 'transparent', border: '1px solid #1e3448', color: '#94a3b8', cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px',
                            fontWeight: 700, color: '#fff', border: 'none', cursor: loading ? 'default' : 'pointer',
                            background: isValid ? '#10b981' : '#1e3448',
                            opacity: loading ? 0.7 : 1,
                            transition: 'background 0.2s',
                        }}
                    >
                        {loading ? 'Adding...' : 'Add Customer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Customers = () => {
    const [customers,  setCustomers]  = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [search,     setSearch]     = useState('');
    const [riskFilter, setRiskFilter] = useState('all');
    const [total,      setTotal]      = useState(0);
    const [showModal,  setShowModal]  = useState(false);

    useEffect(() => {
        const t = setTimeout(() => fetchCustomers(), 300);
        return () => clearTimeout(t);
    }, [search, riskFilter]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = { limit: 20 };
            if (search)               params.search = search;
            if (riskFilter !== 'all') params.risk   = riskFilter;
            const res = await customerAPI.getAll(params);
            setCustomers(res.data.customers || []);
            setTotal(res.data.pagination?.total || 0);
        } catch (e) {
            console.error('Customers error:', e);
            toast.error('Failed to load customers');
        }
        setLoading(false);
    };

    const handleAdd    = (c)  => { setCustomers(p => [c, ...p]); setTotal(p => p + 1); };
    const handleDelete = async (id) => {
        try {
            await customerAPI.delete(id);
            setCustomers(p => p.filter(c => c._id !== id));
            setTotal(p => p - 1);
            toast.success('Customer deleted');
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to delete');
        }
    };

    const FILTERS = [
        { key: 'all',    label: 'All',       color: '#10b981' },
        { key: 'high',   label: 'High Risk', color: '#ef4444' },
        { key: 'medium', label: 'Moderate',  color: '#f59e0b' },
        { key: 'low',    label: 'Healthy',   color: '#10b981' },
    ];

    return (
        <Layout>
            <Navbar title="Customers" onSearch={setSearch} onQuickAdd={() => setShowModal(true)} />

            {/* Filter bar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3" style={{ paddingLeft: '4px' }}>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Filter by Risk:</span>
                    {FILTERS.map(f => (
                        <button key={f.key} onClick={() => setRiskFilter(f.key)} className="rounded-full font-semibold transition-all" style={{
                            background: riskFilter === f.key ? f.color : 'transparent',
                            border: `1px solid ${riskFilter === f.key ? f.color : '#1e3448'}`,
                            color: riskFilter === f.key ? '#fff' : '#94a3b8',
                            padding: '6px 16px', fontSize: '13px', cursor: 'pointer',
                        }}>
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: '#94a3b8' }}>
                        Showing <strong className="text-white">{total}</strong> active customers
                    </span>
                    <button onClick={() => setShowModal(true)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#10b981', border: 'none', borderRadius: '8px',
                        color: '#fff', fontSize: '13px', fontWeight: 600,
                        padding: '8px 16px', cursor: 'pointer', flexShrink: 0
                    }}>Add Customers</button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center gap-2 mb-4">
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #10b981', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    <span className="text-xs" style={{ color: '#4b6a7a' }}>Loading from MongoDB...</span>
                </div>
            )}

            {!loading && customers.length === 0 && (
                <div className="text-center py-20">
                    <MdPersonAdd style={{ fontSize: '48px', color: '#1e3448', margin: '0 auto 16px' }} />
                    <p style={{ color: '#94a3b8' }}>No customers yet. Add your first customer!</p>
                    <button onClick={() => setShowModal(true)} className="mt-4 px-6 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#10b981' }}>
                        + Add Customer
                    </button>
                </div>
            )}

            {customers.length > 0 && <CustomerCards customers={customers} onDelete={handleDelete} />}

            {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </Layout>
    );
};

export default Customers;