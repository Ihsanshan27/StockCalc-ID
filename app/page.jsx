'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import { useAuth } from './components/AuthProvider';
import {
   formatRupiah,
   formatPercentage,
   formatDate,
   calculatePL,
   calculateTotalRealizedPL,
   calculateIPOSummary,
} from './lib/calculations';
import {
   getTransactions,
   getIPOData,
   exportAllData,
   importData,
   clearAllData,
} from './lib/storage';

export default function DashboardPage() {
   const { user, loading: authLoading } = useAuth();
   const router = useRouter();

   const [transactions, setTransactions] = useState([]);
   const [ipoList, setIpoList] = useState([]);
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState({
      totalTransactions: 0,
      totalPL: 0,
      profit: 0,
      loss: 0,
      ipoStats: {
         totalIPOValue: 0,
         totalPL: 0,
         totalPLPercentage: 0,
      },
   });
   const [showImportModal, setShowImportModal] = useState(false);
   const [importText, setImportText] = useState('');

   useEffect(() => {
      loadData();
   }, [user]);

   const loadData = async () => {
      setLoading(true);
      try {
         const txData = await getTransactions();
         const ipoData = await getIPOData();

         setTransactions(txData);
         setIpoList(ipoData);

         const plStats = calculateTotalRealizedPL(txData);
         const ipoSummary = calculateIPOSummary(ipoData);

         setStats({
            totalTransactions: txData.length,
            totalPL: plStats.total,
            profit: plStats.profit,
            loss: plStats.loss,
            ipoStats: ipoSummary,
         });
      } catch (error) {
         console.error('Error loading data:', error);
      } finally {
         setLoading(false);
      }
   };

   const handleExport = async () => {
      const data = await exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stockcalc_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
   };

   const handleImport = async () => {
      const result = await importData(importText);
      if (result.success) {
         alert(result.message);
         loadData();
         setShowImportModal(false);
         setImportText('');
      } else {
         alert(result.message);
      }
   };

   const handleClearData = async () => {
      if (confirm('⚠️ PERINGATAN: Semua data akan dihapus permanen! Apakah Anda yakin?')) {
         if (confirm('Konfirmasi sekali lagi: Hapus semua data transaksi dan IPO?')) {
            await clearAllData();
            loadData();
            alert('Semua data berhasil dihapus!');
         }
      }
   };

   const totalOverallPL = stats.totalPL + stats.ipoStats.totalPL;

   const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Selamat Pagi';
      if (hour < 17) return 'Selamat Siang';
      if (hour < 19) return 'Selamat Sore';
      return 'Selamat Malam';
   };

   const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
   });

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
               {/* Welcome Section */}
               <div className="card mb-xl animate-slide-up" style={{
                  background: 'var(--gradient-card)',
                  border: 'none',
               }}>
                  <div className="flex justify-between items-center flex-wrap gap-lg">
                     <div>
                        <h1 style={{
                           fontSize: 'var(--font-size-3xl)',
                           fontWeight: '800',
                           marginBottom: 'var(--space-sm)',
                        }}>
                           👋 {getGreeting()}{user ? `, ${user.email?.split('@')[0]}` : ''}!
                        </h1>
                        <p className="text-muted">{today}</p>
                        {!user && (
                           <p className="text-muted mt-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                              💡 <Link href="/auth/login" className="auth-link">Login</Link> untuk menyimpan data ke cloud
                           </p>
                        )}
                     </div>
                     <div className="flex gap-sm flex-wrap">
                        <Link href="/pl-calculator" className="btn btn-primary">
                           ➕ Tambah Transaksi
                        </Link>
                        <Link href="/ipo-tracker" className="btn btn-secondary">
                           🚀 Tambah IPO
                        </Link>
                     </div>
                  </div>
               </div>

               {/* Summary Cards */}
               <div className="grid grid-4 mb-xl">
                  <div className="summary-card animate-slide-up" style={{ animationDelay: '100ms' }}>
                     <div className="summary-card-icon">💰</div>
                     <p className="summary-card-label">Total P/L Keseluruhan</p>
                     <p className={`summary-card-value ${totalOverallPL >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatRupiah(totalOverallPL)}
                     </p>
                  </div>
                  <div className="summary-card animate-slide-up" style={{ animationDelay: '200ms' }}>
                     <div className="summary-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>📈</div>
                     <p className="summary-card-label">P/L Trading</p>
                     <p className={`summary-card-value ${stats.totalPL >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatRupiah(stats.totalPL)}
                     </p>
                     <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {stats.totalTransactions} transaksi
                     </span>
                  </div>
                  <div className="summary-card animate-slide-up" style={{ animationDelay: '300ms' }}>
                     <div className="summary-card-icon" style={{ background: 'var(--color-secondary)', color: 'white' }}>🚀</div>
                     <p className="summary-card-label">P/L IPO</p>
                     <p className={`summary-card-value ${stats.ipoStats.totalPL >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatRupiah(stats.ipoStats.totalPL)}
                     </p>
                     <span className={`summary-card-trend ${stats.ipoStats.totalPLPercentage >= 0 ? 'positive' : 'negative'}`}>
                        {formatPercentage(stats.ipoStats.totalPLPercentage)}
                     </span>
                  </div>
                  <div className="summary-card animate-slide-up" style={{ animationDelay: '400ms' }}>
                     <div className="summary-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>📊</div>
                     <p className="summary-card-label">Nilai IPO</p>
                     <p className="summary-card-value">{formatRupiah(stats.ipoStats.totalIPOValue)}</p>
                  </div>
               </div>

               {/* Quick Stats Row */}
               <div className="grid grid-2 mb-xl">
                  {/* Recent Transactions */}
                  <div className="card animate-slide-up" style={{ animationDelay: '500ms' }}>
                     <div className="card-header">
                        <h2 className="card-title">📋 Transaksi Terbaru</h2>
                        <Link href="/pl-calculator" className="btn btn-ghost btn-sm">
                           Lihat Semua →
                        </Link>
                     </div>
                     <div className="card-body">
                        {loading ? (
                           <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                              <div className="loading-spinner"></div>
                              <p>Memuat...</p>
                           </div>
                        ) : transactions.length === 0 ? (
                           <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                              <div className="empty-state-icon" style={{ fontSize: '2rem' }}>📊</div>
                              <p className="text-muted">Belum ada transaksi</p>
                              <Link href="/pl-calculator" className="btn btn-primary btn-sm mt-md">
                                 ➕ Tambah
                              </Link>
                           </div>
                        ) : (
                           <div className="flex flex-col gap-sm">
                              {transactions.slice(0, 5).map(tx => {
                                 const result = tx.sellPrice
                                    ? calculatePL(tx.buyPrice, tx.sellPrice, tx.lotQty, tx.buyFee, tx.sellFee)
                                    : null;
                                 return (
                                    <div key={tx.id} className="flex justify-between items-center" style={{
                                       padding: 'var(--space-sm) var(--space-md)',
                                       background: 'var(--bg-tertiary)',
                                       borderRadius: 'var(--radius-md)',
                                    }}>
                                       <div className="flex items-center gap-md">
                                          <span className="font-semibold">{tx.stockCode}</span>
                                          <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                                             {tx.lotQty} lot
                                          </span>
                                       </div>
                                       <div className="text-right">
                                          {result ? (
                                             <span className={result.pl >= 0 ? 'text-success' : 'text-danger'}>
                                                {formatRupiah(result.pl)}
                                             </span>
                                          ) : (
                                             <span className="badge badge-warning">Hold</span>
                                          )}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Recent IPO */}
                  <div className="card animate-slide-up" style={{ animationDelay: '600ms' }}>
                     <div className="card-header">
                        <h2 className="card-title">🚀 IPO Terbaru</h2>
                        <Link href="/ipo-tracker" className="btn btn-ghost btn-sm">
                           Lihat Semua →
                        </Link>
                     </div>
                     <div className="card-body">
                        {loading ? (
                           <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                              <div className="loading-spinner"></div>
                              <p>Memuat...</p>
                           </div>
                        ) : ipoList.length === 0 ? (
                           <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                              <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🚀</div>
                              <p className="text-muted">Belum ada data IPO</p>
                              <Link href="/ipo-tracker" className="btn btn-primary btn-sm mt-md">
                                 ➕ Tambah
                              </Link>
                           </div>
                        ) : (
                           <div className="flex flex-col gap-sm">
                              {ipoList.slice(0, 5).map(ipo => {
                                 const plPercentage = ipo.currentPrice
                                    ? ((ipo.currentPrice - ipo.ipoPrice) / ipo.ipoPrice) * 100
                                    : 0;
                                 return (
                                    <div key={ipo.id} className="flex justify-between items-center" style={{
                                       padding: 'var(--space-sm) var(--space-md)',
                                       background: 'var(--bg-tertiary)',
                                       borderRadius: 'var(--radius-md)',
                                    }}>
                                       <div className="flex items-center gap-md">
                                          <span className="font-semibold">{ipo.stockCode}</span>
                                          <span className={`badge ${ipo.status === 'hold' ? 'badge-primary' :
                                                ipo.status === 'partial' ? 'badge-warning' : 'badge-success'
                                             }`} style={{ fontSize: '0.65rem' }}>
                                             {ipo.status === 'hold' ? 'Hold' : ipo.status === 'partial' ? 'Partial' : 'Sold'}
                                          </span>
                                       </div>
                                       <div className="text-right">
                                          <span className={plPercentage >= 0 ? 'text-success' : 'text-danger'}>
                                             {formatPercentage(plPercentage)}
                                          </span>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Data Management */}
               <div className="card animate-slide-up" style={{ animationDelay: '700ms' }}>
                  <div className="card-header">
                     <h2 className="card-title">⚙️ Pengaturan Data</h2>
                  </div>
                  <div className="card-body">
                     <div className="flex gap-md flex-wrap">
                        <button className="btn btn-secondary" onClick={handleExport}>
                           📥 Export Data (JSON)
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
                           📤 Import Data
                        </button>
                        <button className="btn btn-danger" onClick={handleClearData}>
                           🗑️ Hapus Semua Data
                        </button>
                     </div>
                     <p className="text-muted mt-md" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {user ? (
                           <>✅ Data tersimpan di cloud dan akan sync otomatis antar device.</>
                        ) : (
                           <>💡 Data disimpan di browser. <Link href="/auth/login" className="auth-link">Login</Link> untuk sync ke cloud.</>
                        )}
                     </p>
                  </div>
               </div>
            </div>
         </main>

         {/* Import Modal */}
         {showImportModal && (
            <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
               <div className="modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                     <h3 className="modal-title">📤 Import Data</h3>
                     <button className="modal-close" onClick={() => setShowImportModal(false)}>✕</button>
                  </div>
                  <div className="modal-body">
                     <div className="form-group">
                        <label className="form-label">Paste JSON Data</label>
                        <textarea
                           value={importText}
                           onChange={(e) => setImportText(e.target.value)}
                           placeholder='{"transactions": [...], "ipo": [...]}'
                           className="form-input"
                           style={{ minHeight: '200px', fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}
                        />
                        <p className="form-hint">
                           Paste data JSON dari file backup yang sudah di-export sebelumnya
                        </p>
                     </div>
                  </div>
                  <div className="modal-footer">
                     <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                        Batal
                     </button>
                     <button className="btn btn-primary" onClick={handleImport}>
                        📤 Import
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
