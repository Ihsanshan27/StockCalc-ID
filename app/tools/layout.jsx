'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';

export default function ToolsLayout({ children }) {
    const pathname = usePathname();

    const menuItems = [
        { id: 'ara-arb', label: 'Kalkulator ARA/ARB', icon: '📊', path: '/tools/ara-arb' },
        { id: 'avg-price', label: 'Harga Rata-rata', icon: '📐', path: '/tools/avg-price' },
        { id: 'avg-down', label: 'Average Down', icon: '📉', path: '/tools/avg-down' },
        { id: 'risk-reward', label: 'Risk & Position', icon: '🎯', path: '/tools/risk-reward' },
        { id: 'retirement', label: 'Dana Pensiun', icon: '👴', path: '/tools/retirement' },
    ];

    return (
        <ProtectedRoute>
            <Navbar />
            <main className="page">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header mb-xl">
                        <div className="flex items-center gap-md">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'var(--gradient-primary)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: 'white',
                                boxShadow: 'var(--shadow-lg)'
                            }}>
                                🛠️
                            </div>
                            <div>
                                <Link href="/tools" style={{ textDecoration: 'none' }}>
                                    <h1 className="page-title mb-0" style={{ fontSize: '2rem' }}>Tools</h1>
                                </Link>
                                <p className="text-muted">Kumpulan kalkulator dan alat bantu trading saham Indonesia</p>
                            </div>
                        </div>
                    </div>

                    <div className="tools-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--space-xl)' }}>
                        {/* Sidebar Navigation */}
                        <aside className="tools-sidebar">
                            <div style={{ position: 'sticky', top: '100px' }}>
                                <nav className="flex flex-col mb-xl">
                                    <p className="text-muted text-xs uppercase font-bold tracking-wider mb-sm pl-sm">Menu Tools</p>
                                    {menuItems.map(item => {
                                        const isActive = pathname === item.path;
                                        return (
                                            <Link
                                                key={item.id}
                                                href={item.path}
                                                className={`tools-sidebar-link ${isActive ? 'active' : ''}`}
                                            >
                                                <span className="tools-sidebar-icon">{item.icon}</span>
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* Info Card - Context Aware */}
                                <div className="card bg-gradient-card border-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
                                    <div className="card-body p-lg">
                                        <div className="flex items-center gap-sm mb-sm text-primary">
                                            <span style={{ fontSize: '1.25rem' }}>💡</span>
                                            <h5 className="mb-0 text-primary">Pro Tip</h5>
                                        </div>
                                        <p className="text-sm text-muted">
                                            Selalu gunakan <strong>Stop Loss</strong> untuk membatasi kerugian. Calculator Risk & Position bisa membantu Anda menentukan lot yang aman.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Usage Content */}
                        <div className="tools-content animate-fade-in">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
