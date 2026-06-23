// 📚 Sr.No.15 - HTTP: search request
// 📚 Sr.No.5  - JWT: user info token se aata hai

import { useState } from 'react';
import { MdSearch, MdAdd } from "react-icons/md";
import useAuth from '../hooks/useAuth';
import { useNavigate } from "react-router-dom";

const Navbar = ({ title, onSearch, onQuickAdd }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showSearch, setShowSearch] = useState(false);

    const handleSearch = (val) => {
        onSearch?.(val);
        navigate(`/customers?search=${val}`);
    };

    return (
        <>
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '24px',
                gap: '10px',
            }}>
                {/* Title */}
                <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {title || user?.shopName}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                    {/* Search — hidden on mobile, visible on desktop */}
                    <div className="navbar-search" style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#0d1c2d', border: '1px solid #1e3448',
                        borderRadius: '8px', padding: '8px 14px', width: '220px'
                    }}>
                        <MdSearch style={{ color: '#94a3b8', fontSize: '16px', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search customer..."
                            onChange={e => handleSearch(e.target.value)}
                            style={{
                                background: 'transparent', border: 'none',
                                color: '#fff', fontSize: '13px', width: '100%',
                                outline: 'none', caretColor: '#10b981'
                            }}
                        />
                    </div>

                    {/* Search icon — only on mobile */}
                    <button
                        className="navbar-search-icon"
                        onClick={() => setShowSearch(s => !s)}
                        style={{
                            display: 'none',
                            width: '36px', height: '36px', borderRadius: '8px',
                            background: '#0d1c2d', border: '1px solid #1e3448',
                            alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#94a3b8', flexShrink: 0,
                        }}
                    >
                        <MdSearch style={{ fontSize: '18px' }} />
                    </button>

                    {/* Quick Add */}
                    <button
                        onClick={onQuickAdd}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#ffffff', border: 'none', borderRadius: '8px',
                            color: '#051424', fontSize: '13px', fontWeight: 700,
                            padding: '8px 16px', cursor: 'pointer', flexShrink: 0,
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#34d399'}
                        onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                        <MdAdd style={{ fontSize: '18px' }} />
                        <span className="navbar-quickadd-text">Quick Add</span>
                    </button>
                </div>
            </div>

            {/* Mobile search bar — expands below navbar when icon clicked */}
            {showSearch && (
                <div className="navbar-mobile-search" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#0d1c2d', border: '1px solid #1e3448',
                    borderRadius: '8px', padding: '8px 14px',
                    marginBottom: '16px', marginTop: '-16px',
                }}>
                    <MdSearch style={{ color: '#94a3b8', fontSize: '16px', flexShrink: 0 }} />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search customer..."
                        onChange={e => handleSearch(e.target.value)}
                        style={{
                            background: 'transparent', border: 'none',
                            color: '#fff', fontSize: '13px', width: '100%',
                            outline: 'none', caretColor: '#10b981'
                        }}
                    />
                </div>
            )}

            <style>{`
                @media (max-width: 640px) {
                    .navbar-search       { display: none !important; }
                    .navbar-search-icon  { display: flex !important; }
                    .navbar-quickadd-text { display: none; }
                }
            `}</style>
        </>
    );
};

export default Navbar;