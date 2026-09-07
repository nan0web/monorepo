export * from "./Structure.js";
export * from "./Content.js";
export * from "./Interaction.js";
export * from "./Form.js";
export * from "./Dialog.js";
export const Contracts: Readonly<{
    Page: Readonly<{
        name: "Page";
        category: "Structure";
        props: string[];
        slots: string[];
        events: never[];
    }>;
    Nav: Readonly<{
        name: "Nav";
        category: "Structure";
        props: string[];
        slots: string[];
        events: string[];
    }>;
    Sidebar: Readonly<{
        name: "Sidebar";
        category: "Structure";
        props: string[];
        slots: never[];
        events: string[];
    }>;
    Footer: Readonly<{
        name: "Footer";
        category: "Structure";
        props: string[];
        slots: string[];
        events: never[];
    }>;
    Markdown: Readonly<{
        name: "Markdown";
        category: "Content";
        props: string[];
        slots: never[];
        events: never[];
    }>;
    Alert: Readonly<{
        name: "Alert";
        category: "Content";
        props: string[];
        slots: string[];
        events: string[];
    }>;
    Badge: Readonly<{
        name: "Badge";
        category: "Content";
        props: string[];
        slots: never[];
        events: never[];
    }>;
    Table: Readonly<{
        name: "Table";
        category: "Content";
        props: string[];
        slots: never[];
        events: string[];
    }>;
    Action: Readonly<{
        name: "Action";
        category: "Interaction";
        props: string[];
        slots: string[];
        events: string[];
    }>;
    Button: Readonly<{
        name: "Action";
        category: "Interaction";
        props: string[];
        slots: string[];
        events: string[];
    }>;
    Input: Readonly<{
        name: "Input";
        category: "Interaction";
        props: string[];
        slots: never[];
        events: string[];
    }>;
    Choice: Readonly<{
        name: "Choice";
        category: "Interaction";
        props: string[];
        slots: never[];
        events: string[];
    }>;
    Select: Readonly<{
        name: "Choice";
        category: "Interaction";
        props: string[];
        slots: never[];
        events: string[];
    }>;
    Form: Readonly<{
        name: "Form";
        category: "Form";
        props: string[];
        slots: string[];
        events: string[];
    }>;
    Dialog: Readonly<{
        name: "Dialog";
        category: "Dialog";
        props: string[];
        slots: string[];
        events: string[];
    }>;
    Modal: Readonly<{
        name: "Dialog";
        category: "Dialog";
        props: string[];
        slots: string[];
        events: string[];
    }>;
    Progress: Readonly<{
        name: "Progress";
        category: "Dialog";
        props: string[];
        slots: never[];
        events: never[];
    }>;
}>;
export default Contracts;
