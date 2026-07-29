"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIContext } from '../../context/UIContext.jsx';

/**
 * Basic OLMUI Bottom Navigation (Mobile Tab Bar)
 * Implements Mobile Bottom Navigation Rule from architecture.
 */
export function Navigation({ items = [], className = '' }) {
    const { t } = useUIContext();
    const pathname = usePathname();

    return (
        <nav className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-50 md:hidden ${className}`}>
            <div className="flex justify-around items-center h-16 px-2">
                {items.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={idx} 
                            href={item.href || '#'} 
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
                                ${isActive 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            {/* If icon is a string class (like in fontawesome), render it. Else just label */}
                            {item.icon && (
                                <span className="text-xl leading-none">
                                    {typeof item.icon === 'string' ? <i className={item.icon} /> : item.icon}
                                </span>
                            )}
                            <span className="text-xs font-medium">{t(item.label)}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
