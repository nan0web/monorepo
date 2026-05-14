/**
 * @typedef {Object} HTML5Elements
 * @property {string|ContentData[]} [a]
 * @property {string|ContentData[]} [abbr]
 * @property {string|ContentData[]} [address]
 * @property {string|ContentData[]} [area]
 * @property {string|ContentData[]} [article]
 * @property {string|ContentData[]} [aside]
 * @property {string|ContentData[]} [audio]
 * @property {string|ContentData[]} [b]
 * @property {string|ContentData[]} [base]
 * @property {string|ContentData[]} [bdi]
 * @property {string|ContentData[]} [bdo]
 * @property {string|ContentData[]} [blockquote]
 * @property {string|ContentData[]} [body]
 * @property {boolean|object} [br]
 * @property {string|ContentData[]} [canvas]
 * @property {string|ContentData[]} [caption]
 * @property {string|ContentData[]} [cite]
 * @property {string|ContentData[]} [code]
 * @property {string|ContentData[]} [col]
 * @property {string|ContentData[]} [colgroup]
 * @property {string|ContentData[]} [data]
 * @property {string|ContentData[]} [datalist]
 * @property {string|ContentData[]} [dd]
 * @property {string|ContentData[]} [del]
 * @property {string|ContentData[]} [details]
 * @property {string|ContentData[]} [dfn]
 * @property {string|ContentData[]} [dialog]
 * @property {string|ContentData[]} [div]
 * @property {string|ContentData[]} [dl]
 * @property {string|ContentData[]} [dt]
 * @property {string|ContentData[]} [em]
 * @property {string|ContentData[]} [embed]
 * @property {string|ContentData[]} [fieldset]
 * @property {string|ContentData[]} [figcaption]
 * @property {string|ContentData[]} [figure]
 * @property {any} [footer]
 * @property {string|ContentData[]} [form]
 * @property {string|ContentData[]} [h1]
 * @property {string|ContentData[]} [h2]
 * @property {string|ContentData[]} [h3]
 * @property {string|ContentData[]} [h4]
 * @property {string|ContentData[]} [h5]
 * @property {string|ContentData[]} [h6]
 * @property {string|ContentData[]} [head]
 * @property {any} [header]
 * @property {string|ContentData[]} [hgroup]
 * @property {boolean|object} [hr]
 * @property {string|ContentData[]} [html]
 * @property {string|ContentData[]} [i]
 * @property {string|ContentData[]} [iframe]
 * @property {string|ContentData[]} [img]
 * @property {string|ContentData[]} [ins]
 * @property {string|ContentData[]} [kbd]
 * @property {string|ContentData[]} [label]
 * @property {string|ContentData[]} [legend]
 * @property {string|ContentData[]} [li]
 * @property {string|ContentData[]} [link]
 * @property {string|ContentData[]} [main]
 * @property {string|ContentData[]} [map]
 * @property {string|ContentData[]} [mark]
 * @property {string|ContentData[]} [meta]
 * @property {string|ContentData[]} [meter]
 * @property {boolean|any} [input]
 * @property {boolean|any} [button]
 * @property {boolean|any} [select]
 * @property {string|ContentData[]} [nav]
 * @property {string|ContentData[]} [noscript]
 * @property {string|ContentData[]} [object]
 * @property {string|ContentData[]} [ol]
 * @property {string|ContentData[]} [optgroup]
 * @property {string|ContentData[]} [option]
 * @property {string|ContentData[]} [output]
 * @property {string|ContentData[]} [p]
 * @property {string|ContentData[]} [picture]
 * @property {string|ContentData[]} [pre]
 * @property {string|ContentData[]} [progress]
 * @property {string|ContentData[]} [q]
 * @property {string|ContentData[]} [rp]
 * @property {string|ContentData[]} [rt]
 * @property {string|ContentData[]} [ruby]
 * @property {string|ContentData[]} [s]
 * @property {string|ContentData[]} [samp]
 * @property {string|ContentData[]} [script]
 * @property {string|ContentData[]} [section]
 * @property {string|ContentData[]} [slot]
 * @property {string|ContentData[]} [small]
 * @property {string|ContentData[]} [source]
 * @property {string|ContentData[]} [span]
 * @property {string|ContentData[]} [strong]
 * @property {string|ContentData[]} [style]
 * @property {string|ContentData[]} [sub]
 * @property {string|ContentData[]} [summary]
 * @property {string|ContentData[]} [sup]
 * @property {string|ContentData[]} [table]
 * @property {string|ContentData[]} [tbody]
 * @property {string|ContentData[]} [td]
 * @property {string|ContentData[]} [template]
 * @property {string|ContentData[]} [textarea]
 * @property {string|ContentData[]} [tfoot]
 * @property {string|ContentData[]} [th]
 * @property {string|ContentData[]} [thead]
 * @property {string|ContentData[]} [time]
 * @property {string|ContentData[]} [title]
 * @property {string|ContentData[]} [tr]
 * @property {string|ContentData[]} [track]
 * @property {string|ContentData[]} [u]
 * @property {string|ContentData[]} [ul]
 * @property {string|ContentData[]} [var]
 * @property {string|ContentData[]} [video]
 * @property {string|ContentData[]} [wbr]
 * @property {string|ContentData[]} [svg]
 * @property {string|ContentData[]} [path]
 * @property {string|ContentData[]} [circle]
 * @property {string|ContentData[]} [rect]
 * @property {string|ContentData[]} [line]
 * @property {string|ContentData[]} [polyline]
 * @property {string|ContentData[]} [polygon]
 * @property {string|ContentData[]} [g]
 * @property {string|ContentData[]} [defs]
 * @property {string|ContentData[]} [symbol]
 * @property {string|ContentData[]} [use]
 * @property {string|ContentData[]} [text]
 */
