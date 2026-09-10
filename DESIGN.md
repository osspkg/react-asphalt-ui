# @osspkg/asphalt-ui design guide

## Package contract

`@osspkg/asphalt-ui` is a React 18+ package built on Tailwind CSS 4. React, React DOM,
and Tailwind are peer dependencies. It exports components from the package root and its stylesheet from
`@osspkg/asphalt-ui/styles.css`. Consumers own routing, data loading, application
state, and feature-specific copy; this package owns visual primitives and small
interaction semantics only.

```tsx
import { Button, EmptyPanel, PageContent, StatGrid } from "@osspkg/asphalt-ui";
import "@osspkg/asphalt-ui/styles.css";
```

The package compiles its Tailwind component layer during its own build. Your
application must install Tailwind 4 to satisfy the peer dependency; it does not
need to scan the package source or copy its utility classes.

## Tokens

All visual values are semantic CSS custom properties prefixed with `--asphalt-`.
Override them in the consuming application's theme rather than editing package
CSS. The public semantic tokens are: `bg`, `panel`, `raised`, `line`, `text`,
`muted`, `faint`, `primary`, `success`, `info`, and `danger`.

```css
:root {
  --asphalt-primary: #7c3aed;
  --asphalt-bg: #15121c;
}
```

## Components

| Component                                 | Use it for                                                | Do not use it for                                    |
| ----------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `Button`                                  | Triggering a deliberate action                            | A navigation link                                    |
| `IconButton`                              | A compact icon-only action with an accessible label       | An unlabeled decorative icon                         |
| `Input`, `Select`, `MultiSelect`, `Field` | Labeled form controls with semantic validation            | A feature-specific form workflow                     |
| `SearchField`                             | A compact filtering query                                 | A search that needs advanced filters or results UI   |
| `Toggle`                                  | A boolean setting that applies immediately                | A choice that requires Save                          |
| `SegmentedControl`                        | Switching among a small set of peer views                 | Site navigation or a large tab set                   |
| `ProgressBar`                             | A known, bounded completion value                         | Indeterminate loading                                |
| `SectionHeader`                           | Page or section heading, description, and actions         | A global application header                          |
| `Badge`, `StatusDot`, `Avatar`            | Compact identity or state metadata                        | Primary status content that must be read alone       |
| `Modal`                                   | Short focused task or confirmation                        | A full page or nested workflow                       |
| `EmptyState`, `EmptyPanel`                | A clear, actionable absence of collection data            | Loading or error states                              |
| `StatGrid`                                | Two to four comparable summary metrics                    | Dense dashboards or charts                           |
| `PageContent`                             | A bounded, scrollable page body                           | An application shell, navigation, or data provider   |
| `Card`, `CardHeader`, `CardActions`       | A contained feature unit                                  | A replacement for feature-specific data and behavior |
| `ListItem`, `TagInput`                    | Compact selectable rows and removable values              | A complete form or data source                       |
| `DropdownMenu`                            | A short contextual action list                            | Complex nested navigation                            |
| `ConfirmAction`                           | A deliberate second-click destructive action              | Irreversible operations requiring a dedicated dialog |
| `Alert`, `ToastViewport`                  | Inline and transient system feedback                      | The only record of an important failure              |
| `Spinner`, `Skeleton`                     | Loading feedback and layout placeholders                  | A completed empty or error state                     |
| `DataTable`                               | Small, read-only tabular datasets                         | Virtualized, sortable or editable enterprise grids   |
| `AppShell`, `NavigationTree`              | A consumer-owned application frame and compact navigation | Routing, permissions, or application state           |
| `MasterDetail`, `Timeline`                | Selection/detail and chronological content patterns       | Domain data stores or message delivery logic         |
| `CalendarGrid`                            | Displaying consumer-provided calendar cells               | Date math, event persistence, or recurrence logic    |
| `ResourceCard`, `Composer`                | Generic resource summary and text composition             | Feature-specific forms, uploads, or sending logic    |

