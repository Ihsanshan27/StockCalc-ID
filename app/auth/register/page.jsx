'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '../../lib/supabase';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak sama!');
            setLoading(false);
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter!');
            setLoading(false);
            return;
        }

        const { user, error: authError } = await signUp(formData.email, formData.password);

        if (authError) {
            setError(authError);
            setLoading(false);
            return;
        }

        if (user) {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container animate-slide-up">
                    <div className="auth-header">
                        <div className="auth-logo">✅</div>
                        <h1 className="auth-title">Registrasi Berhasil!</h1>
                        <p className="auth-subtitle">
                            Silakan cek email Anda untuk verifikasi akun, lalu login.
                        </p>
                    </div>
                    <Link href="/auth/login" className="btn btn-primary w-full">
                        🔐 Ke Halaman Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container animate-slide-up">
                <div className="auth-header">
                    <div className="auth-logo">📈</div>
                    <h1 className="auth-title">Buat Akun Baru</h1>
                    <p className="auth-subtitle">Daftar untuk mulai tracking investasi Anda</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="nama@email.com"
                            className="form-input"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimal 6 karakter"
                            className="form-input"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Konfirmasi Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Ulangi password"
                            className="form-input"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        style={{ marginTop: 'var(--space-md)' }}
                    >
                        {loading ? '⏳ Memproses...' : '📝 Daftar'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Sudah punya akun?{' '}
                        <Link href="/auth/login" className="auth-link">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
