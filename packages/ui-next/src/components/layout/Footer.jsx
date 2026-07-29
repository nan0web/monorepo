import React from 'react';
import Link from 'next/link';
import { useUIContext } from '../../context/UIContext.jsx';

/**
 * Basic OLMUI Footer Component
 */
export function Footer({ text, links = [], className = '' }) {
    const { t } = useUIContext();

    return (
        <footer className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 ${className}`}>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                        {t(text)}
                    </div>
                    {links.length > 0 && (
                        <nav className="flex flex-wrap justify-center space-x-6">
                            {links.map((link, idx) => (
                                <Link 
                                    key={idx} 
                                    href={link.href || '#'} 
                                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                                >
                                    {t(link.label)}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>
            </div>
        </footer>
    );
}
