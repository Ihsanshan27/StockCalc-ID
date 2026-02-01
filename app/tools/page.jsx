'use client';

import { useState, useEffect } from 'react';
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
    calculateTargetAverageDown,
    calculatePositionSize,
} from '../lib/calculations';

function ToolsContent() {
    // Tab Navigation State
    const [activeTab, setActiveTab] = useState('ara-arb');

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

    // Average Down Planner State
    const [avgDownCurrentPrice, setAvgDownCurrentPrice] = useState('');
    const [avgDownCurrentLot, setAvgDownCurrentLot] = useState('');
    const [avgDownTargetAvg, setAvgDownTargetAvg] = useState('');
    const [avgDownBudget, setAvgDownBudget] = useState(''); // Optional budget constraint
    const [avgDownResult, setAvgDownResult] = useState(null);

    // Risk & Position Sizing State
    const [riskCapital, setRiskCapital] = useState('');
    const [riskPercentage, setRiskPercentage] = useState('1'); // 1% default
    const [riskEntryPrice, setRiskEntryPrice] = useState('');
    const [riskStopLoss, setRiskStopLoss] = useState('');
    const [riskResult, setRiskResult] = useState(null);

    // Retirement Fund Calculator State
    const [retireMonthlyExpense, setRetireMonthlyExpense] = useState('');
    const [retireInflation, setRetireInflation] = useState('6');
    const [retireYears, setRetireYears] = useState('');
    const [retireCurrentSavings, setRetireCurrentSavings] = useState('');
    const [retireReturn, setRetireReturn] = useState('10');
    const [retireResult, setRetireResult] = useState(null);
    const [retireSavingsResult, setRetireSavingsResult] = useState(null);
    const [retireProjections, setRetireProjections] = useState(null);

    // Load tool state from localStorage on mount
    useEffect(() => {
        const savedAraPrice = localStorage.getItem('tool_ara_price');
        if (savedAraPrice) setAraPrice(savedAraPrice);

        const savedAraType = localStorage.getItem('tool_ara_type');
        if (savedAraType) setAraType(savedAraType);

        const savedAraDays = localStorage.getItem('tool_ara_days');
        if (savedAraDays) setAraDays(parseInt(savedAraDays));

        const savedAvgEntries = localStorage.getItem('tool_avg_entries');
        if (savedAvgEntries) {
            try {
                setAvgEntries(JSON.parse(savedAvgEntries));
            } catch (e) {
                console.error('Error parsing saved avgEntries', e);
            }
        }

        const savedTargetPrice = localStorage.getItem('tool_target_price');
        if (savedTargetPrice) setTargetPrice(savedTargetPrice);

        const savedRetireMonthlyExpense = localStorage.getItem('tool_retire_monthly');
        if (savedRetireMonthlyExpense) setRetireMonthlyExpense(savedRetireMonthlyExpense);

        const savedRetireInflation = localStorage.getItem('tool_retire_inflation');
        if (savedRetireInflation) setRetireInflation(savedRetireInflation);

        const savedRetireYears = localStorage.getItem('tool_retire_years');
        if (savedRetireYears) setRetireYears(savedRetireYears);

        const savedRetireCurrentSavings = localStorage.getItem('tool_retire_savings');
        if (savedRetireCurrentSavings) setRetireCurrentSavings(savedRetireCurrentSavings);

        const savedRetireReturn = localStorage.getItem('tool_retire_return');
        if (savedRetireReturn) setRetireReturn(savedRetireReturn);

        // Load Average Down State
        const savedAvgDownCurrentPrice = localStorage.getItem('tool_avg_down_current_price');
        if (savedAvgDownCurrentPrice) setAvgDownCurrentPrice(savedAvgDownCurrentPrice);
        const savedAvgDownCurrentLot = localStorage.getItem('tool_avg_down_current_lot');
        if (savedAvgDownCurrentLot) setAvgDownCurrentLot(savedAvgDownCurrentLot);
        const savedAvgDownTargetAvg = localStorage.getItem('tool_avg_down_target_avg');
        if (savedAvgDownTargetAvg) setAvgDownTargetAvg(savedAvgDownTargetAvg);

        // Load Risk Calc State
        const savedRiskCapital = localStorage.getItem('tool_risk_capital');
        if (savedRiskCapital) setRiskCapital(savedRiskCapital);
        const savedRiskPercentage = localStorage.getItem('tool_risk_percentage');
        if (savedRiskPercentage) setRiskPercentage(savedRiskPercentage);
    }, []);

    // Save states to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('tool_ara_price', araPrice);
    }, [araPrice]);

    useEffect(() => {
        localStorage.setItem('tool_ara_type', araType);
    }, [araType]);

    useEffect(() => {
        localStorage.setItem('tool_ara_days', araDays.toString());
    }, [araDays]);

    useEffect(() => {
        localStorage.setItem('tool_avg_entries', JSON.stringify(avgEntries));
    }, [avgEntries]);

    useEffect(() => {
        localStorage.setItem('tool_target_price', targetPrice);
    }, [targetPrice]);

    useEffect(() => {
        localStorage.setItem('tool_avg_down_current_price', avgDownCurrentPrice);
    }, [avgDownCurrentPrice]);

    useEffect(() => {
        localStorage.setItem('tool_avg_down_current_lot', avgDownCurrentLot);
    }, [avgDownCurrentLot]);

    useEffect(() => {
        localStorage.setItem('tool_avg_down_target_avg', avgDownTargetAvg);
    }, [avgDownTargetAvg]);

    useEffect(() => {
        localStorage.setItem('tool_risk_capital', riskCapital);
    }, [riskCapital]);

    useEffect(() => {
        localStorage.setItem('tool_risk_percentage', riskPercentage);
    }, [riskPercentage]);

    useEffect(() => {
        localStorage.setItem('tool_retire_monthly', retireMonthlyExpense);
    }, [retireMonthlyExpense]);

    useEffect(() => {
        localStorage.setItem('tool_retire_inflation', retireInflation);
    }, [retireInflation]);

    useEffect(() => {
        localStorage.setItem('tool_retire_years', retireYears);
    }, [retireYears]);

    useEffect(() => {
        localStorage.setItem('tool_retire_savings', retireCurrentSavings);
    }, [retireCurrentSavings]);

    useEffect(() => {
        localStorage.setItem('tool_retire_return', retireReturn);
    }, [retireReturn]);

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

    // Average Down Planner Functions
    const handleCalculateAvgDown = () => {
        const currentPrice = parseFloat(avgDownCurrentPrice);
        const currentLot = parseFloat(avgDownCurrentLot);
        const targetAvg = parseFloat(avgDownTargetAvg);

        if (!currentPrice || !currentLot || !targetAvg) {
            alert('Mohon lengkapi semua data!');
            return;
        }

        if (targetAvg >= currentPrice) {
            alert('Target average harus lebih KECIL dari harga rata-rata saat ini!');
            return;
        }

        const results = calculateTargetAverageDown(currentPrice, currentLot, targetAvg);
        setAvgDownResult(results);
    };

    const handleResetAvgDown = () => {
        setAvgDownCurrentPrice('');
        setAvgDownCurrentLot('');
        setAvgDownTargetAvg('');
        setAvgDownResult(null);
    };

    // Risk & Position Sizing Functions
    const handleCalculateRisk = () => {
        const capital = parseFloat(parseRupiahInput(riskCapital));
        const risk = parseFloat(riskPercentage);
        const entry = parseFloat(riskEntryPrice);
        const stopLoss = parseFloat(riskStopLoss);

        if (!capital || !entry || !stopLoss) {
            alert('Mohon lengkapi data modal, entry, dan stop loss!');
            return;
        }

        if (entry <= stopLoss) {
            alert('Harga Entry harus lebih besar dari Stop Loss (Long Position)!');
            return;
        }

        const result = calculatePositionSize(capital, risk, entry, stopLoss);
        setRiskResult(result);
    };

    const handleResetRisk = () => {
        setRiskCapital('');
        setRiskPercentage('1');
        setRiskEntryPrice('');
        setRiskStopLoss('');
        setRiskResult(null);
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


                    {/* Average Down Planner */}
                    <div className="card mb-xl animate-slide-up" style={{ animationDelay: '120ms' }}>
                        <div className="card-header">
                            <h2 className="card-title">📉 Average Down Planner</h2>
                        </div>
                        <div className="card-body">
                            <p className="text-muted mb-lg" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Hitung berapa lot yang harus dibeli di harga bawah untuk menurunkan harga rata-rata ke level target.
                            </p>

                            <div className="grid grid-3 mb-lg">
                                <div className="form-group">
                                    <label className="form-label">Avg Price Saat Ini</label>
                                    <input
                                        type="number"
                                        value={avgDownCurrentPrice}
                                        onChange={(e) => setAvgDownCurrentPrice(e.target.value)}
                                        placeholder="1000"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Total Lot Dimiliki</label>
                                    <input
                                        type="number"
                                        value={avgDownCurrentLot}
                                        onChange={(e) => setAvgDownCurrentLot(e.target.value)}
                                        placeholder="100"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target Avg Price</label>
                                    <input
                                        type="number"
                                        value={avgDownTargetAvg}
                                        onChange={(e) => setAvgDownTargetAvg(e.target.value)}
                                        placeholder="800"
                                        className="form-input"
                                    />
                                    <small className="text-muted">Target harus &lt; Avg saat ini</small>
                                </div>
                            </div>

                            <div className="form-group flex items-end gap-sm mb-lg">
                                <button onClick={handleCalculateAvgDown} className="btn btn-primary">
                                    📉 Hitung Skenario
                                </button>
                                <button onClick={handleResetAvgDown} className="btn btn-secondary">
                                    🔄 Reset
                                </button>
                            </div>

                            {avgDownResult && (
                                <div className="mt-lg">
                                    <h4 className="mb-md">Skenario Pembelian (Top 10)</h4>
                                    {avgDownResult.length === 0 ? (
                                        <p className="text-muted">Tidak ditemukan skenario yang logis dalam rentang lot wajar.</p>
                                    ) : (
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Beli (Lot)</th>
                                                        <th>Di Harga (Price)</th>
                                                        <th>Modal Tambahan</th>
                                                        <th>Total Lot Akhir</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {avgDownResult.map((res, idx) => (
                                                        <tr key={idx}>
                                                            <td className="font-bold text-primary">+{res.lot} lot</td>
                                                            <td>@{formatRupiah(res.price)}</td>
                                                            <td>{formatRupiah(res.lot * res.price * 100)}</td>
                                                            <td>{formatNumber(res.totalLot)} lot</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Risk & Position Sizing Calculator */}
                    <div className="card mb-xl animate-slide-up" style={{ animationDelay: '140ms' }}>
                        <div className="card-header">
                            <h2 className="card-title">🎯 Risk & Position Sizing</h2>
                        </div>
                        <div className="card-body">
                            <p className="text-muted mb-lg" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Tentukan berapa banyak lot yang boleh dibeli agar risiko tidak melebihi batas toleransi (Money Management).
                            </p>

                            <div className="grid grid-4 mb-lg">
                                <div className="form-group">
                                    <label className="form-label">Modal Trading (Rp)</label>
                                    <input
                                        type="text"
                                        value={riskCapital}
                                        onChange={handleRupiahChange(setRiskCapital)}
                                        placeholder="100.000.000"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Risiko per Trade (%)</label>
                                    <input
                                        type="number"
                                        value={riskPercentage}
                                        onChange={(e) => setRiskPercentage(e.target.value)}
                                        placeholder="1"
                                        step="0.1"
                                        className="form-input"
                                    />
                                    <small className="text-muted">Disarankan 1-2%</small>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Harga Entry</label>
                                    <input
                                        type="number"
                                        value={riskEntryPrice}
                                        onChange={(e) => setRiskEntryPrice(e.target.value)}
                                        placeholder="1000"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stop Loss</label>
                                    <input
                                        type="number"
                                        value={riskStopLoss}
                                        onChange={(e) => setRiskStopLoss(e.target.value)}
                                        placeholder="950"
                                        className="form-input"
                                        style={{ borderColor: 'var(--color-danger)' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group flex items-end gap-sm mb-lg">
                                <button onClick={handleCalculateRisk} className="btn btn-primary">
                                    🎯 Hitung Posisi
                                </button>
                                <button onClick={handleResetRisk} className="btn btn-secondary">
                                    🔄 Reset
                                </button>
                            </div>

                            {riskResult && (
                                <div className="mt-lg">
                                    <div className="grid grid-2 gap-lg mb-lg">
                                        <div className="summary-card" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Maksimal Beli</p>
                                            <p className="font-bold text-primary" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                                {formatNumber(riskResult.maxLots)} Lot
                                            </p>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                                ({formatRupiah(riskResult.positionValue)})
                                            </p>
                                        </div>
                                        <div className="summary-card" style={{ padding: 'var(--space-md)', background: 'var(--color-danger-light)', borderLeft: '4px solid var(--color-danger)' }}>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Risiko Penurunan</p>
                                            <p className="font-bold text-danger" style={{ fontSize: 'var(--font-size-xl)' }}>
                                                -{formatRupiah(riskResult.projectedLoss)}
                                            </p>
                                            <p className="text-danger" style={{ fontSize: 'var(--font-size-sm)' }}>
                                                {riskPercentage}% dari modal
                                            </p>
                                        </div>
                                    </div>

                                    <h4 className="mb-sm">Risk : Reward Targets (1:2 Ratio recommended)</h4>
                                    <div className="grid grid-3 gap-md">
                                        {riskResult.targets.map((target, idx) => (
                                            <div key={idx} className="p-md border rounded" style={{ borderColor: idx === 1 ? 'var(--color-success)' : 'var(--border-color)' }}>
                                                <p className="font-bold mb-xs">{target.ratio}</p>
                                                <p className="text-lg">TP: {formatRupiah(target.price)}</p>
                                                <p className="text-success text-sm">+{formatRupiah(target.profit)}</p>
                                            </div>
                                        ))}
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
