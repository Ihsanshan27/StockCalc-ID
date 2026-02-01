'use client';

import { useEffect, useState } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }) {
    const [visible, setVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            setTimeout(() => setAnimateIn(true), 10);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setVisible(false), 300); // Wait for animation
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible) return null;

    return (
        <div
            className={`modal-backdrop ${animateIn ? 'open' : ''}`}
            onClick={onClose}
        >
            <div
                className={`modal-content ${animateIn ? 'open' : ''}`}
                style={{ maxWidth }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
