/**
 * @file ui/lit barrel export for Web Components and ui/web alias.
 */

export { ReleaseFilterBar, default as FilterBar } from './ReleaseFilterBar.js'
export { ReleaseTaskList, default as TaskList } from './ReleaseTaskList.js'
export { ReleaseProjectCard, default as ProjectCard } from './ReleaseProjectCard.js'
export { ReleaseDashboardLit, default as ReleaseDashboardLitDefault } from './ReleaseDashboardLit.js'
export default {
	ReleaseFilterBar: () => import('./ReleaseFilterBar.js').then((m) => m.ReleaseFilterBar),
	ReleaseTaskList: () => import('./ReleaseTaskList.js').then((m) => m.ReleaseTaskList),
	ReleaseProjectCard: () => import('./ReleaseProjectCard.js').then((m) => m.ReleaseProjectCard),
	ReleaseDashboardLit: () => import('./ReleaseDashboardLit.js').then((m) => m.ReleaseDashboardLit),
}
