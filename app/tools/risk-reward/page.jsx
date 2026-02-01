'use client';

import { useState, useEffect } from 'react';
import { calculatePositionSize, formatRupiah, formatNumber, formatPercentage } from '../../lib/calculations';

export default function RiskRewardPage() {
    const [capital, setCapital] = useState('');
    const [riskPercentage, setRiskPercentage] = useState('1');
    const [entryPrice, setEntryPrice] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        const savedCapital = localStorage.getItem('tool_risk_capital');
        if (savedCapital) setCapital(savedCapital);
        const savedRisk = localStorage.getItem('tool_risk_percentage');
        if (savedRisk) setRiskPercentage(savedRisk);
    }, []);

    useEffect(() => {
        localStorage.setItem('tool_risk_capital', capital);
    }, [capital]);

    useEffect(() => {
        localStorage.setItem('tool_risk_percentage', riskPercentage);
    }, [riskPercentage]);

    // Format helpers
    const formatRupiahInput = (val) => {
        const num = val.replace(/\D/g, '');
        if (!num) return '';
        return new Intl.NumberFormat('id-ID').format(parseInt(num, 10));
    };

    const parseRupiahInput = (val) => {
        if (!val) return '';
        return val.replace(/\D/g, '');
    };

    const handleCapitalChange = (e) => {
        setCapital(formatRupiahInput(e.target.value));
    };

    const handleCalculate = () => {
        const caps = parseFloat(parseRupiahInput(capital));
        const risk = parseFloat(riskPercentage);
        const entry = parseFloat(entryPrice);
        const sl = parseFloat(stopLoss);

        if (!caps || !entry || !sl) {
            alert('Mohon lengkapi data modal, entry, dan stop loss!');
            return;
        }

        if (entry <= sl) {
            alert('Harga Entry harus lebih besar dari Stop Loss (untuk Long Position)!');
            return;
        }

        const res = calculatePositionSize(caps, risk, entry, sl);
        setResult(res);
    };

    const handleReset = () => {
        setCapital('');
        setRiskPercentage('1');
        setEntryPrice('');
        setStopLoss('');
        setResult(null);
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
            <div className="flex justify-between items-end mb-lg">
                <div>
                    <h2 className="mb-xs">🎯 Risk & Position Sizing</h2>
                    <p className="text-muted">Hitung lot optimal untuk menjaga manajemen risiko.</p>
                </div>
                <button className="btn btn-sm btn-ghost text-danger" onClick={handleReset}>
                    Reset
                </button>
            </div>

            <div className="grid grid-2 gap-xl items-start">
                <div className="card">
                    <div className="card-body p-xl">
                        <h4 className="mb-lg border-bottom pb-sm">1. Portfolio</h4>
                        <div className="form-group">
                            <label className="form-label">Total Modal Trading</label>
                            <div className="input-group">
                                <span className="input-prefix">Rp</span>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={capital}
                                    onChange={handleCapitalChange}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Toleransi Risiko (%)</label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-input"
                                    value={riskPercentage}
                                    onChange={(e) => setRiskPercentage(e.target.value)}
                                    step="0.1"
                                />
                                <span className="input-suffix">%</span>
                            </div>
                            <small className="form-hint">Maksimal kerugian yang siap diterima dari total modal (Rec: 1-2%).</small>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body p-xl">
                        <h4 className="mb-lg border-bottom pb-sm">2. Trade Setup</h4>
                        <div className="form-group">
                            <label className="form-label">Harga Buy (Entry)</label>
                            <div className="input-group">
                                <span className="input-prefix">Rp</span>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={entryPrice}
                                    onChange={(e) => setEntryPrice(e.target.value)}
                                    placeholder="Harga beli..."
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Harga Cut Loss (Stop Loss)</label>
                            <div className="input-group">
                                <span className="input-prefix">Rp</span>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={stopLoss}
                                    onChange={(e) => setStopLoss(e.target.value)}
                                    placeholder="Batas rugi..."
                                />
                            </div>
                        </div>
                        <button className="btn btn-primary w-full mt-md" onClick={handleCalculate}>
                            Hitung Posisi
                        </button>
                    </div>
                </div>
            </div>

            {result && (
                <div className="mt-xl animate-slide-up">
                    <h3 className="mb-md">Hasil Analisis</h3>
                    <div className="grid grid-3 gap-lg mb-xl">
                        {/* Result 1: Max Lot */}
                        <div className="card bg-primary text-white border-0">
                            <div className="card-body text-center p-lg">
                                <p className="text-white-opacity text-sm mb-xs">Maksimal Beli</p>
                                <h2 className="text-4xl font-bold mb-xs">{formatNumber(result.maxLots)} Lot</h2>
                                <p className="text-xs text-white-opacity">~ {formatNumber(result.maxShares)} lembar</p>
                            </div>
                        </div>

                        {/* Result 2: Position Value */}
                        <div className="card bg-tertiary border-0">
                            <div className="card-body text-center p-lg">
                                <p className="text-muted text-sm mb-xs">Nilai Posisi</p>
                                <h3 className="text-2xl font-bold text-primary mb-xs">{formatRupiah(result.positionValue)}</h3>
                                <p className="text-xs text-muted">Total uang yang dipakai</p>
                            </div>
                        </div>

                        {/* Result 3: Risk Amount */}
                        <div className="card bg-danger-light border-0">
                            <div className="card-body text-center p-lg">
                                <p className="text-danger-dark text-sm mb-xs">Potensi Risiko</p>
                                <h3 className="text-2xl font-bold text-danger mb-xs">{formatRupiah(result.actualRiskAmount)}</h3>
                                <p className="text-xs text-danger-dark">Jika kena Stop Loss</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header border-bottom">
                            <h4 className="card-title">🎯 Target Profit (Risk : Reward Scenario)</h4>
                        </div>
                        <div className="card-body p-0">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Ratio</th>
                                        <th>Target Harga Jual</th>
                                        <th className="text-right">Potensi Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.targets.map((t, idx) => (
                                        <tr key={idx} className="hover:bg-tertiary transition-colors">
                                            <td className="font-semibold text-primary">{t.ratio}</td>
                                            <td className="font-medium">{formatRupiah(t.price)}</td>
                                            <td className="text-right text-success font-bold">+{formatRupiah(t.profit)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
