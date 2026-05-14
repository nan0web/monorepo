export default Contacts;
/**
 * Contacts component - grid of contact blocks with title and map link.
 */
declare function Contacts({ items, title, map, className }: {
    items?: any[];
    title: any;
    map: any;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
/**
 * Single contact item component.
 */
export function Contact({ name, title, phone, email, address, active }: {
    name: any;
    title: any;
    phone: any;
    email: any;
    address: any;
    active?: boolean;
}): import("react/jsx-runtime").JSX.Element;
