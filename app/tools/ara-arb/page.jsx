'use client';

import { useState, useEffect } from 'react';
import {
    calculateARAARB,
    calculateMultipleARA,
    calculateMultipleARB,
    formatRupiah,
    formatPercentage,
    formatNumber
} from '../../lib/calculations';
import Modal from '../../components/Modal';

export default function AraArbPage() {
    const [araPrice, setAraPrice] = useState('');
    const [araType, setAraType] = useState('regular');
    const [araDays, setAraDays] = useState(5);
    const [araResult, setAraResult] = useState(null);
    const [multiAraResult, setMultiAraResult] = useState(null);
    const [multiArbResult, setMultiArbResult] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    // Persist state
    useEffect(() => {
        const savedPrice = localStorage.getItem('tool_ara_price');
        if (savedPrice) setAraPrice(savedPrice);
        const savedType = localStorage.getItem('tool_ara_type');
        if (savedType) setAraType(savedType);
        const savedDays = localStorage.getItem('tool_ara_days');
        if (savedDays) setAraDays(parseInt(savedDays));
    }, []);

    useEffect(() => {
        localStorage.setItem('tool_ara_price', araPrice);
    }, [araPrice]);

    useEffect(() => {
        localStorage.setItem('tool_ara_type', araType);
    }, [araType]);

    useEffect(() => {
        localStorage.setItem('tool_ara_days', araDays.toString());
    }, [araDays]);

    const handleCalculateARA = () => {
        const price = parseFloat(araPrice);
        if (!price || price <= 0) {
            alert('Masukkan harga yang valid!');
            return;
        }

        const result = calculateARAARB(price, araType);
        setAraResult(result);

        const multiAra = calculateMultipleARA(price, araDays, araType);
        setMultiAraResult(multiAra);

        const multiArb = calculateMultipleARB(price, araDays, araType);
        setMultiArbResult(multiArb);
    };

    const renderLadderRow = (price, prevPrice, dayLabel, type) => {
        const basePrice = parseFloat(araPrice);
        const change = price - prevPrice;
        const changePercent = prevPrice > 0 ? ((price - prevPrice) / prevPrice) * 100 : 0;
        const totalPercent = basePrice > 0 ? ((price - basePrice) / basePrice) * 100 : 0;

        const isPositive = price > basePrice;
        const isNegative = price < basePrice;
        const colorClass = isPositive ? 'text-success' : (isNegative ? 'text-danger' : 'text-muted');
        const rowClass = isPositive ? 'positive' : (isNegative ? 'negative' : 'neutral');
        const icon = isPositive ? '↗' : (isNegative ? '↘' : '-');

        return (
            <div className={`ladder-row ${rowClass}`} key={dayLabel}>
                <div className="flex items-center">
                    <span className="ladder-price">{formatRupiah(price)}</span>
                    {price !== basePrice && (
                        <span className={`ladder-change ${colorClass}`}>
                            {change > 0 ? '+' : ''}{formatNumber(change)} ({formatPercentage(changePercent)})
                        </span>
                    )}
                    {price === basePrice && (
                        <span className="text-muted text-sm italic">Harga Acuan (Day 0)</span>
                    )}
                </div>
                <div className={`ladder-total ${colorClass}`}>
                    {price !== basePrice && (
                        <>
                            <span>{icon}</span>
                            <span>{formatPercentage(totalPercent)}</span>
                        </>
                    )}
                    {price === basePrice && <span>0.00%</span>}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            {/* Header */}
            <div className="mb-lg flex justify-between items-start">
                <div>
                    <h2 className="mb-xs">📊 Kalkulator ARA/ARB</h2>
                    <p className="text-muted">Simulasi pergerakan batas harga saham sesuai aturan bursa.</p>
                </div>
                <button
                    className="btn btn-sm btn-ghost text-primary"
                    onClick={() => setShowInfo(true)}
                    title="Informasi Aturan"
                >
                    ℹ️ Info Aturan
                </button>
            </div>

            <div className="card mb-xl border-primary-hover">
                <div className="card-body p-xl">
                    <div className="grid grid-2 gap-lg mb-lg">
                        <div className="form-group mb-0">
                            <label className="form-label">Harga Acuan (Closing)</label>
                            <div className="input-group">
                                <span className="input-prefix">Rp</span>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={araPrice}
                                    onChange={(e) => setAraPrice(e.target.value)}
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="form-group mb-0">
                            <label className="form-label">Jenis Papan Perdagangan</label>
                            <select
                                className="form-input form-select"
                                value={araType}
                                onChange={(e) => setAraType(e.target.value)}
                            >
                                <option value="regular">Reguler (ARA 35/25/20% - ARB 15%)</option>
                                <option value="acceleration">Akselerasi / FCA (ARA/ARB 10%)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group mb-xl">
                        <label className="form-label">Simulasi Hari: {araDays} Hari</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={araDays}
                            onChange={(e) => setAraDays(parseInt(e.target.value))}
                            className="w-full"
                            style={{ accentColor: 'var(--color-primary)' }}
                        />
                    </div>

                    <button className="btn btn-primary w-full py-md" onClick={handleCalculateARA}>
                        Hitung Simulasi
                    </button>
                </div>
            </div>

            {araResult && multiAraResult && multiArbResult && (
                <div className="animate-slide-up">
                    <div className="card bg-tertiary mb-lg border-0">
                        <div className="card-body p-lg flex items-center gap-lg">
                            <div className="bg-primary-light text-primary p-md rounded-lg">
                                <span style={{ fontSize: '1.5rem' }}>👁️</span>
                            </div>
                            <div>
                                <h4 className="mb-xs">Simulasi Ladder</h4>
                                <p className="text-sm text-muted">
                                    Urutan harga dari batas atas (ARA) tertinggi hingga batas bawah (ARB) terendah selama {araDays} hari.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="ladder-container">
                        {/* ARA Rows (Reversed to show highest on top) */}
                        {[...multiAraResult.results].reverse().map((ara, index) => {
                            const realIndex = multiAraResult.results.length - 1 - index;
                            // Previous price is either the previous ARA day or the base price for Day 1
                            const prevPrice = realIndex === 0 ? parseFloat(araPrice) : multiAraResult.results[realIndex - 1].ara;
                            return renderLadderRow(ara.ara, prevPrice, `ara-${realIndex}`, 'ara');
                        })}

                        {/* Base Price Row (Middle) */}
                        {renderLadderRow(parseFloat(araPrice), parseFloat(araPrice), 'base', 'base')}

                        {/* ARB Rows (Normal order to show going down) */}
                        {multiArbResult.results.map((arb, index) => {
                            // Previous price is either previous ARB day or base price for Day 1
                            const prevPrice = index === 0 ? parseFloat(araPrice) : multiArbResult.results[index - 1].arb;
                            return renderLadderRow(arb.arb, prevPrice, `arb-${index}`, 'arb');
                        })}
                    </div>
                </div>
            )}

            <Modal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
                title="Aturan Auto Rejection (2025)"
            >
                <div className="text-sm">
                    <p className="mb-md">Berikut adalah aturan batas kenaikan (ARA) dan penurunan (ARB) yang berlaku di Bursa Efek Indonesia:</p>

                    <h4 className="text-primary mb-xs">1. Papan Reguler (Utama/Pengembangan)</h4>
                    <ul className="list-disc pl-lg mb-lg space-y-xs text-muted">
                        <li><strong>ARA Berjenjang:</strong>
                            <ul className="list-circle pl-lg mt-xs">
                                <li>Harga 50 - 200: Max <strong>+35%</strong></li>
                                <li>Harga 200 - 5.000: Max <strong>+25%</strong></li>
                                <li>Harga &gt; 5.000: Max <strong>+20%</strong></li>
                            </ul>
                        </li>
                        <li><strong>ARB Asimetris:</strong> Maksimal <strong>-15%</strong> untuk semua fraksi harga.</li>
                    </ul>

                    <h4 className="text-warning mb-xs">2. Papan Akselerasi (FCA)</h4>
                    <ul className="list-disc pl-lg mb-lg space-y-xs text-muted">
                        <li>Berlaku simetris untuk saham dalam pemantauan khusus.</li>
                        <li>ARA Maksimal <strong>+10%</strong></li>
                        <li>ARB Maksimal <strong>-10%</strong></li>
                    </ul>

                    <div className="bg-tertiary p-md rounded border-l-4 border-info">
                        <strong>Tips:</strong> Gunakan kalkulator ini untuk memprediksi harga antrian beli (Bid) atau jual (Offer) maksimal di hari berikutnya.
                    </div>
                </div>
            </Modal>
        </div>
    );
}
