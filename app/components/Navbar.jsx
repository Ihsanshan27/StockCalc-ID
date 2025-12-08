'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { signOut } from '../lib/supabase';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const navLinks = [
        { href: '/', label: 'Dashboard', icon: '📊' },
        { href: '/pl-calculator', label: 'P/L Calculator', icon: '🧮' },
        { href: '/ipo-tracker', label: 'IPO Tracker', icon: '🚀' },
        { href: '/tools', label: 'Tools', icon: '🛠️' },
    ];


    const handleLogout = async () => {
        await signOut();
        router.push('/auth/login');
        router.refresh();
    };

    const getUserInitials = (email) => {
        if (!email) return '?';
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link href="/" className="navbar-brand">
                    <span className="navbar-brand-icon">📈</span>
                    <span>StockCalc ID</span>
                </Link>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle navigation"
                >
                    {isOpen ? '✕' : '☰'}
                </button>

                <div className="flex items-center gap-md">
                    <ul className={`navbar-nav ${isOpen ? 'open' : ''}`}>
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* User Menu */}
                    {!loading && (
                        <div className="user-menu">
                            {user ? (
                                <>
                                    <button
                                        className="user-button"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                    >
                                        <span className="user-avatar">
                                            {getUserInitials(user.email)}
                                        </span>
                                        <span className="truncate" style={{ maxWidth: '120px' }}>
                                            {user.email?.split('@')[0]}
                                        </span>
                                    </button>

                                    {showUserMenu && (
                                        <div className="user-dropdown">
                                            <div style={{
                                                padding: 'var(--space-sm) var(--space-md)',
                                                borderBottom: '1px solid var(--border-primary)',
                                                marginBottom: 'var(--space-sm)'
                                            }}>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                    Logged in as
                                                </p>
                                                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>
                                                    {user.email}
                                                </p>
                                            </div>
                                            <button
                                                className="user-dropdown-item danger"
                                                onClick={handleLogout}
                                            >
                                                🚪 Logout
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link href="/auth/login" className="btn btn-primary btn-sm">
                                    🔐 Login
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
