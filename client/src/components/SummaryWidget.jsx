const SummaryWidget = ({ label, value, sub, subColor, icon }) => {
    return (
        <div style={{ 
            background: '#0d1c2d', 
            border: '1px solid #1e3448',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 400 }}>{label}</p>
                {icon && (
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#1e3448', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                    </div>
                )}
            </div>
            <p style={{ 
                fontSize: '38px',
                fontWeight: 800,
                color: '#ffffff', 
                letterSpacing: '-1.5px',
                lineHeight: 1,
                margin: 0
            }}>
                {value}
            </p>
            {sub && (
                <p style={{ fontSize: '12px', color: subColor || '#10b981', margin: 0 }}>{sub}</p>
            )}
        </div>
    );
};

export default SummaryWidget;