`AppShell` and `MasterDetail` own their layout boundaries. Their `minHeight`
prop is the supported way to size embedded examples or constrained panels; no
parent-specific CSS overrides are required.

`Button` variants are `primary`, `secondary`, `ghost`, and `destructive`.
`default` is a compatible alias for `secondary`, and `danger` for
`destructive`. `loading` disables the native button and sets `aria-busy`.
`startIcon` and `endIcon` are slots; use `IconButton` for an icon-only action.
`StatGrid` tones are decorative and must not be the only way an important state
is communicated.

## Extended component matrix

`UIProvider` supplies the default locale (`en-US`). `DatePicker` and
`TimePicker` accept a per-component `locale` override. `Icon` wraps a Lucide
icon passed as `icon`; `lucide-react` is a peer dependency.

Forms include `Textarea`, `MaskedInput` (`phone`, `card`, `date`), `Select`,
`MultiSelect`, `Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `DatePicker`, `TimePicker`, and
`FileUpload`. `Input` accepts `startAdornment` and `endAdornment` slots.
`Field` supplies label, required marker, description and error; when its
`disabled` prop is set, it also disables a single native control child.

`Select` keeps a visually hidden native select for form compatibility and uses
a themed custom trigger/menu for rendering. It accepts normal select options,
supports controlled `value` or `defaultValue`, and closes on Escape or
click-away. `MultiSelect` accepts `value`/`onValueChange` or `defaultValue`,
renders checkbox options, keeps the menu open while multiple values are
chosen, and closes on Escape or click-away.

`Combobox` is controlled with `value`/`onValueChange`, or uncontrolled with
`defaultValue`; it filters locally, supports arrows and Enter, and closes on
Escape or click-away. Date and time pickers are controlled; their locale comes
from `UIProvider` unless overridden. `FileUpload` is controlled through
`files`/`onFilesChange`; its optional `upload(file)` callback sets uploading,
success, or error state. It never chooses a network transport itself.

`Accordion`, `Tabs`, `AvatarGroup`, `Tooltip`, `Popover`, `Breadcrumbs`,
`Pagination`, `Stepper`, `NavigationMenu`, `Drawer`, and `Sheet` are provided
alongside the existing primitives. `DataTable` intentionally remains
presentational: it does not sort, paginate, or virtualize rows.

## Building a new page

Start with a page-level feature component. It owns data and passes plain values
and callbacks to UI components. Compose a page in this order:

1. `PageContent` sets the readable width and scroll region.
2. Put an optional `StatGrid` at the top when the values are comparable.
3. Add feature controls and feature-owned cards or rows.
4. Replace an empty collection with `EmptyPanel`, including the next useful action.

```tsx
function ProjectsPage() {
  const projects = useProjects();
  return (
    <PageContent maxWidth={960}>
      <StatGrid items={[{ value: projects.length, label: "projects", tone: "info" }]} />
      {projects.length === 0 ? (
        <EmptyPanel title="No projects">Create your first project.</EmptyPanel>
      ) : (
        <ProjectList projects={projects} />
      )}
    </PageContent>
  );
}
```

Do not create a new component solely to hide ten lines of JSX. Extract it when
the same structure appears in at least three independent features, when it has
its own accessibility behavior, or when a change must be synchronized across
uses. Keep domain cards and data mutations in the feature that owns them.

## Accessibility and keyboard behavior

Use a text label with every `Input`, `Select`, `MultiSelect`, and `Toggle`. Decorative `Icon`
instances are hidden from assistive technology; pass `label` for a meaningful
icon-only icon. Buttons retain native keyboard behavior and visible focus.

`Modal`/`Dialog` and `Drawer`/`Sheet` close on Escape or their explicit close
button; clicking outside does not close them. Both overlay types lock document
scrolling, trap Tab focus, and restore the
opener's focus when unmounted. Tabs support Left/Right/Home/End. Tooltip is
exposed on hover and focus; Popover and Combobox close on Escape and click-away.
Do not rely on tone alone for errors or critical statuses; provide label text too.