/**
 * @typedef {Object} CoreUIElements
 * @property {import('./components/AccordionModel.js').AccordionModel} [accordion]
 * @property {import('./components/AutocompleteModel.js').AutocompleteModel} [autocomplete]
 * @property {import('./components/BannerModel.js').BannerModel} [banner]
 * @property {import('./components/BreadcrumbModel.js').BreadcrumbModel} [breadcrumb]
 * @property {import('./components/ButtonModel.js').ButtonModel} [button]
 * @property {import('./components/CommentModel.js').CommentModel} [comment]
 * @property {import('./components/ConfirmModel.js').ConfirmModel} [confirm]
 * @property {import('./components/EmptyStateModel.js').EmptyStateModel} [emptyState]
 * @property {import('./components/FAQModel.js').FAQModel} [faq]
 * @property {import('./components/FeatureGridModel.js').FeatureGridModel} [featureGrid]
 * @property {import('./components/GalleryModel.js').GalleryModel} [gallery]
 * @property {import('./HeaderModel.js').HeaderModel} [header]
 * @property {import('./FooterModel.js').FooterModel} [footer]
 * @property {import('./components/InputModel.js').InputModel} [input]
 * @property {import('./components/MarkdownModel.js').MarkdownModel} [markdown]
 * @property {import('./components/PriceModel.js').PriceModel} [price]
 * @property {import('./components/PricingModel.js').PricingModel} [pricing]
 * @property {import('./components/PricingSectionModel.js').PricingSectionModel} [pricingSection]
 * @property {import('./components/ProfileDropdownModel.js').ProfileDropdownModel} [profileDropdown]
 * @property {import('./components/SelectModel.js').SelectModel} [select]
 * @property {import('./components/ShellModel.js').ShellModel} [shell]
 * @property {import('./components/SpinnerModel.js').SpinnerModel} [spinner]
 * @property {import('./components/StatsItemModel.js').StatsItemModel} [statsItem]
 * @property {import('./components/StatsModel.js').StatsModel} [stats]
 * @property {import('./components/TableModel.js').TableModel} [tableUI]
 * @property {import('./components/TabsModel.js').TabsModel} [tabs]
 * @property {import('./components/TestimonialModel.js').TestimonialModel} [testimonial]
 * @property {import('./components/TimelineItemModel.js').TimelineItemModel} [timelineItem]
 * @property {import('./components/TimelineModel.js').TimelineModel} [timeline]
 * @property {import('./components/ToastModel.js').ToastModel} [toast]
 * @property {import('./components/TreeModel.js').TreeModel} [tree]
 * @property {ContentData[]} [sortable] - Інтерактивний Drag-n-Drop контейнер
 */
/**
 * @typedef {Partial<Content & HTML5Elements & CoreUIElements> & Record<string, any>} ContentData
 */
