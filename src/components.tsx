import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { Search } from "lucide-react";

type ClassName = { className?: string };
const join = (...names: Array<string | undefined>) => names.filter(Boolean).join(" ");
let lastFocusedElement: HTMLElement | null = null;
if (typeof document !== "undefined") {
  const remember = (target: EventTarget | null) => {
    if (target instanceof HTMLElement)
      lastFocusedElement = target.closest("button,[href],input,select,textarea,[tabindex]") ?? target;
  };
  document.addEventListener("focusin", (event) => remember(event.target), true);
  document.addEventListener("pointerdown", (event) => remember(event.target), true);
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  loading,
  startIcon,
  endIcon,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "secondary" | "ghost" | "danger" | "destructive";
  size?: "sm" | "md";
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}) {
  const resolved = variant === "default" ? "secondary" : variant === "danger" ? "destructive" : variant;
  return (
    <button
      className={join(
        "asphalt-btn",
        `asphalt-btn--${resolved}`,
        size === "sm" ? "asphalt-btn--sm" : undefined,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="asphalt-spinner" />} {!loading && startIcon}
      {children}
      {endIcon}
    </button>
  );
}

/** Compact control for an icon-only action. An accessible name is mandatory. */
export function IconButton({
  label,
  className,
  children,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> & {
  label: string;
  children: ReactNode;
} & ClassName) {
  return (
    <button className={join("asphalt-icon-button", className)} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function Input({
  className,
  startAdornment,
  endAdornment,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { startAdornment?: ReactNode; endAdornment?: ReactNode }) {
  const input = <input className={join("asphalt-input", className)} {...props} />;
  if (!startAdornment && !endAdornment) return input;
  return (
    <span className="asphalt-input-adornment">
      {startAdornment && <span aria-hidden="true">{startAdornment}</span>}
      {input}
      {endAdornment && <span aria-hidden="true">{endAdornment}</span>}
    </span>
  );
}

export function Select({
  className,
  children,
  value,
  defaultValue,
  onChange,
  disabled,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const options = Children.toArray(children)
    .filter((child): child is ReactElement<{ value?: string | number; children?: ReactNode }> => isValidElement(child))
    .map((child) => ({ value: String(child.props.value ?? child.props.children), label: child.props.children }));
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? options[0]?.value ?? ""));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const selected = value === undefined ? internalValue : String(value);
  const selectedOption = options.find((option) => option.value === selected) ?? options[0];
  const choose = (next: string) => {
    if (value === undefined) setInternalValue(next);
    setOpen(false);
    onChange?.({ target: { value: next } } as unknown as ChangeEvent<HTMLSelectElement>);
  };
  return (
    <div ref={ref} className={join("asphalt-select-wrap", className)}>
      <select {...props} disabled={disabled} value={selected} onChange={onChange} className="asphalt-select-native">
        {children}
      </select>
      <button
        type="button"
        className="asphalt-input asphalt-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
      >
        {selectedOption?.label ?? "Select…"}
        <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="asphalt-select-menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={selected === option.value}
              key={option.value}
              onClick={() => choose(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchField({
  label = "Search",
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label?: string } & ClassName) {
  return (
    <label className={join("asphalt-search", className)}>
      <span aria-hidden="true">
        <Search size={14} strokeWidth={1.8} />
      </span>
      <input type="search" className="asphalt-input" aria-label={label} {...props} />
    </label>
  );
}

export function Badge({ children, className }: { children: ReactNode } & ClassName) {
  return <span className={join("asphalt-badge", className)}>{children}</span>;
}

export function Field({
  label,
  hint,
  description,
  error,
  required,
  disabled,
  children,
}: {
  label: string;
  hint?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  const control =
    disabled && isValidElement(children)
      ? cloneElement(children as ReactElement<{ disabled?: boolean }>, { disabled: true })
      : children;
  return (
    <label className="asphalt-field" data-error={Boolean(error) || undefined} data-disabled={disabled || undefined}>
      <span className="asphalt-label">
        {label}
        {required && " *"}
      </span>
      {control}
      {description && <span className="asphalt-hint">{description}</span>}
      {hint && <span className="asphalt-hint">{hint}</span>}
      {error && (
        <span className="asphalt-field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

export function Toggle({
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <label className="asphalt-toggle-wrap">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className="asphalt-toggle"
        data-checked={checked || undefined}
        onClick={() => onCheckedChange(!checked)}
      >
        <span />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";
  return (
    <span className="asphalt-avatar" style={{ width: size, height: size, fontSize: size * 0.34 }} aria-label={name}>
      {initials}
    </span>
  );
}

export function StatusDot({
  tone = "neutral",
  pulse = false,
  label,
}: {
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
  pulse?: boolean;
  label?: string;
}) {
  return (
    <span className="asphalt-status">
      <span className={join("asphalt-dot", `asphalt-dot--${tone}`, pulse ? "asphalt-dot--pulse" : undefined)} />
      {label && <span>{label}</span>}
    </span>
  );
}

export type Segment<T extends string> = { value: T; label: ReactNode; disabled?: boolean };
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  items,
  ariaLabel,
}: {
  value: T;
  onValueChange: (value: T) => void;
  items: readonly Segment<T>[];
  ariaLabel: string;
}) {
  return (
    <div className="asphalt-segmented" role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          disabled={item.disabled}
          data-active={value === item.value || undefined}
          onClick={() => onValueChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const percent = Math.max(0, Math.min(100, value));
  return (
    <div
      className="asphalt-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="asphalt-section-header">
      <div>
        {eyebrow && <div className="asphalt-section-header__eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="asphalt-section-header__actions">{actions}</div>}
    </header>
  );
}

export function Modal({
  title,
  children,
  footer,
  onClose,
  width = 560,
}: {
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  width?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const active = document.activeElement;
    previous.current =
      lastFocusedElement ?? (active instanceof HTMLElement && active !== document.body ? active : null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = ref.current?.querySelectorAll<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    queueMicrotask(() =>
      ref.current
        ?.querySelector<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
        ?.focus(),
    );
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous.current?.focus();
    };
  }, [onClose]);
  return (
    <div className="asphalt-backdrop">
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className="asphalt-modal"
        style={{ maxWidth: width }}
      >
        <header>
          <h2>{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            ×
          </Button>
        </header>
        <div className="asphalt-modal__body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </section>
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: ReactNode }) {
  return (
    <div className="asphalt-empty">
      {icon && <div className="asphalt-empty__icon">{icon}</div>}
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}

export function EmptyPanel(props: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="asphalt-empty-panel">
      <EmptyState icon={props.icon} title={props.title} description={props.children} />
    </div>
  );
}

export type Stat = { value: ReactNode; label: string; tone?: "default" | "success" | "warning" | "danger" | "info" };
export function StatGrid({ items }: { items: readonly Stat[] }) {
  return (
    <div className="asphalt-stat-grid" role="list">
      {items.map((item) => (
        <div className="asphalt-stat" role="listitem" key={item.label}>
          <strong data-tone={item.tone ?? "default"}>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PageContent({
  children,
  maxWidth = 960,
  className,
}: {
  children: ReactNode;
  maxWidth?: number;
  className?: string;
}) {
  return (
    <main className={join("asphalt-page", className)}>
      <div style={{ maxWidth }}>{children}</div>
    </main>
  );
}

export function Card({ children, className }: { children: ReactNode } & ClassName) {
  return <section className={join("asphalt-card", className)}>{children}</section>;
}
export function CardHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="asphalt-card__header">
      <div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </header>
  );
}
export function CardActions({ children }: { children: ReactNode }) {
  return <footer className="asphalt-card__actions">{children}</footer>;
}

export function ConfirmAction({
  children,
  confirmLabel = "Confirm",
  timeout = 2600,
  onConfirm,
  className,
}: { children: ReactNode; confirmLabel?: ReactNode; timeout?: number; onConfirm: () => void } & ClassName) {
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), timeout);
    return () => clearTimeout(timer);
  }, [confirming, timeout]);
  return (
    <Button
      className={className}
      variant={confirming ? "danger" : "ghost"}
      size="sm"
      onClick={() => (confirming ? (onConfirm(), setConfirming(false)) : setConfirming(true))}
    >
      {confirming ? confirmLabel : children}
    </Button>
  );
}

export function ListItem({
  children,
  selected = false,
  onClick,
  actions,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  actions?: ReactNode;
}) {
  const content = (
    <>
      <div className="asphalt-list-item__content">{children}</div>
      {actions && <div className="asphalt-list-item__actions">{actions}</div>}
    </>
  );
  return onClick ? (
    <button type="button" className="asphalt-list-item" data-selected={selected || undefined} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className="asphalt-list-item" data-selected={selected || undefined}>
      {content}
    </div>
  );
}

export function TagInput({
  values,
  onRemove,
  label = "Remove",
}: {
  values: readonly string[];
  onRemove: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="asphalt-tag-input">
      {values.map((value) => (
        <Badge key={value}>
          {value}
          <button type="button" onClick={() => onRemove(value)} aria-label={`${label} ${value}`}>
            ×
          </button>
        </Badge>
      ))}
    </div>
  );
}

export type MenuItem = { label: ReactNode; onSelect: () => void; disabled?: boolean; tone?: "default" | "danger" };
export function DropdownMenu({
  trigger,
  items,
  label,
}: {
  trigger: ReactNode;
  items: readonly MenuItem[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="asphalt-menu" ref={ref}>
      <span onClick={() => setOpen((value) => !value)}>{trigger}</span>
      {open && (
        <div className="asphalt-menu__panel" role="menu" aria-label={label}>
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              data-tone={item.tone}
              onClick={() => {
                item.onSelect();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="asphalt-alert" data-tone={tone} role={tone === "danger" ? "alert" : "status"}>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </div>
  );
}
export function Spinner({ label = "Loading" }: { label?: string }) {
  return <span className="asphalt-spinner" role="status" aria-label={label} />;
}
export function Skeleton({
  width,
  height = 14,
  className,
}: { width?: number | string; height?: number | string } & ClassName) {
  return <span className={join("asphalt-skeleton", className)} style={{ width, height }} aria-hidden="true" />;
}

export type Toast = { id: string; tone?: "success" | "info" | "error"; message: ReactNode };
export function ToastViewport({ toasts, onDismiss }: { toasts: readonly Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="asphalt-toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div className="asphalt-toast" data-tone={toast.tone ?? "info"} key={toast.id}>
          <span>{toast.message}</span>
          <IconButton label="Dismiss" onClick={() => onDismiss(toast.id)}>
            ×
          </IconButton>
        </div>
      ))}
    </div>
  );
}

export type DataColumn<T> = { key: string; header: ReactNode; cell: (row: T) => ReactNode };
export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  empty,
  stickyHeader = false,
}: {
  rows: readonly T[];
  columns: readonly DataColumn<T>[];
  getRowKey: (row: T) => string;
  empty?: ReactNode;
  stickyHeader?: boolean;
}) {
  return (
    <div className="asphalt-table-wrap">
      <table className="asphalt-table" data-sticky-header={stickyHeader || undefined}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.cell(row)}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>{empty ?? "No data"}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Generic two-region application frame. Navigation content stays consumer-owned. */
export function AppShell({
  navigation,
  header,
  children,
  minHeight = "100vh",
}: {
  navigation: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  minHeight?: number | string;
}) {
  return (
    <div className="asphalt-shell" style={{ minHeight }}>
      <aside>{navigation}</aside>
      <div>
        <header>{header}</header>
        <main>{children}</main>
      </div>
    </div>
  );
}
export type NavigationGroup = {
  label?: ReactNode;
  items: ReadonlyArray<{ id: string; label: ReactNode; icon?: ReactNode; badge?: ReactNode; disabled?: boolean }>;
};
export function NavigationTree({
  groups,
  activeId,
  onSelect,
  label = "Navigation",
}: {
  groups: readonly NavigationGroup[];
  activeId?: string;
  onSelect: (id: string) => void;
  label?: string;
}) {
  return (
    <nav className="asphalt-nav" aria-label={label}>
      {groups.map((group, index) => (
        <div key={index}>
          {group.label && <div className="asphalt-nav__label">{group.label}</div>}
          {group.items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              data-active={activeId === item.id || undefined}
              onClick={() => onSelect(item.id)}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge && <span className="asphalt-nav__badge">{item.badge}</span>}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
export function MasterDetail({
  master,
  detail,
  minHeight = 360,
}: {
  master: ReactNode;
  detail: ReactNode;
  minHeight?: number | string;
}) {
  return (
    <div className="asphalt-master-detail" style={{ minHeight }}>
      <section>{master}</section>
      <section>{detail}</section>
    </div>
  );
}
export type TimelineItem = {
  id: string;
  heading: ReactNode;
  meta?: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
};
export function Timeline({ items, label = "Timeline" }: { items: readonly TimelineItem[]; label?: string }) {
  return (
    <ol className="asphalt-timeline" aria-label={label}>
      {items.map((item) => (
        <li key={item.id}>
          {item.icon && <span className="asphalt-timeline__icon">{item.icon}</span>}
          <div>
            <div className="asphalt-timeline__heading">
              {item.heading}
              <span>{item.meta}</span>
            </div>
            {item.body && <div className="asphalt-timeline__body">{item.body}</div>}
            {item.actions && <div className="asphalt-timeline__actions">{item.actions}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
export type CalendarDay = {
  id: string;
  label: ReactNode;
  muted?: boolean;
  current?: boolean;
  content?: ReactNode;
  onSelect?: () => void;
};
export function CalendarGrid({
  weekdays,
  days,
  label = "Calendar",
}: {
  weekdays: readonly ReactNode[];
  days: readonly CalendarDay[];
  label?: string;
}) {
  return (
    <div
      className="asphalt-calendar"
      role="grid"
      aria-label={label}
      style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
    >
      {weekdays.map((day, index) => (
        <div key={index} role="columnheader">
          {day}
        </div>
      ))}
      {days.map((day) => (
        <button
          key={day.id}
          type="button"
          role="gridcell"
          data-muted={day.muted || undefined}
          data-current={day.current || undefined}
          onClick={day.onSelect}
        >
          <strong>{day.label}</strong>
          {day.content && <span className="asphalt-calendar__content">{day.content}</span>}
        </button>
      ))}
    </div>
  );
}
export function ResourceCard({
  icon,
  title,
  meta,
  status,
  children,
  actions,
}: {
  icon?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Card className="asphalt-resource-card">
      <CardHeader
        title={
          <>
            {icon && <span className="asphalt-resource-card__icon">{icon}</span>}
            {title}
          </>
        }
        description={meta}
        actions={status}
      />
      {children && <div className="asphalt-resource-card__body">{children}</div>}
      {actions && <CardActions>{actions}</CardActions>}
    </Card>
  );
}
export function Composer({
  value,
  onChange,
  placeholder = "Write a message…",
  actions,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="asphalt-composer">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {actions && <footer>{actions}</footer>}
    </div>
  );
}
