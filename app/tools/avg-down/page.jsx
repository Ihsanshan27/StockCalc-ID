'use client';

import { useState, useEffect } from 'react';
import { calculateTargetAverageDown, formatRupiah, formatNumber } from '../../lib/calculations';

export default function AvgDownPage() {
    const [currentPrice, setCurrentPrice] = useState('');
    const [currentLot, setCurrentLot] = useState('');
    const [targetAvg, setTargetAvg] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        const savedPrice = localStorage.getItem('tool_avg_down_current_price');
        if (savedPrice) setCurrentPrice(savedPrice);
        const savedLot = localStorage.getItem('tool_avg_down_current_lot');
        if (savedLot) setCurrentLot(savedLot);
        const savedTarget = localStorage.getItem('tool_avg_down_target_avg');
        if (savedTarget) setTargetAvg(savedTarget);
    }, []);

    useEffect(() => {
        localStorage.setItem('tool_avg_down_current_price', currentPrice);
    }, [currentPrice]);

    useEffect(() => {
        localStorage.setItem('tool_avg_down_current_lot', currentLot);
    }, [currentLot]);

    useEffect(() => {
        localStorage.setItem('tool_avg_down_target_avg', targetAvg);
    }, [targetAvg]);

    const handleCalculate = () => {
        const pCurrent = parseFloat(currentPrice);
        const lCurrent = parseFloat(currentLot);
        const pTarget = parseFloat(targetAvg);

        if (!pCurrent || !lCurrent || !pTarget) {
            alert('Mohon lengkapi semua data!');
            return;
        }

        if (pTarget >= pCurrent) {
            alert('Target average harus lebih KECIL dari harga rata-rata saat ini (Average Down)!');
            return;
        }

        const res = calculateTargetAverageDown(pCurrent, lCurrent, pTarget);
        setResult(res);
    };

    const handleReset = () => {
        setCurrentPrice('');
        setCurrentLot('');
        setTargetAvg('');
        setResult(null);
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <div className="flex justify-between items-end mb-lg">
                <div>
                    <h2 className="mb-xs">📉 Average Down Planner</h2>
                    <p className="text-muted">Strategi menurunkan harga rata-rata (serok bawah).</p>
                </div>
                <button className="btn btn-sm btn-ghost text-danger" onClick={handleReset}>
                    Reset
                </button>
            </div>


            <div className="card mb-xl">
                <div className="card-body p-xl">
                    <h5 className="mb-lg text-primary border-bottom pb-sm">1. Posisi Saat Ini</h5>
                    <div className="grid grid-2 gap-lg mb-xl">
                        <div className="form-group mb-0">
                            <label className="form-label">Harga Rata-rata</label>
                            <div className="input-group">
                                <span className="input-prefix">Rp</span>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={currentPrice}
                                    onChange={(e) => setCurrentPrice(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="form-group mb-0">
                            <label className="form-label">Total Lot</label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-input"
                                    value={currentLot}
                                    onChange={(e) => setCurrentLot(e.target.value)}
                                    placeholder="0"
                                />
                                <span className="input-suffix">Lot</span>
                            </div>
                        </div>
                    </div>

                    <h5 className="mb-lg text-warning border-bottom pb-sm">2. Target Average</h5>
                    <div className="form-group mb-xl">
                        <label className="form-label">Ingin Average Menjadi</label>
                        <div className="input-group">
                            <span className="input-prefix">Rp</span>
                            <input
                                type="number"
                                className="form-input"
                                value={targetAvg}
                                onChange={(e) => setTargetAvg(e.target.value)}
                                placeholder="Target harga..."
                            />
                        </div>
                        <p className="form-hint">Target harus lebih rendah dari harga rata-rata saat ini ({formatRupiah(currentPrice || 0)})</p>
                    </div>

                    <button className="btn btn-primary w-full py-md" onClick={handleCalculate}>
                        Hitung Skenario Pembelian
                    </button>
                </div>
            </div>

            {result && (
                <div className="animate-slide-up">
                    <div className="card bg-gradient-card mb-lg border-primary">
                        <div className="card-body p-lg flex items-center gap-lg">
                            <div className="bg-primary-light p-md rounded-full text-2xl">💡</div>
                            <div>
                                <h4 className="mb-xs">Rekomendasi</h4>
                                <p className="text-sm text-muted">Berikut jumlah lot yang perlu dibeli berdasarkan variasi harga pasar saat ini:</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body p-0">
                            <div className="table-container">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Jika Beli di Harga</th>
                                            <th className="text-right">Perlu Beli (Lot)</th>
                                            <th className="text-right">Modal Dibutuhkan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="font-semibold text-primary">{formatRupiah(item.price)}</td>
                                                <td className="text-right font-medium">{formatNumber(item.lot)}</td>
                                                <td className="text-right w-1/3">{formatRupiah(item.price * item.lot * 100)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