export class Content extends Model {
    static content: {
        type: string;
        help: string;
    };
    static children: {
        type: string;
        model: typeof Content;
        help: string;
    };
    /**
     * @param {ContentData | string} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: ContentData | string, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string|undefined} Content */ content: string | undefined;
    /** @type {Array<Content>|undefined} Children */ children: Array<Content> | undefined;
}
export type HTML5Elements = {
    a?: string | ContentData[] | undefined;
    abbr?: string | ContentData[] | undefined;
    address?: string | ContentData[] | undefined;
    area?: string | ContentData[] | undefined;
    article?: string | ContentData[] | undefined;
    aside?: string | ContentData[] | undefined;
    audio?: string | ContentData[] | undefined;
    b?: string | ContentData[] | undefined;
    base?: string | ContentData[] | undefined;
    bdi?: string | ContentData[] | undefined;
    bdo?: string | ContentData[] | undefined;
    blockquote?: string | ContentData[] | undefined;
    body?: string | ContentData[] | undefined;
    br?: boolean | object;
    canvas?: string | ContentData[] | undefined;
    caption?: string | ContentData[] | undefined;
    cite?: string | ContentData[] | undefined;
    code?: string | ContentData[] | undefined;
    col?: string | ContentData[] | undefined;
    colgroup?: string | ContentData[] | undefined;
    data?: string | ContentData[] | undefined;
    datalist?: string | ContentData[] | undefined;
    dd?: string | ContentData[] | undefined;
    del?: string | ContentData[] | undefined;
    details?: string | ContentData[] | undefined;
    dfn?: string | ContentData[] | undefined;
    dialog?: string | ContentData[] | undefined;
    div?: string | ContentData[] | undefined;
    dl?: string | ContentData[] | undefined;
    dt?: string | ContentData[] | undefined;
    em?: string | ContentData[] | undefined;
    embed?: string | ContentData[] | undefined;
    fieldset?: string | ContentData[] | undefined;
    figcaption?: string | ContentData[] | undefined;
    figure?: string | ContentData[] | undefined;
    footer?: any;
    form?: string | ContentData[] | undefined;
    h1?: string | ContentData[] | undefined;
    h2?: string | ContentData[] | undefined;
    h3?: string | ContentData[] | undefined;
    h4?: string | ContentData[] | undefined;
    h5?: string | ContentData[] | undefined;
    h6?: string | ContentData[] | undefined;
    head?: string | ContentData[] | undefined;
    header?: any;
    hgroup?: string | ContentData[] | undefined;
    hr?: boolean | object;
    html?: string | ContentData[] | undefined;
    i?: string | ContentData[] | undefined;
    iframe?: string | ContentData[] | undefined;
    img?: string | ContentData[] | undefined;
    ins?: string | ContentData[] | undefined;
    kbd?: string | ContentData[] | undefined;
    label?: string | ContentData[] | undefined;
    legend?: string | ContentData[] | undefined;
    li?: string | ContentData[] | undefined;
    link?: string | ContentData[] | undefined;
    main?: string | ContentData[] | undefined;
    map?: string | ContentData[] | undefined;
    mark?: string | ContentData[] | undefined;
    meta?: string | ContentData[] | undefined;
    meter?: string | ContentData[] | undefined;
    input?: boolean | any;
    button?: boolean | any;
    select?: boolean | any;
    nav?: string | ContentData[] | undefined;
    noscript?: string | ContentData[] | undefined;
    object?: string | ContentData[] | undefined;
    ol?: string | ContentData[] | undefined;
    optgroup?: string | ContentData[] | undefined;
    option?: string | ContentData[] | undefined;
    output?: string | ContentData[] | undefined;
    p?: string | ContentData[] | undefined;
    picture?: string | ContentData[] | undefined;
    pre?: string | ContentData[] | undefined;
    progress?: string | ContentData[] | undefined;
    q?: string | ContentData[] | undefined;
    rp?: string | ContentData[] | undefined;
    rt?: string | ContentData[] | undefined;
    ruby?: string | ContentData[] | undefined;
    s?: string | ContentData[] | undefined;
    samp?: string | ContentData[] | undefined;
    script?: string | ContentData[] | undefined;
    section?: string | ContentData[] | undefined;
    slot?: string | ContentData[] | undefined;
    small?: string | ContentData[] | undefined;
    source?: string | ContentData[] | undefined;
    span?: string | ContentData[] | undefined;
    strong?: string | ContentData[] | undefined;
    style?: string | ContentData[] | undefined;
    sub?: string | ContentData[] | undefined;
    summary?: string | ContentData[] | undefined;
    sup?: string | ContentData[] | undefined;
    table?: string | ContentData[] | undefined;
    tbody?: string | ContentData[] | undefined;
    td?: string | ContentData[] | undefined;
    template?: string | ContentData[] | undefined;
    textarea?: string | ContentData[] | undefined;
    tfoot?: string | ContentData[] | undefined;
    th?: string | ContentData[] | undefined;
    thead?: string | ContentData[] | undefined;
    time?: string | ContentData[] | undefined;
    title?: string | ContentData[] | undefined;
    tr?: string | ContentData[] | undefined;
    track?: string | ContentData[] | undefined;
    u?: string | ContentData[] | undefined;
    ul?: string | ContentData[] | undefined;
    var?: string | ContentData[] | undefined;
    video?: string | ContentData[] | undefined;
    wbr?: string | ContentData[] | undefined;
    svg?: string | ContentData[] | undefined;
    path?: string | ContentData[] | undefined;
    circle?: string | ContentData[] | undefined;
    rect?: string | ContentData[] | undefined;
    line?: string | ContentData[] | undefined;
    polyline?: string | ContentData[] | undefined;
    polygon?: string | ContentData[] | undefined;
    g?: string | ContentData[] | undefined;
    defs?: string | ContentData[] | undefined;
    symbol?: string | ContentData[] | undefined;
    use?: string | ContentData[] | undefined;
    text?: string | ContentData[] | undefined;
};
export type CoreUIElements = {
    accordion?: import("./components/AccordionModel.js").AccordionModel | undefined;
    autocomplete?: import("./components/AutocompleteModel.js").AutocompleteModel | undefined;
    banner?: import("./components/BannerModel.js").BannerModel | undefined;
    breadcrumb?: import("./components/BreadcrumbModel.js").BreadcrumbModel | undefined;
    button?: import("./components/ButtonModel.js").ButtonModel | undefined;
    comment?: import("./components/CommentModel.js").CommentModel | undefined;
    confirm?: import("./components/ConfirmModel.js").ConfirmModel | undefined;
    emptyState?: import("./components/EmptyStateModel.js").EmptyStateModel | undefined;
    faq?: import("./components/FAQModel.js").FAQModel | undefined;
    featureGrid?: import("./components/FeatureGridModel.js").FeatureGridModel | undefined;
    gallery?: import("./components/GalleryModel.js").GalleryModel | undefined;
    header?: import("./HeaderModel.js").HeaderModel | undefined;
    footer?: import("./FooterModel.js").FooterModel | undefined;
    input?: import("./components/InputModel.js").InputModel | undefined;
    markdown?: import("./components/MarkdownModel.js").MarkdownModel | undefined;
    price?: import("./components/PriceModel.js").PriceModel | undefined;
    pricing?: import("./components/PricingModel.js").PricingModel | undefined;
    pricingSection?: import("./components/PricingSectionModel.js").PricingSectionModel | undefined;
    profileDropdown?: import("./components/ProfileDropdownModel.js").ProfileDropdownModel | undefined;
    select?: import("./components/SelectModel.js").SelectModel | undefined;
    shell?: import("./components/ShellModel.js").ShellModel | undefined;
    spinner?: import("./components/SpinnerModel.js").SpinnerModel | undefined;
    statsItem?: import("./components/StatsItemModel.js").StatsItemModel | undefined;
    stats?: import("./components/StatsModel.js").StatsModel | undefined;
    tableUI?: import("./components/TableModel.js").TableModel | undefined;
    tabs?: import("./components/TabsModel.js").TabsModel | undefined;
    testimonial?: import("./components/TestimonialModel.js").TestimonialModel | undefined;
    timelineItem?: import("./components/TimelineItemModel.js").TimelineItemModel | undefined;
    timeline?: import("./components/TimelineModel.js").TimelineModel | undefined;
    toast?: import("./components/ToastModel.js").ToastModel | undefined;
    tree?: import("./components/TreeModel.js").TreeModel | undefined;
    /**
     * - Інтерактивний Drag-n-Drop контейнер
     */
    sortable?: ContentData[] | undefined;
};
export type ContentData = Partial<Content & HTML5Elements & CoreUIElements> & Record<string, any>;
import { Model } from '@nan0web/types';
