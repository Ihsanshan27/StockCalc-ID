'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import {
    formatRupiah,
    formatPercentage,
    formatNumber,
    calculateARAARB,
    calculateMultipleARA,
    calculateMultipleARB,
    calculateWeightedAverage,
    getPriceFraction,
    calculateRetirementFund,
    calculateMonthlySavings,
    projectRetirementGrowth,
} from '../lib/calculations';

function ToolsContent() {
    // ARA/ARB Calculator State
    const [araPrice, setAraPrice] = useState('');
    const [araType, setAraType] = useState('symmetric');
    const [araDays, setAraDays] = useState(5);
    const [araResult, setAraResult] = useState(null);
    const [multiAraResult, setMultiAraResult] = useState(null);
    const [multiArbResult, setMultiArbResult] = useState(null);

    // Average Price Calculator State
    const [avgEntries, setAvgEntries] = useState([
        { id: 1, price: '', lot: '' },
        { id: 2, price: '', lot: '' },
    ]);
    const [avgResult, setAvgResult] = useState(null);
    const [targetPrice, setTargetPrice] = useState('');

    // Retirement Fund Calculator State
    const [retireMonthlyExpense, setRetireMonthlyExpense] = useState('');
    const [retireInflation, setRetireInflation] = useState('6');
    const [retireYears, setRetireYears] = useState('');
    const [retireCurrentSavings, setRetireCurrentSavings] = useState('');
    const [retireReturn, setRetireReturn] = useState('10');
    const [retireResult, setRetireResult] = useState(null);
    const [retireSavingsResult, setRetireSavingsResult] = useState(null);
    const [retireProjections, setRetireProjections] = useState(null);

    // Helper function to format Rupiah input with thousand separators
    const formatRupiahInput = (value) => {
        // Remove all non-digit characters
        const numericValue = value.replace(/\D/g, '');
        if (!numericValue) return '';
        // Format with thousand separators
        return new Intl.NumberFormat('id-ID').format(parseInt(numericValue, 10));
    };

    // Helper function to parse Rupiah input back to number
    const parseRupiahInput = (value) => {
        if (!value) return '';
        return value.replace(/\D/g, '');
    };

    // Handlers for Rupiah formatted inputs
    const handleRupiahChange = (setter) => (e) => {
        const formatted = formatRupiahInput(e.target.value);
        setter(formatted);
    };

    // ARA/ARB Calculator Functions
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

    // Average Price Calculator Functions
    const handleAddEntry = () => {
        const newId = Math.max(...avgEntries.map(e => e.id)) + 1;
        setAvgEntries([...avgEntries, { id: newId, price: '', lot: '' }]);
    };

    const handleRemoveEntry = (id) => {
        if (avgEntries.length <= 2) return;
        setAvgEntries(avgEntries.filter(e => e.id !== id));
    };

    const handleEntryChange = (id, field, value) => {
        setAvgEntries(avgEntries.map(e =>
            e.id === id ? { ...e, [field]: value } : e
        ));
    };

    const handleCalculateAverage = () => {
        const entries = avgEntries
            .filter(e => e.price && e.lot)
            .map(e => ({
                price: parseFloat(e.price),
                lot: parseFloat(e.lot),
            }));

        if (entries.length < 1) {
            alert('Masukkan minimal 1 entry dengan harga dan lot!');
            return;
        }

        const result = calculateWeightedAverage(entries);

        // Calculate P/L if target price is set
        if (targetPrice) {
            const target = parseFloat(targetPrice);
            const pl = (target - result.avgPrice) * result.totalShares;
            const plPercent = ((target - result.avgPrice) / result.avgPrice) * 100;
            result.targetPrice = target;
            result.pl = pl;
            result.plPercent = plPercent;
        }

        setAvgResult(result);
    };

    const handleResetAverage = () => {
        setAvgEntries([
            { id: 1, price: '', lot: '' },
            { id: 2, price: '', lot: '' },
        ]);
        setAvgResult(null);
        setTargetPrice('');
    };

    // Retirement Fund Calculator Functions
    const handleCalculateRetirement = () => {
        const monthlyExpense = parseFloat(parseRupiahInput(retireMonthlyExpense));
        const inflation = parseFloat(retireInflation) || 6;
        const years = parseFloat(retireYears) || 0;
        const currentSavings = parseFloat(parseRupiahInput(retireCurrentSavings)) || 0;
        const annualReturn = parseFloat(retireReturn) || 10;

        if (!monthlyExpense || monthlyExpense <= 0) {
            alert('Masukkan pengeluaran bulanan yang valid!');
            return;
        }

        if (!years || years <= 0) {
            alert('Masukkan jangka waktu hingga pensiun!');
            return;
        }

        // Calculate required retirement fund
        const fundResult = calculateRetirementFund(monthlyExpense, inflation, years);
        setRetireResult(fundResult);

        // Calculate monthly savings needed
        const savingsResult = calculateMonthlySavings(
            fundResult.requiredFund,
            currentSavings,
            years,
            annualReturn
        );
        setRetireSavingsResult(savingsResult);

        // Project growth
        const projections = projectRetirementGrowth(
            currentSavings,
            savingsResult.monthlySavings,
            Math.min(years, 30),
            annualReturn
        );
        setRetireProjections(projections);
    };

    const handleResetRetirement = () => {
        setRetireMonthlyExpense('');
        setRetireInflation('6');
        setRetireYears('');
        setRetireCurrentSavings('');
        setRetireReturn('10');
        setRetireResult(null);
        setRetireSavingsResult(null);
        setRetireProjections(null);
    };

    return (
        <>
            <Navbar />
            <main className="page">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1 className="page-title">🛠️ Tools</h1>
                        <p className="page-subtitle">Kalkulator dan tools berguna untuk trading saham</p>
                    </div>

                    {/* ARA/ARB Calculator */}
                    <div className="card mb-xl animate-slide-up">
                        <div className="card-header">
                            <h2 className="card-title">📊 Kalkulator ARA/ARB</h2>
                        </div>
                        <div className="card-body">
                            <p className="text-muted mb-lg" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Hitung batas Auto Rejection Atas (ARA) dan Auto Rejection Bawah (ARB) berdasarkan harga saham.
                            </p>

                            <div className="grid grid-4 mb-lg">
                                <div className="form-group">
                                    <label className="form-label">Harga Acuan (Rp)</label>
                                    <input
                                        type="number"
                                        value={araPrice}
                                        onChange={(e) => setAraPrice(e.target.value)}
                                        placeholder="1000"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tipe Pergerakan</label>
                                    <select
                                        value={araType}
                                        onChange={(e) => setAraType(e.target.value)}
                                        className="form-input form-select"
                                    >
                                        <option value="symmetric">Symmetric (±25%)</option>
                                        <option value="asymmetric">Asymmetric (+35%/-7%)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Jumlah Hari Simulasi</label>
                                    <input
                                        type="number"
                                        value={araDays}
                                        onChange={(e) => setAraDays(parseInt(e.target.value) || 5)}
                                        min="1"
                                        max="20"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group flex items-end">
                                    <button onClick={handleCalculateARA} className="btn btn-primary w-full">
                                        🔢 Hitung ARA/ARB
                                    </button>
                                </div>
                            </div>

                            {/* Single Day Result */}
                            {araResult && (
                                <div className="mb-xl">
                                    <h4 className="mb-md">Hasil Perhitungan</h4>
                                    <div className="grid grid-4">
                                        <div className="summary-card" style={{ padding: 'var(--space-lg)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Harga Acuan</p>
                                            <p className="font-bold" style={{ fontSize: 'var(--font-size-xl)' }}>
                                                {formatRupiah(parseFloat(araPrice))}
                                            </p>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-xs)' }}>
                                                Fraksi: Rp{araResult.priceFraction}
                                            </p>
                                        </div>
                                        <div className="summary-card" style={{ padding: 'var(--space-lg)', borderLeft: '4px solid var(--color-success)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>ARA (Batas Atas)</p>
                                            <p className="font-bold text-success" style={{ fontSize: 'var(--font-size-xl)' }}>
                                                {formatRupiah(araResult.ara)}
                                            </p>
                                            <p className="text-success" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)' }}>
                                                {formatPercentage(araResult.araPercent)} (+{formatRupiah(araResult.araGain)})
                                            </p>
                                        </div>
                                        <div className="summary-card" style={{ padding: 'var(--space-lg)', borderLeft: '4px solid var(--color-danger)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>ARB (Batas Bawah)</p>
                                            <p className="font-bold text-danger" style={{ fontSize: 'var(--font-size-xl)' }}>
                                                {formatRupiah(araResult.arb)}
                                            </p>
                                            <p className="text-danger" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)' }}>
                                                {formatPercentage(-araResult.arbPercent)} (-{formatRupiah(araResult.arbLoss)})
                                            </p>
                                        </div>
                                        <div className="summary-card" style={{ padding: 'var(--space-lg)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Range Harga</p>
                                            <p className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                {formatRupiah(araResult.arb)} - {formatRupiah(araResult.ara)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Multi-day ARA Simulation */}
                            {multiAraResult && (
                                <div className="grid grid-2 gap-lg">
                                    <div>
                                        <h4 className="mb-md flex items-center gap-sm">
                                            <span style={{ color: 'var(--color-success)' }}>📈</span>
                                            Simulasi ARA {araDays} Hari
                                        </h4>
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Hari</th>
                                                        <th>Harga Buka</th>
                                                        <th>ARA</th>
                                                        <th>%</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {multiAraResult.results.map((r) => (
                                                        <tr key={r.day}>
                                                            <td>{r.day}</td>
                                                            <td>{formatRupiah(r.openPrice)}</td>
                                                            <td className="text-success font-semibold">{formatRupiah(r.ara)}</td>
                                                            <td className="text-success">{formatPercentage(r.araPercent)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-md" style={{
                                            background: 'var(--color-success-light)',
                                            padding: 'var(--space-md)',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            <p className="text-success font-semibold">
                                                Total Gain: {formatRupiah(multiAraResult.totalGain)} ({formatPercentage(multiAraResult.totalGainPercent)})
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="mb-md flex items-center gap-sm">
                                            <span style={{ color: 'var(--color-danger)' }}>📉</span>
                                            Simulasi ARB {araDays} Hari
                                        </h4>
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Hari</th>
                                                        <th>Harga Buka</th>
                                                        <th>ARB</th>
                                                        <th>%</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {multiArbResult.results.map((r) => (
                                                        <tr key={r.day}>
                                                            <td>{r.day}</td>
                                                            <td>{formatRupiah(r.openPrice)}</td>
                                                            <td className="text-danger font-semibold">{formatRupiah(r.arb)}</td>
                                                            <td className="text-danger">{formatPercentage(-r.arbPercent)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-md" style={{
                                            background: 'var(--color-danger-light)',
                                            padding: 'var(--space-md)',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            <p className="text-danger font-semibold">
                                                Total Loss: -{formatRupiah(multiArbResult.totalLoss)} ({formatPercentage(-multiArbResult.totalLossPercent)})
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Average Price Calculator */}
                    <div className="card mb-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="card-header">
                            <h2 className="card-title">📐 Kalkulator Harga Rata-rata</h2>
                        </div>
                        <div className="card-body">
                            <p className="text-muted mb-lg" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Hitung harga rata-rata pembelian saham dari beberapa transaksi dengan harga dan lot berbeda.
                            </p>

                            {/* Entry Form */}
                            <div className="mb-lg">
                                <div className="flex justify-between items-center mb-md">
                                    <h4>Daftar Pembelian</h4>
                                    <button onClick={handleAddEntry} className="btn btn-secondary btn-sm">
                                        ➕ Tambah Entry
                                    </button>
                                </div>

                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Harga Beli (Rp)</th>
                                                <th>Jumlah Lot</th>
                                                <th>Total Nilai</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {avgEntries.map((entry, index) => {
                                                const value = (parseFloat(entry.price) || 0) * (parseFloat(entry.lot) || 0) * 100;
                                                return (
                                                    <tr key={entry.id}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                value={entry.price}
                                                                onChange={(e) => handleEntryChange(entry.id, 'price', e.target.value)}
                                                                placeholder="0"
                                                                className="form-input"
                                                                style={{ width: '120px', padding: 'var(--space-xs) var(--space-sm)' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                value={entry.lot}
                                                                onChange={(e) => handleEntryChange(entry.id, 'lot', e.target.value)}
                                                                placeholder="0"
                                                                className="form-input"
                                                                style={{ width: '100px', padding: 'var(--space-xs) var(--space-sm)' }}
                                                            />
                                                        </td>
                                                        <td className="text-muted">{formatRupiah(value)}</td>
                                                        <td>
                                                            {avgEntries.length > 2 && (
                                                                <button
                                                                    onClick={() => handleRemoveEntry(entry.id)}
                                                                    className="btn btn-ghost btn-sm"
                                                                    title="Hapus"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Target Price Input */}
                            <div className="form-row mb-lg">
                                <div className="form-group">
                                    <label className="form-label">Target Harga Jual (Opsional)</label>
                                    <input
                                        type="number"
                                        value={targetPrice}
                                        onChange={(e) => setTargetPrice(e.target.value)}
                                        placeholder="Untuk simulasi P/L"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group flex items-end gap-sm">
                                    <button onClick={handleCalculateAverage} className="btn btn-primary">
                                        🔢 Hitung Rata-rata
                                    </button>
                                    <button onClick={handleResetAverage} className="btn btn-secondary">
                                        🔄 Reset
                                    </button>
                                </div>
                            </div>

                            {/* Result */}
                            {avgResult && (
                                <div className="mt-xl">
                                    <h4 className="mb-md">Hasil Perhitungan</h4>
                                    <div className="grid grid-4">
                                        <div className="summary-card" style={{ padding: 'var(--space-lg)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Harga Rata-rata</p>
                                            <p className="font-bold text-primary" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                                {formatRupiah(avgResult.avgPrice)}
                                            </p>
                                        </div>
                                        <div className="summary-card" style={{ padding: 'var(--space-lg)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Total Lot</p>
                                            <p className="font-bold" style={{ fontSize: 'var(--font-size-xl)' }}>
                                                {formatNumber(avgResult.totalLot)} lot
                                            </p>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                                                ({formatNumber(avgResult.totalShares)} lembar)
                                            </p>
                                        </div>
                                        <div className="summary-card" style={{ padding: 'var(--space-lg)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Total Nilai Investasi</p>
                                            <p className="font-bold" style={{ fontSize: 'var(--font-size-xl)' }}>
                                                {formatRupiah(avgResult.totalValue)}
                                            </p>
                                        </div>
                                        {avgResult.targetPrice && (
                                            <div className="summary-card" style={{
                                                padding: 'var(--space-lg)',
                                                borderLeft: `4px solid ${avgResult.pl >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}`
                                            }}>
                                                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Simulasi P/L @ {formatRupiah(avgResult.targetPrice)}</p>
                                                <p className={`font-bold ${avgResult.pl >= 0 ? 'text-success' : 'text-danger'}`}
                                                    style={{ fontSize: 'var(--font-size-xl)' }}>
                                                    {formatRupiah(avgResult.pl)}
                                                </p>
                                                <p className={avgResult.plPercent >= 0 ? 'text-success' : 'text-danger'}
                                                    style={{ fontSize: 'var(--font-size-sm)' }}>
                                                    {formatPercentage(avgResult.plPercent)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Retirement Fund Calculator */}
                    <div className="card mb-xl animate-slide-up" style={{ animationDelay: '150ms' }}>
                        <div className="card-header">
                            <h2 className="card-title">🏖️ Kalkulator Dana Pensiun (4% Rule)</h2>
                        </div>
                        <div className="card-body">
                            <p className="text-muted mb-lg" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Hitung berapa dana yang dibutuhkan untuk pensiun berdasarkan <strong>4% Rule</strong> - aturan yang menyatakan Anda dapat menarik 4% dari portofolio setiap tahun tanpa kehabisan uang selama 30+ tahun pensiun.
                            </p>

                            {/* Input Form */}
                            <div className="grid grid-3 mb-lg">
                                <div className="form-group">
                                    <label className="form-label">Pengeluaran Bulanan Saat Pensiun (Rp)</label>
                                    <input
                                        type="text"
                                        value={retireMonthlyExpense}
                                        onChange={handleRupiahChange(setRetireMonthlyExpense)}
                                        placeholder="10.000.000"
                                        className="form-input"
                                    />
                                    <small className="text-muted">Berapa biaya hidup bulanan yang Anda inginkan?</small>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tahun Hingga Pensiun</label>
                                    <input
                                        type="number"
                                        value={retireYears}
                                        onChange={(e) => setRetireYears(e.target.value)}
                                        placeholder="20"
                                        className="form-input"
                                        min="1"
                                    />
                                    <small className="text-muted">Berapa tahun lagi hingga pensiun?</small>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tabungan/Investasi Saat Ini (Rp)</label>
                                    <input
                                        type="text"
                                        value={retireCurrentSavings}
                                        onChange={handleRupiahChange(setRetireCurrentSavings)}
                                        placeholder="100.000.000"
                                        className="form-input"
                                    />
                                    <small className="text-muted">Dana yang sudah terkumpul saat ini</small>
                                </div>
                            </div>

                            <div className="grid grid-3 mb-lg">
                                <div className="form-group">
                                    <label className="form-label">Inflasi Tahunan (%)</label>
                                    <input
                                        type="number"
                                        value={retireInflation}
                                        onChange={(e) => setRetireInflation(e.target.value)}
                                        placeholder="6"
                                        className="form-input"
                                        step="0.5"
                                    />
                                    <small className="text-muted">Rata-rata inflasi Indonesia ~6%/tahun</small>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expected Return Investasi (%)</label>
                                    <input
                                        type="number"
                                        value={retireReturn}
                                        onChange={(e) => setRetireReturn(e.target.value)}
                                        placeholder="10"
                                        className="form-input"
                                        step="0.5"
                                    />
                                    <small className="text-muted">Return saham ~10-15%, reksa dana ~8-12%</small>
                                </div>
                                <div className="form-group flex items-end gap-sm">
                                    <button onClick={handleCalculateRetirement} className="btn btn-primary">
                                        🧮 Hitung Dana Pensiun
                                    </button>
                                    <button onClick={handleResetRetirement} className="btn btn-secondary">
                                        🔄 Reset
                                    </button>
                                </div>
                            </div>

                            {/* Results */}
                            {retireResult && (
                                <div className="mt-xl">
                                    <h4 className="mb-md">📊 Hasil Kalkulasi</h4>

                                    {/* Main Result Cards */}
                                    <div className="grid grid-4 mb-lg">
                                        <div className="summary-card" style={{
                                            padding: 'var(--space-lg)',
                                            background: 'linear-gradient(135deg, var(--color-primary-light), var(--bg-tertiary))',
                                            borderLeft: '4px solid var(--color-primary)'
                                        }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>💰 Dana Pensiun Dibutuhkan</p>
                                            <p className="font-bold text-primary" style={{ fontSize: 'var(--font-size-xl)' }}>
                                                {formatRupiah(retireResult.requiredFund)}
                                            </p>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-xs)' }}>
                                                Berdasarkan 4% rule
                                            </p>
                                        </div>

                                        <div className="summary-card" style={{ padding: 'var(--space-lg)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>📅 Pengeluaran Bulanan (Sekarang)</p>
                                            <p className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                {formatRupiah(retireResult.currentMonthlyExpense)}
                                            </p>
                                        </div>

                                        <div className="summary-card" style={{ padding: 'var(--space-lg)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>📈 Pengeluaran Bulanan (Saat Pensiun)</p>
                                            <p className="font-bold text-warning" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                {formatRupiah(retireResult.futureMonthlyExpense)}
                                            </p>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-xs)' }}>
                                                Setelah inflasi {retireResult.yearsUntilRetirement} tahun
                                            </p>
                                        </div>

                                        <div className="summary-card" style={{ padding: 'var(--space-lg)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>🗓️ Pengeluaran Tahunan (Saat Pensiun)</p>
                                            <p className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                {formatRupiah(retireResult.futureAnnualExpense)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Monthly Savings Needed */}
                                    {retireSavingsResult && (
                                        <div className="grid grid-3 mb-lg">
                                            <div className="summary-card" style={{
                                                padding: 'var(--space-lg)',
                                                background: 'linear-gradient(135deg, var(--color-success-light), var(--bg-tertiary))',
                                                borderLeft: '4px solid var(--color-success)'
                                            }}>
                                                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>💵 Nabung per Bulan</p>
                                                <p className="font-bold text-success" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                                    {formatRupiah(retireSavingsResult.monthlySavings)}
                                                </p>
                                                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-xs)' }}>
                                                    Selama {retireResult.yearsUntilRetirement} tahun dengan return {retireSavingsResult.annualReturn}%/tahun
                                                </p>
                                            </div>

                                            <div className="summary-card" style={{ padding: 'var(--space-lg)' }}>
                                                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>🏦 Dana Saat Ini</p>
                                                <p className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                    {formatRupiah(retireSavingsResult.currentSavings)}
                                                </p>
                                                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-xs)' }}>
                                                    Akan tumbuh menjadi {formatRupiah(retireSavingsResult.futureValueCurrentSavings)}
                                                </p>
                                            </div>

                                            <div className="summary-card" style={{ padding: 'var(--space-lg)' }}>
                                                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>🎯 Sisa yang Perlu Dikumpulkan</p>
                                                <p className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                    {formatRupiah(retireSavingsResult.remainingNeeded)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scenarios Comparison */}
                                    <div className="mb-lg">
                                        <h5 className="mb-md">📋 Perbandingan Skenario Withdrawal Rate</h5>
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Skenario</th>
                                                        <th>Withdrawal Rate</th>
                                                        <th>Dana Dibutuhkan</th>
                                                        <th>Penarikan Tahunan</th>
                                                        <th>Penarikan Bulanan</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {retireResult.scenarios.map((scenario) => (
                                                        <tr key={scenario.rate} className={scenario.rate === 4 ? 'font-semibold' : ''}>
                                                            <td>{scenario.label}</td>
                                                            <td>{scenario.rate}%</td>
                                                            <td className={scenario.rate === 4 ? 'text-primary' : ''}>{formatRupiah(scenario.fund)}</td>
                                                            <td>{formatRupiah(retireResult.futureAnnualExpense)}</td>
                                                            <td>{formatRupiah(retireResult.futureMonthlyExpense)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Projections Table */}
                                    {retireProjections && retireProjections.length > 0 && (
                                        <div>
                                            <h5 className="mb-md">📈 Proyeksi Pertumbuhan Dana</h5>
                                            <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Tahun</th>
                                                            <th>Saldo Awal</th>
                                                            <th>Kontribusi</th>
                                                            <th>Return Investasi</th>
                                                            <th>Saldo Akhir</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {retireProjections.map((proj) => (
                                                            <tr key={proj.year}>
                                                                <td>{proj.year}</td>
                                                                <td>{formatRupiah(proj.startBalance)}</td>
                                                                <td className="text-success">{formatRupiah(proj.contribution)}</td>
                                                                <td className="text-primary">{formatRupiah(proj.returns)}</td>
                                                                <td className="font-semibold">{formatRupiah(proj.endBalance)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="mt-md" style={{
                                                background: 'var(--color-success-light)',
                                                padding: 'var(--space-md)',
                                                borderRadius: 'var(--radius-md)'
                                            }}>
                                                <p className="text-success font-semibold">
                                                    🎉 Total Dana di Akhir: {formatRupiah(retireProjections[retireProjections.length - 1].endBalance)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4% Rule Info Card */}
                    <div className="card mb-xl animate-slide-up" style={{ animationDelay: '180ms' }}>
                        <div className="card-body">
                            <h4 className="mb-md">ℹ️ Apa itu 4% Rule?</h4>
                            <div className="grid grid-2 gap-lg">
                                <div>
                                    <h5 className="mb-sm">Konsep Dasar:</h5>
                                    <ul style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', paddingLeft: 'var(--space-lg)' }}>
                                        <li><strong>4% Rule</strong> berasal dari penelitian Trinity Study tahun 1998</li>
                                        <li>Anda dapat menarik 4% dari portofolio di tahun pertama pensiun</li>
                                        <li>Tahun berikutnya, sesuaikan dengan inflasi</li>
                                        <li>Portofolio akan bertahan minimal 30 tahun</li>
                                        <li>Rumus: <strong>Dana Pensiun = Pengeluaran Tahunan ÷ 0.04</strong></li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="mb-sm">Tips Perencanaan:</h5>
                                    <ul style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', paddingLeft: 'var(--space-lg)' }}>
                                        <li>Mulai investasi sedini mungkin (compound interest!)</li>
                                        <li>Diversifikasi: Saham, Reksa Dana, Obligasi, Properti</li>
                                        <li>Review dan sesuaikan rencana setiap tahun</li>
                                        <li>Pertimbangkan juga asuransi kesehatan</li>
                                        <li>Gunakan 3% rule jika ingin lebih konservatif</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="card mt-xl animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <div className="card-body">
                            <h4 className="mb-md">ℹ️ Informasi ARA/ARB</h4>
                            <div className="grid grid-2 gap-lg">
                                <div>
                                    <h5 className="mb-sm">Ketentuan Fraksi Harga IDX:</h5>
                                    <ul style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', paddingLeft: 'var(--space-lg)' }}>
                                        <li>Harga &lt; Rp200: Fraksi Rp1</li>
                                        <li>Harga Rp200 - Rp500: Fraksi Rp2</li>
                                        <li>Harga Rp500 - Rp2.000: Fraksi Rp5</li>
                                        <li>Harga Rp2.000 - Rp5.000: Fraksi Rp10</li>
                                        <li>Harga &gt; Rp5.000: Fraksi Rp25</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="mb-sm">Batas Auto Rejection:</h5>
                                    <ul style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', paddingLeft: 'var(--space-lg)' }}>
                                        <li><strong>Symmetric:</strong> ±25% dari harga penutupan sebelumnya</li>
                                        <li><strong>Asymmetric:</strong> +35% (naik) / -7% (turun)</li>
                                        <li>Berlaku untuk saham dengan kapitalisasi tertentu</li>
                                        <li>Ketentuan dapat berubah sesuai kebijakan BEI</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default function ToolsPage() {
    return (
        <ProtectedRoute>
            <ToolsContent />
        </ProtectedRoute>
    );
}
