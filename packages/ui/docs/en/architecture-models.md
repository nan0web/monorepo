# Model-as-Schema Architecture: UI Components

This document maps all domain UI models available in `@nan0web/ui`, denoting the version they were introduced and the problem they solve. This structure is meant to help AI autonomous agents quickly understand the available schema elements without scanning source code.

## Component Registry

| Component Name | Version | Description |
|---|---|---|
| **Core Interactions & Forms** |
| `InputModel` | v1.0.0 | Standard text and scalar input wrapper. |
| `ButtonModel` | v1.0.0 | Action triggers representing user intents. |
| `SelectModel` | v1.2.0 | Standard dropdown selection interfaces. |
| `AutocompleteModel` | v1.2.0 | Input field with searchable dynamic query suggestions. |
| **Data Visualization** |
| `TableModel` | v1.0.0 | Complex data grid definitions mapping rows to models. |
| `TreeModel` | v1.3.0 | Hierarchical nested data viewing. |
| `BreadcrumbModel` | v1.7.0 | Navigational history and paths tracking. |
| **Feedback & Loading** |
| `ToastModel` | v1.0.0 | Ephemeral status reports or non-blocking notifications. |
| `ConfirmModel` | v1.0.0 | Destructive action confirmation prompts. |
| `SpinnerModel` | v1.2.0 | Async background operation indicators. |
| **Document/Content Layout** |
| `FAQModel` | v1.6.0 | Frequent questions and rapid answer reveals. |
| `FeatureGridModel`| v1.6.0 | Highlights feature sets for landing pages. |
| `CommentModel` | v1.6.0 | Core thread for messages/discussions. |
| **The Domain Bloom (v1.10.0 Additions)** |
| `HeaderModel` | v1.10.0 | Main application header with flexible left/right slots. |
| `FooterModel` | v1.10.0 | Application footer mapping links and legal requirements. |
| `HeroModel` | v1.10.0 | Primary call-to-action block for landers. |
| `AccordionModel` | v1.10.0 | Expandable grouped data (extends FAQ concepts). |
| `TabsModel` | v1.10.0 | Segmented data separation via tabs. |
| `GalleryModel` | v1.10.0 | Visual asset maps in flexible grids. |
| `PricingModel` | v1.10.0 | Unified representation of SaaS tier matrices. |
| `StatsModel` | v1.10.0 | Quantitative reporting visualizations. |
| `TimelineModel` | v1.10.0 | Ordered chronological milestones mapping. |
| `TestimonialModel` | v1.10.0 | User quotes extending `CommentModel`. |
| `EmptyStateModel` | v1.10.0 | Placeholder UI for missing content. |
| `BannerModel` | v1.10.0 | Important global alerts rendered out-of-flow. |
| `ProfileDropdownModel`| v1.10.0 | Standard avatar menus for authenticated zones. |
| **System Orchestration** |
| `LayoutModel` | v1.0.0 | Root structure defining main wrapper semantics. |
| `ShellModel` | v1.0.0 | Primary App Orchestrator passing intents into layouts. |
| `SandboxModel` | v1.7.0 | Component rendering isolation environment for Playwright/E2E. |
