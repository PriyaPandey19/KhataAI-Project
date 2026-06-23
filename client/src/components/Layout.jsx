// 📚 Sr.No.17 - SOLID Principle: layout alag component mein

import { useState, useEffect } from 'react';
import { MdMenu, MdClose } from 'react-icons/md';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#030d17',
            fontFamily: "'Sora', sans-serif"
        }}>
            {/* Mobile top bar with hamburger */}
            {isMobile && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    height: '56px', background: '#051424',
                    borderBottom: '1px solid #1e3448',
                    display: 'flex', alignItems: 'center', padding: '0 16px',
                    zIndex: 60,
                }}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            background: '#1e3448', border: 'none', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <MdMenu style={{ fontSize: '20px' }} />
                    </button>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginLeft: '12px' }}>
                        KhataAI
                    </span>
                </div>
            )}

            {/* Sidebar — fixed on desktop, drawer overlay on mobile */}
            {isMobile ? (
                <>
                    {sidebarOpen && (
                        <div
                            onClick={() => setSidebarOpen(false)}
                            style={{
                                position: 'fixed', inset: 0,
                                background: 'rgba(0,0,0,0.6)',
                                zIndex: 40,
                            }}
                        />
                    )}
                    <div style={{
                        position: 'fixed', top: 0, left: 0,
                        width: '208px',
                        height: '100vh', zIndex: 50,
                        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                        transition: 'transform 0.25s ease',
                    }}>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            style={{
                                position: 'absolute', top: '16px', right: '-44px',
                                width: '36px', height: '36px', borderRadius: '8px',
                                background: '#1e3448', border: 'none', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <MdClose style={{ fontSize: '20px' }} />
                        </button>
                        <Sidebar onNavigate={() => setSidebarOpen(false)} />
                    </div>
                </>
            ) : (
                <div style={{
                    width: '210px',
                    flexShrink: 0,
                    position: 'fixed',
                    top: 0, left: 0,
                    height: '100vh',
                    zIndex: 10
                }}>
                    <Sidebar />
                </div>
            )}

            {/* main content */}
            <main style={{
                marginLeft: isMobile ? 0 : '210px',
                marginTop: isMobile ? '56px' : 0,
                flex: 1,
                padding: isMobile ? '16px' : '24px 28px',
                minHeight: '100vh',
                background: '#030d17',
                overflowX: 'hidden',
                width: '100%',
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;