'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { useAuth } from '../components/AuthProvider';
import ProtectedRoute from '../components/ProtectedRoute';
import {
    formatRupiah,
    formatPercentage,
    formatNumber,
    formatDate,
    calculatePL,
    calculateTotalRealizedPL,
    calculateWinRate,
    getBiggestWinLoss,
} from '../lib/calculations';
import {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
} from '../lib/storage';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

function PLCalculatorContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Quick calculator state
    const [calcForm, setCalcForm] = useState({
        stockCode: '',
        buyPrice: '',
        sellPrice: '',
        lotQty: '',
        buyFee: '0.15',
        sellFee: '0.25',
    });
    const [calcResult, setCalcResult] = useState(null);

    // Transactions state
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        stockCode: '',
        stockName: '',
        buyPrice: '',
        sellPrice: '',
        lotQty: '',
        buyFee: '0.15',
        sellFee: '0.25',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: '',
        entryReason: 'fundamental', // breakout, reversal, fundamental, news, etc
        psychology: 'neutral', // confident, fear, greed, neutral
    });

    // Stats
    const [stats, setStats] = useState({
        totalPL: 0,
        profit: 0,
        loss: 0,
        winRate: 0,
        biggestWin: null,
        biggestLoss: null,
        allocationData: null,
        monthlyData: null,
        winLossData: null,
    });

    // Load form data from localStorage on mount
    useEffect(() => {
        const savedCalcForm = localStorage.getItem('pl_calc_form');
        if (savedCalcForm) {
            try {
                setCalcForm(JSON.parse(savedCalcForm));
            } catch (e) {
                console.error('Error parsing saved calcForm', e);
            }
        }

        const savedFormData = localStorage.getItem('pl_form_data');
        if (savedFormData) {
            try {
                setFormData(JSON.parse(savedFormData));
            } catch (e) {
                console.error('Error parsing saved formData', e);
            }
        }
    }, []);

    // Save calcForm to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('pl_calc_form', JSON.stringify(calcForm));
    }, [calcForm]);

    // Save formData to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('pl_form_data', JSON.stringify(formData));
    }, [formData]);

    // Load transactions on mount
    useEffect(() => {
        loadTransactions();
    }, [user]);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const data = await getTransactions();
            setTransactions(data);
            updateStats(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (data) => {
        const plStats = calculateTotalRealizedPL(data);
        const winRate = calculateWinRate(data);
        const { biggestWin, biggestLoss } = getBiggestWinLoss(data);

        // Prepare Chart Data
        // 1. Allocation (Current Holdings)
        const holdings = data.filter(t => !t.sellPrice);
        const allocationMap = {};
        holdings.forEach(t => {
            const value = t.buyPrice * t.lotQty * 100;
            allocationMap[t.stockCode] = (allocationMap[t.stockCode] || 0) + value;
        });

        const allocationData = {
            labels: Object.keys(allocationMap),
            datasets: [{
                data: Object.values(allocationMap),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ],
            }]
        };

        // 2. Win/Loss Ratio
        const wins = data.filter(t => t.sellPrice && calculatePL(t.buyPrice, t.sellPrice, t.lotQty).pl > 0).length;
        const losses = data.filter(t => t.sellPrice && calculatePL(t.buyPrice, t.sellPrice, t.lotQty).pl <= 0).length;

        const winLossData = {
            labels: ['Win', 'Loss'],
            datasets: [{
                data: [wins, losses],
                backgroundColor: ['#4ade80', '#f87171'],
            }]
        };

        setStats({
            totalPL: plStats.total,
            profit: plStats.profit,
            loss: plStats.loss,
            winRate,
            biggestWin,
            biggestLoss,
            allocationData,
            winLossData,
        });
    };

    const handleExportCSV = () => {
        if (transactions.length === 0) {
            alert('Belum ada data untuk diexport!');
            return;
        }

        const headers = ['Tanggal', 'Kode', 'Nama', 'Buy Price', 'Sell Price', 'Lot', 'Fee Beli', 'Fee Jual', 'Net Buy', 'Net Sell', 'P/L', '%', 'Alasan', 'Psikologi', 'Catatan'];
        const csvRows = [headers.join(',')];

        transactions.forEach(t => {
            const result = t.sellPrice ? calculatePL(t.buyPrice, t.sellPrice, t.lotQty, t.buyFee, t.sellFee) : null;
            const row = [
                formatDate(t.transactionDate),
                t.stockCode,
                t.stockName || '-',
                t.buyPrice,
                t.sellPrice || '-',
                t.lotQty,
                t.buyFee,
                t.sellFee,
                result ? result.totalBuyCost : '-',
                result ? result.netSellValue : '-',
                result ? result.pl : '-',
                result ? result.plPercentage.toFixed(2) + '%' : '-',
                t.entryReason || '-',
                t.psychology || '-',
                `"${t.notes || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Quick calculator
    const handleCalcChange = (e) => {
        const { name, value } = e.target;
        setCalcForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        const { buyPrice, sellPrice, lotQty, buyFee, sellFee } = calcForm;

        if (!buyPrice || !sellPrice || !lotQty) {
            alert('Mohon isi harga beli, harga jual, dan jumlah lot!');
            return;
        }

        const result = calculatePL(
            parseFloat(buyPrice),
            parseFloat(sellPrice),
            parseFloat(lotQty),
            parseFloat(buyFee) || 0.15,
            parseFloat(sellFee) || 0.25
        );
        setCalcResult(result);
    };

    const handleSaveCalculation = async () => {
        if (!calcResult || !calcForm.stockCode) {
            alert('Mohon isi kode saham dan hitung terlebih dahulu!');
            return;
        }

        setSaving(true);
        try {
            const newTransaction = await addTransaction({
                stockCode: calcForm.stockCode.toUpperCase(),
                stockName: '',
                buyPrice: parseFloat(calcForm.buyPrice),
                sellPrice: parseFloat(calcForm.sellPrice),
                lotQty: parseFloat(calcForm.lotQty),
                buyFee: parseFloat(calcForm.buyFee) || 0.15,
                sellFee: parseFloat(calcForm.sellFee) || 0.25,
                transactionDate: new Date().toISOString(),
            });

            if (newTransaction) {
                const updatedTransactions = [newTransaction, ...transactions];
                setTransactions(updatedTransactions);
                updateStats(updatedTransactions);
            }

            // Reset form
            setCalcForm({
                stockCode: '',
                buyPrice: '',
                sellPrice: '',
                lotQty: '',
                buyFee: '0.15',
                sellFee: '0.25',
            });
            setCalcResult(null);
        } catch (error) {
            console.error('Error saving:', error);
            alert('Gagal menyimpan transaksi!');
        } finally {
            setSaving(false);
        }
    };

    // Transaction form handlers
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const transactionData = {
                stockCode: formData.stockCode.toUpperCase(),
                stockName: formData.stockName,
                buyPrice: parseFloat(formData.buyPrice),
                sellPrice: formData.sellPrice ? parseFloat(formData.sellPrice) : null,
                lotQty: parseFloat(formData.lotQty),
                buyFee: parseFloat(formData.buyFee) || 0.15,
                sellFee: parseFloat(formData.sellFee) || 0.25,
                transactionDate: formData.transactionDate,
                notes: formData.notes,
            };

            let updatedTransactions;
            if (editingId) {
                const updated = await updateTransaction(editingId, transactionData);
                if (updated) {
                    updatedTransactions = transactions.map(t =>
                        t.id === editingId ? updated : t
                    );
                }
            } else {
                const newTransaction = await addTransaction(transactionData);
                if (newTransaction) {
                    updatedTransactions = [newTransaction, ...transactions];
                }
            }

            if (updatedTransactions) {
                setTransactions(updatedTransactions);
                updateStats(updatedTransactions);
            }
            resetForm();
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal menyimpan!');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (transaction) => {
        setFormData({
            stockCode: transaction.stockCode,
            stockName: transaction.stockName || '',
            buyPrice: transaction.buyPrice.toString(),
            sellPrice: transaction.sellPrice?.toString() || '',
            lotQty: transaction.lotQty.toString(),
            buyFee: transaction.buyFee?.toString() || '0.15',
            sellFee: transaction.sellFee?.toString() || '0.25',
            transactionDate: transaction.transactionDate?.split('T')[0] || '',
            transactionDate: transaction.transactionDate?.split('T')[0] || '',
            notes: transaction.notes || '',
            entryReason: transaction.entryReason || 'fundamental',
            psychology: transaction.psychology || 'neutral',
        });
        setEditingId(transaction.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            const result = await deleteTransaction(id);
            if (result !== false) {
                const updatedTransactions = transactions.filter(t => t.id !== id);
                setTransactions(updatedTransactions);
                updateStats(updatedTransactions);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            stockCode: '',
            stockName: '',
            buyPrice: '',
            sellPrice: '',
            lotQty: '',
            buyFee: '0.15',
            sellFee: '0.25',
            transactionDate: new Date().toISOString().split('T')[0],
            transactionDate: new Date().toISOString().split('T')[0],
            notes: '',
            entryReason: 'fundamental',
            psychology: 'neutral',
        });
        setEditingId(null);
        setShowModal(false);
    };

    if (authLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="page">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1 className="page-title">P/L Calculator</h1>
                        <p className="page-subtitle">Hitung profit/loss dari transaksi saham Anda</p>
                    </div>

                    {/* Quick Calculator */}
                    <div className="card mb-xl animate-slide-up">
                        <div className="card-header">
                            <h2 className="card-title">🧮 Quick Calculator</h2>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleCalculate}>
                                <div className="grid grid-3">
                                    <div className="form-group">
                                        <label className="form-label">Kode Saham</label>
                                        <input
                                            type="text"
                                            name="stockCode"
                                            value={calcForm.stockCode}
                                            onChange={handleCalcChange}
                                            placeholder="BBCA"
                                            className="form-input"
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Harga Beli (Rp)</label>
                                        <input
                                            type="number"
                                            name="buyPrice"
                                            value={calcForm.buyPrice}
                                            onChange={handleCalcChange}
                                            placeholder="8000"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Harga Jual (Rp)</label>
                                        <input
                                            type="number"
                                            name="sellPrice"
                                            value={calcForm.sellPrice}
                                            onChange={handleCalcChange}
                                            placeholder="8500"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Jumlah Lot</label>
                                        <input
                                            type="number"
                                            name="lotQty"
                                            value={calcForm.lotQty}
                                            onChange={handleCalcChange}
                                            placeholder="10"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fee Beli (%)</label>
                                        <input
                                            type="number"
                                            name="buyFee"
                                            value={calcForm.buyFee}
                                            onChange={handleCalcChange}
                                            placeholder="0.15"
                                            step="0.01"
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fee Jual (%)</label>
                                        <input
                                            type="number"
                                            name="sellFee"
                                            value={calcForm.sellFee}
                                            onChange={handleCalcChange}
                                            placeholder="0.25"
                                            step="0.01"
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-md mt-lg">
                                    <button type="submit" className="btn btn-primary">
                                        🔢 Hitung P/L
                                    </button>
                                    {calcResult && (
                                        <button
                                            type="button"
                                            onClick={handleSaveCalculation}
                                            className="btn btn-success"
                                            disabled={saving}
                                        >
                                            {saving ? '⏳ Menyimpan...' : '💾 Simpan ke Riwayat'}
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* Calculator Result */}
                            {calcResult && (
                                <div className="mt-xl" style={{
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--space-lg)'
                                }}>
                                    <h3 className="mb-md">Hasil Perhitungan</h3>
                                    <div className="grid grid-4">
                                        <div>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Total Beli</p>
                                            <p className="font-semibold">{formatRupiah(calcResult.totalBuyCost)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Total Jual Bersih</p>
                                            <p className="font-semibold">{formatRupiah(calcResult.netSellValue)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Profit/Loss</p>
                                            <p className={`font-bold ${calcResult.pl >= 0 ? 'text-success' : 'text-danger'}`}
                                                style={{ fontSize: 'var(--font-size-xl)' }}>
                                                {formatRupiah(calcResult.pl)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Persentase</p>
                                            <p className={`font-bold ${calcResult.plPercentage >= 0 ? 'text-success' : 'text-danger'}`}
                                                style={{ fontSize: 'var(--font-size-xl)' }}>
                                                {formatPercentage(calcResult.plPercentage)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-lg mt-md" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                        <span>Fee Beli: {formatRupiah(calcResult.buyFeeAmount)}</span>
                                        <span>Fee Jual: {formatRupiah(calcResult.sellFeeAmount)}</span>
                                        <span>Jumlah Lembar: {formatNumber(calcResult.shares)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-4 mb-xl">
                        <div className="summary-card animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="summary-card-icon">💰</div>
                            <p className="summary-card-label">Total P/L</p>
                            <p className={`summary-card-value ${stats.totalPL >= 0 ? 'text-success' : 'text-danger'}`}>
                                {formatRupiah(stats.totalPL)}
                            </p>
                        </div>
                        <div className="summary-card animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="summary-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>📈</div>
                            <p className="summary-card-label">Total Profit</p>
                            <p className="summary-card-value text-success">{formatRupiah(stats.profit)}</p>
                        </div>
                        <div className="summary-card animate-slide-up" style={{ animationDelay: '300ms' }}>
                            <div className="summary-card-icon" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>📉</div>
                            <p className="summary-card-label">Total Loss</p>
                            <p className="summary-card-value text-danger">{formatRupiah(stats.loss)}</p>
                        </div>
                        <div className="summary-card animate-slide-up" style={{ animationDelay: '400ms' }}>
                            <div className="summary-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>🎯</div>
                            <p className="summary-card-label">Win Rate</p>
                            <p className="summary-card-value">{stats.winRate.toFixed(1)}%</p>
                        </div>
                    </div>


                    {/* Analytics Charts */}
                    <div className="grid grid-2 gap-xl mb-xl">
                        <div className="card animate-slide-up" style={{ animationDelay: '450ms' }}>
                            <div className="card-header">
                                <h3 className="card-title">📊 Alokasi Portfolio</h3>
                            </div>
                            <div className="card-body flex justify-center" style={{ height: '300px' }}>
                                {stats.allocationData && stats.allocationData.datasets[0].data.length > 0 ? (
                                    <Pie data={stats.allocationData} options={{ maintainAspectRatio: false }} />
                                ) : (
                                    <p className="text-muted self-center">Belum ada saham yang di-hold.</p>
                                )}
                            </div>
                        </div>
                        <div className="card animate-slide-up" style={{ animationDelay: '500ms' }}>
                            <div className="card-header">
                                <h3 className="card-title">⚖️ Win vs Loss Ratio</h3>
                            </div>
                            <div className="card-body flex justify-center" style={{ height: '300px' }}>
                                {stats.winLossData && (stats.winLossData.datasets[0].data[0] > 0 || stats.winLossData.datasets[0].data[1] > 0) ? (
                                    <Doughnut data={stats.winLossData} options={{ maintainAspectRatio: false }} />
                                ) : (
                                    <p className="text-muted self-center">Belum ada transaksi selesai.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="card animate-slide-up" style={{ animationDelay: '500ms' }}>
                        <div className="card-header flex justify-between items-center">
                            <h2 className="card-title">📋 Riwayat Transaksi</h2>
                            <div className="flex gap-sm">
                                <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
                                    📥 Export CSV
                                </button>
                                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                    ➕ Tambah Transaksi
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="empty-state">
                                    <div className="loading-spinner"></div>
                                    <p>Memuat data...</p>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📊</div>
                                    <h3 className="empty-state-title">Belum Ada Transaksi</h3>
                                    <p className="empty-state-description">
                                        Mulai catat transaksi saham Anda untuk melihat statistik P/L
                                    </p>
                                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                        ➕ Tambah Transaksi Pertama
                                    </button>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Tanggal</th>
                                                <th>Kode</th>
                                                <th>Harga Beli</th>
                                                <th>Harga Jual</th>
                                                <th>Lot</th>
                                                <th>Total Beli</th>
                                                <th>Total Bersih</th>
                                                <th>P/L</th>
                                                <th>%</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map(transaction => {
                                                const result = transaction.sellPrice
                                                    ? calculatePL(transaction.buyPrice, transaction.sellPrice, transaction.lotQty, transaction.buyFee, transaction.sellFee)
                                                    : null;
                                                return (
                                                    <tr key={transaction.id}>
                                                        <td>{formatDate(transaction.transactionDate)}</td>
                                                        <td><span className="font-semibold">{transaction.stockCode}</span></td>
                                                        <td>{formatRupiah(transaction.buyPrice)}</td>
                                                        <td>{transaction.sellPrice ? formatRupiah(transaction.sellPrice) : <span className="badge badge-warning">Hold</span>}</td>
                                                        <td>{transaction.lotQty}</td>
                                                        <td>{result ? formatRupiah(result.totalBuyCost) : '-'}</td>
                                                        <td>{result ? formatRupiah(result.netSellValue) : '-'}</td>
                                                        <td className={result ? (result.pl >= 0 ? 'text-success' : 'text-danger') : ''}>
                                                            {result ? formatRupiah(result.pl) : '-'}
                                                        </td>
                                                        <td className={result ? (result.plPercentage >= 0 ? 'text-success' : 'text-danger') : ''}>
                                                            {result ? formatPercentage(result.plPercentage) : '-'}
                                                        </td>
                                                        <td>
                                                            <div className="table-actions">
                                                                <button
                                                                    className="btn btn-ghost btn-sm"
                                                                    onClick={() => handleEdit(transaction)}
                                                                    title="Edit"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    className="btn btn-ghost btn-sm"
                                                                    onClick={() => handleDelete(transaction.id)}
                                                                    title="Hapus"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main >

            {/* Modal */}
            {
                showModal && (
                    <div className="modal-overlay" onClick={() => resetForm()}>
                        <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{editingId ? '✏️ Edit Transaksi' : '➕ Tambah Transaksi'}</h3>
                                <button className="modal-close" onClick={resetForm}>✕</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Kode Saham *</label>
                                            <input
                                                type="text"
                                                name="stockCode"
                                                value={formData.stockCode}
                                                onChange={handleFormChange}
                                                placeholder="BBCA"
                                                className="form-input"
                                                style={{ textTransform: 'uppercase' }}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Nama Emiten</label>
                                            <input
                                                type="text"
                                                name="stockName"
                                                value={formData.stockName}
                                                onChange={handleFormChange}
                                                placeholder="Bank Central Asia"
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Harga Beli (Rp) *</label>
                                            <input
                                                type="number"
                                                name="buyPrice"
                                                value={formData.buyPrice}
                                                onChange={handleFormChange}
                                                placeholder="8000"
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Harga Jual (Rp)</label>
                                            <input
                                                type="number"
                                                name="sellPrice"
                                                value={formData.sellPrice}
                                                onChange={handleFormChange}
                                                placeholder="8500"
                                                className="form-input"
                                            />
                                            <p className="form-hint">Kosongkan jika masih hold</p>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Jumlah Lot *</label>
                                            <input
                                                type="number"
                                                name="lotQty"
                                                value={formData.lotQty}
                                                onChange={handleFormChange}
                                                placeholder="10"
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Tanggal Transaksi</label>
                                            <input
                                                type="date"
                                                name="transactionDate"
                                                value={formData.transactionDate}
                                                onChange={handleFormChange}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Fee Beli (%)</label>
                                            <input
                                                type="number"
                                                name="buyFee"
                                                value={formData.buyFee}
                                                onChange={handleFormChange}
                                                placeholder="0.15"
                                                step="0.01"
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Fee Jual (%)</label>
                                            <input
                                                type="number"
                                                name="sellFee"
                                                value={formData.sellFee}
                                                onChange={handleFormChange}
                                                placeholder="0.25"
                                                step="0.01"
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Alasan Entry</label>
                                            <select
                                                name="entryReason"
                                                value={formData.entryReason}
                                                onChange={handleFormChange}
                                                className="form-input form-select"
                                            >
                                                <option value="fundamental">Fundamental (Undervalued/Growth)</option>
                                                <option value="breakout">Technical Breakout</option>
                                                <option value="support">Technical Rebound Support</option>
                                                <option value="trend">Trend Following</option>
                                                <option value="news">News/Sentiment</option>
                                                <option value="dividend">Dividend Hunting</option>
                                                <option value="fomo">FOMO / Ikut-ikutan</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Kondisi Psikologis</label>
                                            <select
                                                name="psychology"
                                                value={formData.psychology}
                                                onChange={handleFormChange}
                                                className="form-input form-select"
                                            >
                                                <option value="neutral">Neutral / Calm</option>
                                                <option value="confident">Confident</option>
                                                <option value="fear">Fear / Anxious</option>
                                                <option value="greed">Greedy</option>
                                                <option value="doubt">Doubting</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Catatan</label>
                                        <input
                                            type="text"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleFormChange}
                                            placeholder="Catatan tambahan..."
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? '⏳ Menyimpan...' : (editingId ? '💾 Simpan Perubahan' : '➕ Tambah Transaksi')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default function PLCalculatorPage() {
    return (
        <ProtectedRoute>
            <PLCalculatorContent />
        </ProtectedRoute>
    );
}
