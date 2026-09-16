/**
 * ReleaseDashboard - OLMUI Web UI Adapter & HTML Renderer for PM-as-Code releases.
 * Modular structure: CSS in style.css, client JS in client.js, clean component rendering.
 */
export class ReleaseDashboard {
    /**
     * Escape HTML entities to prevent injection
     * @param {string} str
     * @returns {string}
     */
    static escapeHtml(str?: string): string;
    /**
     * @param {Object} data
     * @param {import('@nan0web/release/src/domain/Dashboard/DashboardModel.js').DashboardSummary} data.summary
     * @param {import('@nan0web/release/src/domain/Dashboard/DashboardModel.js').ProjectDashboardEntry[]} data.projects
     */
    constructor(data?: {
        summary: any;
        projects: any[];
    });
    summary: any;
    projects: any[];
    /**
     * Render full dashboard HTML string
     * @returns {string}
     */
    render(): string;
}
export default ReleaseDashboard;
