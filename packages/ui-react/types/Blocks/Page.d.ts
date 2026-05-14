export function Page({ children, nav, sidebar, className, fluid, sidebarPosition, doc, }: PageProps): import("react/jsx-runtime.js").JSX.Element;
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
    className?: string | undefined;
    /**
     * - Use fluid container
     */
    fluid?: boolean | undefined;
    /**
     * - Sidebar placement (default: 'start')
     */
    sidebarPosition?: "end" | "start" | undefined;
    /**
     * - The document object
     */
    doc?: any;
};
import React from 'react';
