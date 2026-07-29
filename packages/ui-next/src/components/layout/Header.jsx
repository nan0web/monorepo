import React from 'react';
import Link from 'next/link';
import { useUIContext } from '../../context/UIContext.jsx';

/**
 * Basic OLMUI Header Component
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.logo]
 * @param {Array} [props.nav]
 */
export function Header({ title, logo, nav = [], className = '' }) {
    const { t } = useUIContext();

    return (
        <header className={`w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {logo && <img src={logo} alt={title || 'Logo'} className="h-8 w-auto mr-2 inline-block" />}
                            {t(title)}
                        </Link>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        {nav.map((item, idx) => (
                            <Link 
                                key={idx} 
                                href={item.href || '#'} 
                                className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                            >
                                {t(item.label)}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
