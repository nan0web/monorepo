export function Page({ children, nav, sidebar, className, fluid, sidebarPosition, }: PageProps): import("react/jsx-runtime").JSX.Element;
export namespace Page {
    let inlineRenderer: boolean;
    let displayName: string;
}
export type PageProps = {
    /**
     * - Main content ($content)
     */
    children: React.ReactNode;
    /**
     * - Navigation config for Nav component { items, brand, right }
     */
    nav?: object;
    /**
     * - Sidebar config { items, title }
     */
    sidebar?: object;
    /**
     * - Additional CSS classes
     */
    className?: string;
    /**
     * - Use fluid container
     */
    fluid?: boolean;
    /**
     * - Sidebar placement (default: 'start')
     */
    sidebarPosition?: "start" | "end";
};
import React from 'react';
