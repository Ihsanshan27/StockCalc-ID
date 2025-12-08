'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Memuat...</p>
            </div>
        );
    }

    // If not authenticated, show nothing (will redirect)
    if (!user) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Mengalihkan ke login...</p>
            </div>
        );
    }

    // User is authenticated, render children
    return children;
}
