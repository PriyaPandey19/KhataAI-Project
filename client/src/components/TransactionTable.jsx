const TypeBadge = ({ type }) => (
    <span style={{
        fontSize: '10px',
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: '6px',
        letterSpacing: '0.05em',
        background: type === 'credit' ? 'rgba(249,115,22,0.15)' : 'rgba(16,185,129,0.15)',
        color: type === 'credit' ? '#fb923c' : '#10b981'
    }}>
        {type === 'credit' ? 'CREDIT' : 'COLLECTION'}
    </span>
);

const TransactionTable = ({ transactions = [] }) => {
    const formatDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === today.toDateString())     return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-IN');
    };

    const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #1e3448' }}>
                        {['DATE', 'CUSTOMER', 'DESCRIPTION', 'TYPE', 'AMOUNT'].map((h, i) => (
                            <th key={h} style={{
                                padding: '10px 12px',
                                fontSize: '11px',
                                fontWeight: 500,
                                color: '#4b6a7a',
                                letterSpacing: '0.08em',
                                textAlign: i === 4 ? 'right' : 'left'
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#4b6a7a', fontSize: '13px' }}>
                                No transactions yet
                            </td>
                        </tr>
                    ) : transactions.map((tx) => (
                        <tr key={tx._id}
                            style={{ borderBottom: '1px solid rgba(30,52,72,0.4)', cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,28,45,0.6)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* DATE */}
                            <td style={{ padding: '14px 12px' }}>
                                <p style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>
                                    {formatDate(tx.createdAt)}
                                </p>
                                <p style={{ color: '#4b6a7a', fontSize: '11px' }}>
                                    {formatTime(tx.createdAt)}
                                </p>
                            </td>

                            {/* CUSTOMER */}
                            <td style={{ padding: '14px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '34px', height: '34px',
                                        borderRadius: '50%',
                                        background: '#1e3448',
                                        color: '#10b981',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '12px', fontWeight: 700,
                                        flexShrink: 0
                                    }}>
                                        {tx.customerId?.name?.slice(0, 2).toUpperCase() || '??'}
                                    </div>
                                    <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
                                        {tx.customerId?.name || 'Unknown'}
                                    </span>
                                </div>
                            </td>

                            {/* DESCRIPTION */}
                            <td style={{ padding: '14px 12px', color: '#94a3b8', fontSize: '13px' }}>
                                {tx.description || '-'}
                            </td>

                            {/* TYPE */}
                            <td style={{ padding: '14px 12px' }}>
                                <TypeBadge type={tx.type} />
                            </td>

                            {/* AMOUNT */}
                            <td style={{
                                padding: '14px 12px',
                                textAlign: 'right',
                                fontSize: '14px',
                                fontWeight: 700,
                                color: tx.type === 'collection' ? '#10b981' : '#ffffff'
                            }}>
                                ₹{tx.amount?.toLocaleString('en-IN')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;