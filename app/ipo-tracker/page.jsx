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
    calculateIPOPL,
    calculateIPOSummary,
} from '../lib/calculations';
import {
    getIPOData,
    addIPO,
    updateIPO,
    deleteIPO,
} from '../lib/storage';

function IPOTrackerContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [ipoList, setIpoList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [summary, setSummary] = useState({
        totalIPOValue: 0,
        totalCurrentValue: 0,
        totalRealizedPL: 0,
        totalUnrealizedPL: 0,
        totalPL: 0,
        totalPLPercentage: 0,
        bestIPO: null,
        worstIPO: null,
    });

    const [formData, setFormData] = useState({
        stockCode: '',
        stockName: '',
        ipoPrice: '',
        lotQty: '',
        listingDate: '',
        status: 'hold',
        currentPrice: '',
        avgSellPrice: '',
        soldLotQty: '',
        sellDate: '',
        notes: '',
    });

    // Load form data from localStorage on mount
    useEffect(() => {
        const savedFormData = localStorage.getItem('ipo_form_data');
        if (savedFormData) {
            try {
                setFormData(JSON.parse(savedFormData));
            } catch (e) {
                console.error('Error parsing saved ipo_form_data', e);
            }
        }
    }, []);

    // Save formData to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('ipo_form_data', JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        loadIPOData();
    }, [user]);

    const loadIPOData = async () => {
        setLoading(true);
        try {
            const data = await getIPOData();
            setIpoList(data);
            setSummary(calculateIPOSummary(data));
        } catch (error) {
            console.error('Error loading IPO data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const ipoData = {
                stockCode: formData.stockCode.toUpperCase(),
                stockName: formData.stockName,
                ipoPrice: parseFloat(formData.ipoPrice),
                lotQty: parseFloat(formData.lotQty),
                listingDate: formData.listingDate,
                status: formData.status,
                currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : null,
                avgSellPrice: formData.avgSellPrice ? parseFloat(formData.avgSellPrice) : null,
                soldLotQty: formData.soldLotQty ? parseFloat(formData.soldLotQty) : null,
                sellDate: formData.sellDate || null,
                notes: formData.notes,
            };

            let updatedList;
            if (editingId) {
                const updated = await updateIPO(editingId, ipoData);
                if (updated) {
                    updatedList = ipoList.map(i => i.id === editingId ? updated : i);
                }
            } else {
                const newIPO = await addIPO(ipoData);
                if (newIPO) {
                    updatedList = [newIPO, ...ipoList];
                }
            }

            if (updatedList) {
                setIpoList(updatedList);
                setSummary(calculateIPOSummary(updatedList));
            }
            resetForm();
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal menyimpan!');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (ipo) => {
        setFormData({
            stockCode: ipo.stockCode,
            stockName: ipo.stockName || '',
            ipoPrice: ipo.ipoPrice.toString(),
            lotQty: ipo.lotQty.toString(),
            listingDate: ipo.listingDate?.split('T')[0] || '',
            status: ipo.status || 'hold',
            currentPrice: ipo.currentPrice?.toString() || '',
            avgSellPrice: ipo.avgSellPrice?.toString() || '',
            soldLotQty: ipo.soldLotQty?.toString() || '',
            sellDate: ipo.sellDate?.split('T')[0] || '',
            notes: ipo.notes || '',
        });
        setEditingId(ipo.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data IPO ini?')) {
            const result = await deleteIPO(id);
            if (result !== false) {
                const updatedList = ipoList.filter(i => i.id !== id);
                setIpoList(updatedList);
                setSummary(calculateIPOSummary(updatedList));
            }
        }
    };

    const handleUpdateCurrentPrice = async (id, price) => {
        const updated = await updateIPO(id, { currentPrice: parseFloat(price) });
        if (updated) {
            const updatedList = ipoList.map(i => i.id === id ? updated : i);
            setIpoList(updatedList);
            setSummary(calculateIPOSummary(updatedList));
        }
    };

    const handleExportCSV = () => {
        if (ipoList.length === 0) {
            alert('Belum ada data untuk diexport!');
            return;
        }

        const headers = ['Kode', 'Nama', 'Listing Date', 'IPO Price', 'Lot', 'Status', 'Sell Price', 'Sold Lot', 'Sell Date', 'Total Modal', 'P/L', '%', 'Catatan'];
        const csvRows = [headers.join(',')];

        ipoList.forEach(ipo => {
            const result = calculateIPOPL(ipo);
            const row = [
                ipo.stockCode,
                ipo.stockName || '-',
                formatDate(ipo.listingDate),
                ipo.ipoPrice,
                ipo.lotQty,
                ipo.status,
                ipo.avgSellPrice || '-',
                ipo.soldLotQty || '-',
                ipo.sellDate ? formatDate(ipo.sellDate) : '-',
                result.ipoValue,
                result.totalPL,
                result.plPercentage.toFixed(2) + '%',
                `"${ipo.notes || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ipo_tracker_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const resetForm = () => {
        setFormData({
            stockCode: '',
            stockName: '',
            ipoPrice: '',
            lotQty: '',
            listingDate: '',
            status: 'hold',
            currentPrice: '',
            avgSellPrice: '',
            soldLotQty: '',
            sellDate: '',
            notes: '',
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
                        <h1 className="page-title">IPO Tracker</h1>
                        <p className="page-subtitle">Lacak investasi IPO Anda dari awal hingga sekarang</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-4 mb-xl">
                        <div className="summary-card animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="summary-card-icon">💵</div>
                            <p className="summary-card-label">Total Nilai IPO</p>
                            <p className="summary-card-value">{formatRupiah(summary.totalIPOValue)}</p>
                        </div>
                        <div className="summary-card animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="summary-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>✅</div>
                            <p className="summary-card-label">Realized P/L</p>
                            <p className={`summary-card-value ${summary.totalRealizedPL >= 0 ? 'text-success' : 'text-danger'}`}>
                                {formatRupiah(summary.totalRealizedPL)}
                            </p>
                        </div>
                        <div className="summary-card animate-slide-up" style={{ animationDelay: '300ms' }}>
                            <div className="summary-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>⏳</div>
                            <p className="summary-card-label">Unrealized P/L</p>
                            <p className={`summary-card-value ${summary.totalUnrealizedPL >= 0 ? 'text-success' : 'text-danger'}`}>
                                {formatRupiah(summary.totalUnrealizedPL)}
                            </p>
                        </div>
                        <div className="summary-card animate-slide-up" style={{ animationDelay: '400ms' }}>
                            <div className="summary-card-icon">💰</div>
                            <p className="summary-card-label">Total P/L</p>
                            <p className={`summary-card-value ${summary.totalPL >= 0 ? 'text-success' : 'text-danger'}`}>
                                {formatRupiah(summary.totalPL)}
                            </p>
                            <span className={`summary-card-trend ${summary.totalPLPercentage >= 0 ? 'positive' : 'negative'}`}>
                                {formatPercentage(summary.totalPLPercentage)}
                            </span>
                        </div>
                    </div>

                    {/* Best & Worst IPO */}
                    {(summary.bestIPO || summary.worstIPO) && (
                        <div className="grid grid-2 mb-xl">
                            {summary.bestIPO && (
                                <div className="card animate-slide-up" style={{
                                    borderLeft: '4px solid var(--color-success)',
                                    animationDelay: '500ms'
                                }}>
                                    <div className="flex items-center gap-md mb-md">
                                        <span style={{ fontSize: '2rem' }}>🏆</span>
                                        <div>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Best Performing IPO</p>
                                            <p className="font-bold" style={{ fontSize: 'var(--font-size-xl)' }}>
                                                {summary.bestIPO.stockCode}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-success font-semibold" style={{ fontSize: 'var(--font-size-lg)' }}>
                                        {formatRupiah(summary.bestIPO.totalPL)} ({formatPercentage(summary.bestIPO.plPercentage)})
                                    </p>
                                </div>
                            )}
                            {summary.worstIPO && (
                                <div className="card animate-slide-up" style={{
                                    borderLeft: '4px solid var(--color-danger)',
                                    animationDelay: '600ms'
                                }}>
                                    <div className="flex items-center gap-md mb-md">
                                        <span style={{ fontSize: '2rem' }}>📉</span>
                                        <div>
                                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Worst Performing IPO</p>
                                            <p className="font-bold" style={{ fontSize: 'var(--font-size-xl)' }}>
                                                {summary.worstIPO.stockCode}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-danger font-semibold" style={{ fontSize: 'var(--font-size-lg)' }}>
                                        {formatRupiah(summary.worstIPO.totalPL)} ({formatPercentage(summary.worstIPO.plPercentage)})
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* IPO List */}
                    <div className="card animate-slide-up" style={{ animationDelay: '700ms' }}>
                        <div className="card-header flex justify-between items-center">
                            <h2 className="card-title">🚀 Daftar IPO</h2>
                            <div className="flex gap-sm">
                                <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
                                    📥 Export CSV
                                </button>
                                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                    ➕ Tambah IPO
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="empty-state">
                                    <div className="loading-spinner"></div>
                                    <p>Memuat data...</p>
                                </div>
                            ) : ipoList.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🚀</div>
                                    <h3 className="empty-state-title">Belum Ada Data IPO</h3>
                                    <p className="empty-state-description">
                                        Mulai catat investasi IPO Anda untuk melihat performa
                                    </p>
                                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                        ➕ Tambah IPO Pertama
                                    </button>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Saham</th>
                                                <th>Tanggal Listing</th>
                                                <th>Harga IPO</th>
                                                <th>Lot</th>
                                                <th>Total Modal</th>
                                                <th>Status</th>
                                                <th>Harga Sekarang</th>
                                                <th>P/L</th>
                                                <th>%</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ipoList.map(ipo => {
                                                const result = calculateIPOPL(ipo);
                                                return (
                                                    <tr key={ipo.id}>
                                                        <td>
                                                            <div>
                                                                <span className="font-semibold">{ipo.stockCode}</span>
                                                                {ipo.stockName && (
                                                                    <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                                                                        {ipo.stockName}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>{formatDate(ipo.listingDate)}</td>
                                                        <td>{formatRupiah(ipo.ipoPrice)}</td>
                                                        <td>{ipo.lotQty}</td>
                                                        <td>{formatRupiah(result.ipoValue)}</td>
                                                        <td>
                                                            {ipo.status === 'hold' && <span className="badge badge-primary">Hold</span>}
                                                            {ipo.status === 'partial' && <span className="badge badge-warning">Partial</span>}
                                                            {ipo.status === 'sold' && <span className="badge badge-success">Sold</span>}
                                                        </td>
                                                        <td>
                                                            {ipo.status === 'sold' ? (
                                                                <span className="text-muted">-</span>
                                                            ) : (
                                                                <div className="flex items-center gap-xs">
                                                                    <input
                                                                        type="number"
                                                                        value={ipo.currentPrice || ''}
                                                                        onChange={(e) => handleUpdateCurrentPrice(ipo.id, e.target.value)}
                                                                        placeholder="0"
                                                                        className="form-input"
                                                                        style={{ width: '100px', padding: 'var(--space-xs)' }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className={result.totalPL >= 0 ? 'text-success' : 'text-danger'}>
                                                            {formatRupiah(result.totalPL)}
                                                        </td>
                                                        <td className={result.plPercentage >= 0 ? 'text-success' : 'text-danger'}>
                                                            {formatPercentage(result.plPercentage)}
                                                        </td>
                                                        <td>
                                                            <div className="table-actions">
                                                                <button
                                                                    className="btn btn-ghost btn-sm"
                                                                    onClick={() => handleEdit(ipo)}
                                                                    title="Edit"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    className="btn btn-ghost btn-sm"
                                                                    onClick={() => handleDelete(ipo.id)}
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
            </main>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => resetForm()}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingId ? '✏️ Edit IPO' : '➕ Tambah IPO'}</h3>
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
                                            placeholder="GOTO"
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
                                            placeholder="GoTo Gojek Tokopedia"
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Harga IPO (Rp) *</label>
                                        <input
                                            type="number"
                                            name="ipoPrice"
                                            value={formData.ipoPrice}
                                            onChange={handleFormChange}
                                            placeholder="338"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Jumlah Lot Allotment *</label>
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
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Tanggal Listing</label>
                                        <input
                                            type="date"
                                            name="listingDate"
                                            value={formData.listingDate}
                                            onChange={handleFormChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Status *</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleFormChange}
                                            className="form-input form-select"
                                            required
                                        >
                                            <option value="hold">Masih Hold</option>
                                            <option value="partial">Sebagian Terjual</option>
                                            <option value="sold">Sudah Dijual Semua</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.status === 'hold' && (
                                    <div className="form-group">
                                        <label className="form-label">Harga Saat Ini (Rp)</label>
                                        <input
                                            type="number"
                                            name="currentPrice"
                                            value={formData.currentPrice}
                                            onChange={handleFormChange}
                                            placeholder="Masukkan harga terkini"
                                            className="form-input"
                                        />
                                        <p className="form-hint">Untuk menghitung unrealized P/L</p>
                                    </div>
                                )}

                                {(formData.status === 'partial' || formData.status === 'sold') && (
                                    <>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Rata-rata Harga Jual (Rp) *</label>
                                                <input
                                                    type="number"
                                                    name="avgSellPrice"
                                                    value={formData.avgSellPrice}
                                                    onChange={handleFormChange}
                                                    placeholder="500"
                                                    className="form-input"
                                                    required
                                                />
                                            </div>
                                            {formData.status === 'partial' && (
                                                <div className="form-group">
                                                    <label className="form-label">Lot Terjual *</label>
                                                    <input
                                                        type="number"
                                                        name="soldLotQty"
                                                        value={formData.soldLotQty}
                                                        onChange={handleFormChange}
                                                        placeholder="5"
                                                        className="form-input"
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Tanggal Jual</label>
                                                <input
                                                    type="date"
                                                    name="sellDate"
                                                    value={formData.sellDate}
                                                    onChange={handleFormChange}
                                                    className="form-input"
                                                />
                                            </div>
                                            {formData.status === 'partial' && (
                                                <div className="form-group">
                                                    <label className="form-label">Harga Saat Ini (Rp)</label>
                                                    <input
                                                        type="number"
                                                        name="currentPrice"
                                                        value={formData.currentPrice}
                                                        onChange={handleFormChange}
                                                        placeholder="Untuk sisa lot yang masih hold"
                                                        className="form-input"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

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
                                    {saving ? '⏳ Menyimpan...' : (editingId ? '💾 Simpan Perubahan' : '➕ Tambah IPO')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default function IPOTrackerPage() {
    return (
        <ProtectedRoute>
            <IPOTrackerContent />
        </ProtectedRoute>
    );
}
