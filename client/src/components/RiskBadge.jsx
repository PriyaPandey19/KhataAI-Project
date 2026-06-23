// Sr.No.8 — LLM: riskScore ML Model se aata hai
// high = red, medium = orange, low = green

const RiskBadge = ({ risk }) => {
    const styles = {
        high:   { background: 'rgba(239,68,68,0.15)',   color: '#f87171', border: '1px solid rgba(239,68,68,0.3)'   },
        medium: { background: 'rgba(249,115,22,0.15)',  color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)'  },
        low:    { background: 'rgba(16,185,129,0.15)',  color: '#34d399', border: '1px solid rgba(16,185,129,0.3)'  },
    };
    const labels = { high: 'HIGH RISK', medium: 'MODERATE', low: 'HEALTHY' };

    return (
        <span
            className="text-[10px] font-bold px-2 py-1 rounded-full"  // ✅ fixed: py-2 → py-1 (was too tall)
            style={styles[risk] || styles.low}
        >
            {labels[risk] || 'HEALTHY'}
        </span>
    );
};

export default RiskBadge;