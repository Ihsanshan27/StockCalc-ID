'use client';

import Link from 'next/link';

export default function ToolsLandingPage() {
    const tools = [
        {
            id: 'ara-arb',
            label: 'Kalkulator ARA/ARB',
            icon: '📊',
            desc: 'Hitung batas atas (ARA) dan batas bawah (ARB) harga saham. Mendukung simulasi kenaikan/penurunan berhari-hari.',
            path: '/tools/ara-arb',
            color: 'var(--color-primary)'
        },
        {
            id: 'avg-price',
            label: 'Harga Rata-rata',
            icon: '📐',
            desc: 'Hitung Average Price dari beberapa posisi pembelian. Ketahui Break Even Point (BEP) Anda dengan mudah.',
            path: '/tools/avg-price',
            color: '#3b82f6'
        },
        {
            id: 'avg-down',
            label: 'Average Down Planner',
            icon: '📉',
            desc: 'Rencanakan strategi serok bawah. Hitung modal dan lot yang dibutuhkan untuk mencapai target harga rata-rata tertentu.',
            path: '/tools/avg-down',
            color: '#f59e0b'
        },
        {
            id: 'risk-reward',
            label: 'Risk & Position Sizing',
            icon: '🎯',
            desc: 'Jaga Money Management! Hitung maksimal lot yang boleh dibeli berdasarkan modal dan risiko per trade.',
            path: '/tools/risk-reward',
            color: '#ef4444'
        },
        {
            id: 'retirement',
            label: 'Dana Pensiun (FIRE)',
            icon: '👴',
            desc: 'Rencanakan masa depan. Hitung kebutuhan dana pensiun dengan metode 4% Rule dan proyeksi investasi.',
            path: '/tools/retirement',
            color: '#10b981'
        },
    ];

    return (
        <div className="animate-fade-in">
            <div className="mb-xl">
                <h2 className="mb-sm">Selamat Datang di Tools Saham</h2>
                <p className="text-muted text-lg">Pilih salah satu kalkulator di bawah ini untuk membantu analisis trading Anda.</p>
            </div>

            <div className="grid gap-lg" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {tools.map((tool, index) => (
                    <Link href={tool.path} key={tool.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div
                            className="card tools-dashboard-card p-xl"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="tools-dashboard-icon" style={{ color: tool.color, background: `${tool.color}15` }}>
                                {tool.icon}
                            </div>
                            <h3 className="card-title mb-sm">{tool.label}</h3>
                            <p className="text-secondary text-sm leading-relaxed">{tool.desc}</p>

                            <div className="mt-auto pt-lg flex items-center text-sm font-semibold" style={{ color: tool.color }}>
                                Buka Tool <span style={{ marginLeft: '4px', transition: 'transform 0.2s' }}>→</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
