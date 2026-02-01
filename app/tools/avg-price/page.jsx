'use client';

import { useState, useEffect } from 'react';
import { calculateWeightedAverage, formatRupiah, formatNumber, formatPercentage } from '../../lib/calculations';
import Modal from '../../components/Modal';

export default function AvgPricePage() {
    const [avgEntries, setAvgEntries] = useState([
        { id: 1, price: '', lot: '' },
        { id: 2, price: '', lot: '' },
    ]);
    const [avgResult, setAvgResult] = useState(null);
    const [targetPrice, setTargetPrice] = useState('');

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    useEffect(() => {
        const savedEntries = localStorage.getItem('tool_avg_entries');
        if (savedEntries) {
            try {
                setAvgEntries(JSON.parse(savedEntries));
            } catch (e) {
                console.error('Error parsing saved avgEntries', e);
            }
        }
        const savedTarget = localStorage.getItem('tool_target_price');
        if (savedTarget) setTargetPrice(savedTarget);
    }, []);

    useEffect(() => {
        localStorage.setItem('tool_avg_entries', JSON.stringify(avgEntries));
    }, [avgEntries]);

    useEffect(() => {
        localStorage.setItem('tool_target_price', targetPrice);
    }, [targetPrice]);

    const handleAddEntry = () => {
        const newId = avgEntries.length > 0 ? Math.max(...avgEntries.map(e => e.id)) + 1 : 1;
        setAvgEntries([...avgEntries, { id: newId, price: '', lot: '' }]);
    };

    const handleRemoveEntry = (id) => {
        if (avgEntries.length <= 1) return;
        setEntryToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (entryToDelete) {
            setAvgEntries(avgEntries.filter(e => e.id !== entryToDelete));
            setEntryToDelete(null);
            setShowDeleteModal(false);
        }
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

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <div className="flex justify-between items-end mb-lg">
                <div>
                    <h2 className="mb-xs">📐 Harga Rata-rata</h2>
                    <p className="text-muted">Hitung average price dari beberapa posisi pembelian.</p>
                </div>
                <button className="btn btn-sm btn-ghost text-danger" onClick={handleResetAverage}>
                    Reset Data
                </button>
            </div>

            <div className="card mb-xl">
                <div className="card-body p-xl">
                    <div className="mb-lg">
                        {avgEntries.map((entry, index) => (
                            <div key={entry.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="grid gap-md mb-md items-start" style={{ gridTemplateColumns: '1.5fr 1fr auto' }}>
                                    <div className="form-group mb-0">
                                        {index === 0 && <label className="form-label">Harga Beli</label>}
                                        <div className="input-group">
                                            <span className="input-prefix">Rp</span>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={entry.price}
                                                onChange={(e) => handleEntryChange(entry.id, 'price', e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group mb-0">
                                        {index === 0 && <label className="form-label">Jumlah Lot</label>}
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={entry.lot}
                                                onChange={(e) => handleEntryChange(entry.id, 'lot', e.target.value)}
                                                placeholder="0"
                                            />
                                            <span className="input-suffix">Lot</span>
                                        </div>
                                        {entry.lot && (
                                            <small className="text-muted block mt-xs text-right">
                                                ≈ {formatNumber(parseFloat(entry.lot) * 100)} lbr
                                            </small>
                                        )}
                                    </div>
                                    <div style={{ paddingTop: index === 0 ? '32px' : '0' }}>
                                        {avgEntries.length > 1 && (
                                            <button
                                                className="btn btn-icon btn-danger-light hover:bg-danger hover:text-white transition-colors"
                                                onClick={() => handleRemoveEntry(entry.id)}
                                                title="Hapus baris"
                                                style={{ height: '42px' }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                        {avgEntries.length <= 1 && <div style={{ width: '40px' }}></div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mb-xl pt-md border-top" style={{ borderColor: 'var(--border-primary)' }}>
                        <button className="btn btn-secondary" onClick={handleAddEntry}>
                            ➕ Tambah Posisi
                        </button>
                    </div>

                    <div className="form-group mb-xl p-md bg-tertiary rounded" style={{ border: '1px dashed var(--border-primary)' }}>
                        <label className="form-label">Rencana Jual (Opsional)</label>
                        <div className="input-group">
                            <span className="input-prefix">Rp</span>
                            <input
                                type="number"
                                className="form-input bg-card"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                placeholder="Masukkan harga target..."
                            />
                        </div>
                        <small className="text-muted mt-xs block">Isi untuk simulasi profit/loss.</small>
                    </div>

                    <button className="btn btn-primary w-full py-md text-lg shadow-lg" onClick={handleCalculateAverage}>
                        Hitung Rata-rata
                    </button>
                </div>
            </div>

            {avgResult && (
                <div className="card animate-slide-up overflow-hidden border-primary">
                    <div className="card-header bg-gradient-card">
                        <h3 className="card-title text-primary">Hasil Perhitungan</h3>
                    </div>
                    <div className="card-body p-xl">
                        <div className="flex flex-col items-center mb-xl">
                            <p className="text-muted uppercase tracking-wider text-xs mb-sm">Harga Rata-rata (Avg Price)</p>
                            <h2 className="text-5xl font-bold text-primary mb-md">{formatRupiah(avgResult.avgPrice)}</h2>
                            <div className="flex gap-lg w-full justify-center">
                                <div className="text-center px-lg py-sm bg-tertiary rounded flex-1">
                                    <p className="text-xs text-muted">Total Lot</p>
                                    <p className="font-semibold">{formatNumber(avgResult.totalLot)} Lot</p>
                                    <p className="text-xs text-muted">({formatNumber(avgResult.totalShares)} lembar)</p>
                                </div>
                                <div className="text-center px-lg py-sm bg-tertiary rounded flex-1">
                                    <p className="text-xs text-muted">Total Modal</p>
                                    <p className="font-semibold">{formatRupiah(avgResult.totalValue)}</p>
                                </div>
                            </div>
                        </div>

                        {avgResult.pl !== undefined && (
                            <div className={`p-lg rounded-xl text-center ${avgResult.pl >= 0 ? 'bg-success-light border border-success' : 'bg-danger-light border border-danger'}`}>
                                <p className="text-muted text-sm mb-xs">
                                    Simulasi Profit/Loss di harga <strong>{formatRupiah(avgResult.targetPrice)}</strong>
                                </p>
                                <h3 className={`text-2xl font-bold ${avgResult.pl >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {avgResult.pl >= 0 ? '+' : ''}{formatRupiah(avgResult.pl)} ({formatPercentage(avgResult.plPercent)})
                                </h3>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                maxWidth="400px"
            >
                <div className="text-center">
                    <p className="mb-lg">Apakah Anda yakin ingin menghapus baris ini?</p>
                    <div className="flex gap-md justify-center">
                        <button
                            className="btn btn-ghost text-muted"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Batal
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={confirmDelete}
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
