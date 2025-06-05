import React, { useState } from 'react';
import './CredibilityScore.css';

const CredibilityScore = ({ score, label, explanation }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const getScoreColor = (score) => {
        if (score >= 80) return '#2ecc71'; // Green
        if (score >= 60) return '#3498db'; // Blue
        if (score >= 40) return '#f1c40f'; // Yellow
        if (score >= 20) return '#e67e22'; // Orange
        return '#e74c3c'; // Red
    };

    const scoreColor = getScoreColor(score);

    return (
        <div className="credibility-container">
            <div
                className="credibility-badge"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{ borderColor: scoreColor }}
            >
                <div className="score-circle" style={{ backgroundColor: scoreColor }}>
                    {score || '?'}
                </div>
                <span className="trust-label" style={{ color: scoreColor }}>
                    {label}
                </span>
                
                {showTooltip && (
                    <div className="credibility-tooltip">
                        <h4>Credibility Analysis</h4>
                        <p>{explanation.main}</p>
                        <div className="tooltip-details">
                            <span>{explanation.score}</span>
                            <span>{explanation.confidence}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CredibilityScore; 