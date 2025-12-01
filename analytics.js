document.addEventListener('DOMContentLoaded', function() {
    initAnalytics();
});

function initAnalytics() {
    createWinRateChart();
    createReturnsChart();
}

function createWinRateChart() {
    const ctx = document.getElementById('winRateChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Momentum\n(P/C<0.5)', 'Hot Tickers\n(≥5 days)', 'Bullish P/C\n(<0.3)', 'Bearish P/C\n(>2.0)'],
            datasets: [{
                label: 'Win Rate %',
                data: [60.9, 56.7, 51.4, 48.7],
                backgroundColor: [
                    'rgba(39, 174, 96, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ],
                borderColor: [
                    'rgba(39, 174, 96, 1)',
                    'rgba(46, 204, 113, 1)',
                    'rgba(241, 196, 15, 1)',
                    'rgba(231, 76, 60, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 70,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function createReturnsChart() {
    const ctx = document.getElementById('returnsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Momentum', 'Hot Tickers', 'Bullish P/C', 'Bearish P/C'],
            datasets: [{
                label: 'Avg Return (10 days) %',
                data: [5.51, 2.58, 2.81, 1.57],
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '+' + value + '%';
                        }
                    }
                }
            }
        }
    });
}

function switchPattern(pattern) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('pattern-content');
    
    const patterns = {
        momentum: {
            title: '🚀 Momentum Strategy',
            winRate: '60.9%',
            avgReturn: '+5.51%',
            criteria: [
                'P/C Ratio < 0.5 (sustained bullish sentiment)',
                'Multiple appearances in unusual volume (≥3 days)',
                'Positive price momentum'
            ],
            bestFor: '2-4 week Call options or stock purchases'
        },
        hot: {
            title: '🔥 Hot Tickers Strategy',
            winRate: '56.7%',
            avgReturn: '+2.58%',
            criteria: [
                'Appears ≥5 times in last 10 days',
                'Consistent unusual volume',
                'Any P/C Ratio'
            ],
            bestFor: 'Directional plays based on trend'
        },
        highiv: {
            title: '⚡ High IV Strategy',
            winRate: '19.1% (low movement)',
            avgReturn: '20% (avg movement)',
            criteria: [
                'IV Rank > 70%',
                'High options volume'
            ],
            bestFor: '⚠️ AVOID selling volatility - 81% have large moves!'
        },
        reversal: {
            title: '🔄 Reversal Strategy',
            winRate: '~50%',
            avgReturn: 'Variable',
            criteria: [
                'Extreme P/C deviation from moving average',
                'Sudden change in sentiment'
            ],
            bestFor: 'Contrarian plays - experimental'
        }
    };
    
    const p = patterns[pattern];
    content.innerHTML = `
        <h3>${p.title}</h3>
        <p><strong>Win Rate:</strong> ${p.winRate} | <strong>Avg Return:</strong> ${p.avgReturn}</p>
        <p><strong>Criteria:</strong></p>
        <ul>
            ${p.criteria.map(c => `<li>${c}</li>`).join('')}
        </ul>
        <p><strong>Best for:</strong> ${p.bestFor}</p>
    `;
}

window.switchPattern = switchPattern;
