'use client';

import { useState, useEffect } from 'react';
import {
    calculateRetirementFund,
    calculateMonthlySavings,
    projectRetirementGrowth,
    formatRupiah
} from '../../lib/calculations';

export default function RetirementPage() {
    const [monthlyExpense, setMonthlyExpense] = useState('');
    const [inflation, setInflation] = useState('6');
    const [years, setYears] = useState('');
    const [currentSavings, setCurrentSavings] = useState('');
    const [annualReturn, setAnnualReturn] = useState('10');

    // Results
    const [fundResult, setFundResult] = useState(null);
    const [savingsResult, setSavingsResult] = useState(null);
    const [projections, setProjections] = useState(null);

    useEffect(() => {
        const savedMonthly = localStorage.getItem('tool_retire_monthly');
        if (savedMonthly) setMonthlyExpense(savedMonthly);
        const savedInflation = localStorage.getItem('tool_retire_inflation');
        if (savedInflation) setInflation(savedInflation);
        const savedYears = localStorage.getItem('tool_retire_years');
        if (savedYears) setYears(savedYears);
        const savedSavings = localStorage.getItem('tool_retire_savings');
        if (savedSavings) setCurrentSavings(savedSavings);
        const savedReturn = localStorage.getItem('tool_retire_return');
        if (savedReturn) setAnnualReturn(savedReturn);
    }, []);

    useEffect(() => {
        localStorage.setItem('tool_retire_monthly', monthlyExpense);
    }, [monthlyExpense]);

    useEffect(() => {
        localStorage.setItem('tool_retire_inflation', inflation);
    }, [inflation]);

    useEffect(() => {
        localStorage.setItem('tool_retire_years', years);
    }, [years]);

    useEffect(() => {
        localStorage.setItem('tool_retire_savings', currentSavings);
    }, [currentSavings]);

    useEffect(() => {
        localStorage.setItem('tool_retire_return', annualReturn);
    }, [annualReturn]);

    // Helpers
    const formatInput = (val) => {
        const num = val.replace(/\D/g, '');
        if (!num) return '';
        return new Intl.NumberFormat('id-ID').format(parseInt(num, 10));
    };

    const parseInput = (val) => {
        if (!val) return 0;
        return parseInt(val.replace(/\D/g, ''), 10);
    };

    const handleCalculate = () => {
        const expense = parseInput(monthlyExpense);
        const infl = parseFloat(inflation) || 0;
        const yrs = parseFloat(years) || 0;
        const savings = parseInput(currentSavings);
        const ret = parseFloat(annualReturn) || 0;

        if (!expense || expense <= 0) {
            alert('Masukkan pengeluaran bulanan yang valid!');
            return;
        }

        if (!yrs || yrs <= 0) {
            alert('Masukkan jangka waktu hingga pensiun!');
            return;
        }

        const fResult = calculateRetirementFund(expense, infl, yrs);
        setFundResult(fResult);

        const sResult = calculateMonthlySavings(fResult.requiredFund, savings, yrs, ret);
        setSavingsResult(sResult);

        const proj = projectRetirementGrowth(savings, sResult.monthlySavings, Math.min(yrs, 30), ret);
        setProjections(proj);
    };

    const handleReset = () => {
        setMonthlyExpense('');
        setInflation('6');
        setYears('');
        setCurrentSavings('');
        setAnnualReturn('10');
        setFundResult(null);
        setSavingsResult(null);
        setProjections(null);
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px' }}>
            <div className="flex justify-between items-end mb-lg">
                <div>
                    <h2 className="mb-xs">👴 Dana Pensiun (FIRE)</h2>
                    <p className="text-muted">Hitung kebutuhan dana pensiun dengan metode 4% Rule.</p>
                </div>
                <button className="btn btn-sm btn-ghost text-danger" onClick={handleReset}>
                    Reset
                </button>
            </div>

            <div className="card mb-xl">
                <div className="card-body p-xl">
                    <div className="grid grid-2 gap-xl mb-lg">
                        <div>
                            <h5 className="mb-lg border-bottom pb-sm text-primary">Kondisi Saat Ini</h5>
                            <div className="form-group">
                                <label className="form-label">Pengeluaran Bulanan</label>
                                <div className="input-group">
                                    <span className="input-prefix">Rp</span>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={monthlyExpense}
                                        onChange={(e) => setMonthlyExpense(formatInput(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tabungan / Aset Lancar</label>
                                <div className="input-group">
                                    <span className="input-prefix">Rp</span>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={currentSavings}
                                        onChange={(e) => setCurrentSavings(formatInput(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h5 className="mb-lg border-bottom pb-sm text-warning">Asumsi & Target</h5>
                            <div className="form-group">
                                <label className="form-label">Target Pensiun Dalam</label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={years}
                                        onChange={(e) => setYears(e.target.value)}
                                        placeholder="0"
                                    />
                                    <span className="input-suffix">Tahun</span>
                                </div>
                            </div>
                            <div className="grid grid-2 gap-md">
                                <div className="form-group mb-0">
                                    <label className="form-label">Inflasi Tahunan</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={inflation}
                                            onChange={(e) => setInflation(e.target.value)}
                                            step="0.1"
                                        />
                                        <span className="input-suffix">%</span>
                                    </div>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">Return Investasi</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={annualReturn}
                                            onChange={(e) => setAnnualReturn(e.target.value)}
                                            step="0.1"
                                        />
                                        <span className="input-suffix">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="btn btn-primary w-full py-md text-lg" onClick={handleCalculate}>
                        Hitung Rencana Pensiun
                    </button>
                </div>
            </div>

            {fundResult && savingsResult && (
                <div className="animate-slide-up">
                    <div className="grid grid-2 gap-lg mb-xl">
                        <div className="card bg-primary text-white border-0">
                            <div className="card-body text-center p-xl">
                                <p className="text-white-opacity mb-xs uppercase text-xs tracking-wider">Target Dana Pensiun</p>
                                <h2 className="text-4xl font-bold text-white mb-xs">{formatRupiah(fundResult.requiredFund)}</h2>
                                <p className="text-sm text-white-opacity opacity-80 mt-sm">
                                    Setara dengan pengeluaran <strong>{formatRupiah(fundResult.futureMonthlyExpense)}/bulan</strong> di masa depan (karena inflasi).
                                </p>
                            </div>
                        </div>
                        <div className="card bg-success text-white border-0">
                            <div className="card-body text-center p-xl">
                                <p className="text-white-opacity mb-xs uppercase text-xs tracking-wider">Investasi Bulanan Diperlukan</p>
                                <h2 className="text-4xl font-bold text-white mb-xs">{formatRupiah(savingsResult.monthlySavings)}</h2>
                                <p className="text-sm text-white-opacity opacity-80 mt-sm">
                                    Anda perlu menabung jumlah ini setiap bulan selama {years} tahun ke depan dengan return invest {annualReturn}%.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-lg" style={{ gridTemplateColumns: 'minmax(0, 2fr) 1fr' }}>
                        {/* Projections Table */}
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h4 className="card-title">📈 Proyeksi Pertumbuhan Aset</h4>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table className="table table-striped mb-0">
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-tertiary)' }}>
                                            <tr>
                                                <th>Tahun</th>
                                                <th className="text-right">Kontribusi</th>
                                                <th className="text-right">Return</th>
                                                <th className="text-right">Total Aset</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projections && projections.map((p) => (
                                                <tr key={p.year}>
                                                    <td className="font-semibold text-muted text-center">{p.year}</td>
                                                    <td className="text-right text-muted">{formatRupiah(p.contribution)}</td>
                                                    <td className="text-right text-success">{formatRupiah(p.returns)}</td>
                                                    <td className="text-right font-bold">{formatRupiah(p.endBalance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Scenarios */}
                        <div className="card h-fit">
                            <div className="card-header border-bottom">
                                <h4 className="card-title">📋 Variasi 4% Rule</h4>
                            </div>
                            <div className="card-body p-0">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Rate</th>
                                            <th className="text-right">Dana</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fundResult.scenarios.map((s) => (
                                            <tr key={s.rate} className={s.rate === 4 ? 'bg-primary-light font-bold text-primary' : ''}>
                                                <td>{s.rate}%</td>
                                                <td className="text-right">{formatRupiah(s.fund)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="card-body text-xs text-muted bg-tertiary">
                                <p><strong>Note:</strong> Safe Withdrawal Rate 4% dianggap aman untuk 30 tahun masa pensiun. Gunakan 3% untuk profil sangat konservatif.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
