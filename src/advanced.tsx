import {
  useContext,
  createContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import { Modal } from "./components";

type ClassName = { className?: string };
const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");

const UIContext = createContext({ locale: "en-US" });
export function UIProvider({ locale = "en-US", children }: { locale?: string; children: ReactNode }) {
  return <UIContext.Provider value={{ locale }}>{children}</UIContext.Provider>;
}
export const useUILocale = () => useContext(UIContext).locale;

export function Icon({
  icon: Glyph,
  size = 18,
  label,
  className,
  ...props
}: { icon: LucideIcon; size?: number; label?: string } & ClassName) {
  return (
    <Glyph
      size={size}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={className}
      {...props}
    />
  );
}

export function Heading({
  level = 2,
  children,
  className,
}: { level?: 1 | 2 | 3 | 4 | 5 | 6; children: ReactNode } & ClassName) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag className={cx(`asphalt-heading-${level}`, className)}>{children}</Tag>;
}
export function Text({
  children,
  as: Tag = "p",
  className,
}: { children: ReactNode; as?: "p" | "span" | "small" } & ClassName) {
  return <Tag className={cx("asphalt-text", className)}>{children}</Tag>;
}
export function Link({ children, className, ...props }: ComponentPropsWithoutRef<"a">) {
  return (
    <a className={cx("asphalt-link", className)} {...props}>
      {children}
    </a>
  );
}
export function Blockquote({ children, className }: { children: ReactNode } & ClassName) {
  return <blockquote className={cx("asphalt-blockquote", className)}>{children}</blockquote>;
}

export function Textarea({ className, ...props }: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={cx("asphalt-input asphalt-textarea", className)} {...props} />;
}
export type InputMask = "phone" | "card" | "date";
const formatMask = (value: string, mask?: InputMask) => {
  const d = value.replace(/\D/g, "");
  if (mask === "phone")
    return d
      .slice(0, 10)
      .replace(/(\d{0,3})(\d{0,3})(\d{0,4})/, (_, a, b, c) =>
        [a && `(${a}`, a.length === 3 && ")", b, c].filter(Boolean).join(a.length === 3 && b ? " " : ""),
      )
      .trim();
  if (mask === "card")
    return d
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  if (mask === "date")
    return d.slice(0, 8).replace(/(\d{2})(\d{0,2})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join("/"));
  return value;
};
export function MaskedInput({
  mask,
  onChange,
  ...props
}: Omit<ComponentPropsWithoutRef<"input">, "onChange"> & {
  mask?: InputMask;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      {...props}
      className={cx("asphalt-input", props.className)}
      onChange={(event) => {
        if (mask) event.currentTarget.value = formatMask(event.currentTarget.value, mask);
        onChange?.(event);
      }}
    />
  );
}

export function Checkbox({
  label,
  className,
  ...props
}: ComponentPropsWithoutRef<"input"> & { label?: ReactNode } & ClassName) {
  const node = <input type="checkbox" className="asphalt-checkbox" {...props} />;
  return label ? (
    <label className={cx("asphalt-check-label", className)}>
      {node}
      {label}
    </label>
  ) : (
    node
  );
}
export function RadioGroup<T extends string>({
  value,
  onValueChange,
  options,
  label,
}: {
  value: T;
  onValueChange: (value: T) => void;
  label: string;
  options: readonly { value: T; label: ReactNode; disabled?: boolean }[];
}) {
  return (
    <div className="asphalt-radio-group" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => onValueChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
export function Slider({
  value,
  onValueChange,
  label,
  ...props
}: Omit<ComponentPropsWithoutRef<"input">, "type" | "value" | "onChange"> & {
  value: number;
  onValueChange: (value: number) => void;
  label: string;
}) {
  return (
    <input
      type="range"
      className="asphalt-slider"
      value={value}
      aria-label={label}
      onChange={(event) => onValueChange(Number(event.target.value))}
      {...props}
    />
  );
}
export { Toggle as Switch } from "./components";

export function Combobox<T extends string>({
  items,
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "Select…",
  label,
}: {
  items: readonly { value: T; label: string; disabled?: boolean }[];
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T | null) => void;
  placeholder?: string;
  label: string;
}) {
  const [internalValue, setInternalValue] = useState<T | null>(defaultValue);
  const selectedValue = value === undefined ? internalValue : value;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = useMemo(
    () => items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );
  const select = (next: T | null) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  useEffect(() => {
    const close = (event: MouseEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="asphalt-combobox">
      <input
        className="asphalt-input"
        aria-label={label}
        aria-expanded={open}
        aria-controls={`${label}-options`}
        role="combobox"
        value={open ? query : (items.find((item) => item.value === selectedValue)?.label ?? "")}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            setQuery("");
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          }
          if (event.key === "Enter" && filtered[active] && !filtered[active].disabled) {
            select(filtered[active].value);
            setOpen(false);
            setQuery("");
          }
        }}
      />
      {open && (
        <ul id={`${label}-options`} role="listbox" className="asphalt-combobox-menu">
          {filtered.map((item, index) => (
            <li key={item.value} role="option" aria-selected={selectedValue === item.value}>
              <button
                type="button"
                data-active={index === active || undefined}
                disabled={item.disabled}
                onClick={() => {
                  select(item.value);
                  setOpen(false);
                  setQuery("");
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MultiSelect<T extends string>({
  items,
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "Select…",
  label,
}: {
  items: readonly { value: T; label: string; disabled?: boolean }[];
  value?: readonly T[];
  defaultValue?: readonly T[];
  onValueChange?: (value: T[]) => void;
  placeholder?: string;
  label: string;
}) {
  const [internalValue, setInternalValue] = useState<T[]>([...defaultValue]);
  const selected = value === undefined ? internalValue : [...value];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const toggle = (next: T) => {
    const result = selected.includes(next) ? selected.filter((item) => item !== next) : [...selected, next];
    if (value === undefined) setInternalValue(result);
    onValueChange?.(result);
  };
  useEffect(() => {
    const close = (event: MouseEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const text = selected
    .map((item) => items.find((option) => option.value === item)?.label)
    .filter(Boolean)
    .join(", ");
  return (
    <div ref={ref} className="asphalt-multi-select">
      <button
        type="button"
        className="asphalt-input asphalt-multi-select__trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
      >
        {text || placeholder}
        <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="asphalt-multi-select__menu" role="listbox" aria-label={label}>
          {items.map((item) => (
            <label key={item.value} className="asphalt-multi-select__option">
              <input
                type="checkbox"
                checked={selected.includes(item.value)}
                disabled={item.disabled}
                onChange={() => toggle(item.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

const dayKey = (date: Date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
export function DatePicker({
  value,
  onValueChange,
  locale,
  label,
}: {
  value: Date | null;
  onValueChange: (value: Date | null) => void;
  locale?: string;
  label: string;
}) {
  const currentLocale = locale ?? useUILocale();
  const [cursor, setCursor] = useState(value ?? new Date());
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const weekStartsMonday = currentLocale.toLowerCase().startsWith("ru");
  const weekday = new Intl.DateTimeFormat(currentLocale, { weekday: "narrow" });
  const firstOffset = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + (weekStartsMonday ? 6 : 0)) % 7;
  const choose = (date: Date) => {
    setCursor(date);
    onValueChange(date);
  };
  const move = (date: Date, amount: number) =>
    choose(new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount));
  return (
    <div className="asphalt-date-picker" role="group" aria-label={label}>
      <div className="asphalt-date-picker__header">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
        >
          ‹
        </button>
        <span>{new Intl.DateTimeFormat(currentLocale, { month: "long", year: "numeric" }).format(cursor)}</span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
        >
          ›
        </button>
      </div>
      <div className="asphalt-date-picker__weekdays">
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index}>{weekday.format(new Date(2024, 0, (weekStartsMonday ? 1 : 7) + index))}</span>
        ))}
      </div>
      <div className="asphalt-date-picker__grid">
        {Array.from({ length: firstOffset }, (_, index) => (
          <span key={`empty-${index}`} aria-hidden="true" />
        ))}
        {Array.from({ length: days }, (_, index) => {
          const date = new Date(cursor.getFullYear(), cursor.getMonth(), index + 1);
          return (
            <button
              key={dayKey(date)}
              type="button"
              aria-label={new Intl.DateTimeFormat(currentLocale, { dateStyle: "full" }).format(date)}
              data-selected={(value && dayKey(value) === dayKey(date)) || undefined}
              onClick={() => choose(date)}
              onKeyDown={(event) => {
                const offset =
                  event.key === "ArrowRight"
                    ? 1
                    : event.key === "ArrowLeft"
                      ? -1
                      : event.key === "ArrowDown"
                        ? 7
                        : event.key === "ArrowUp"
                          ? -7
                          : 0;
                if (offset) {
                  event.preventDefault();
                  move(date, offset);
                }
              }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export function TimePicker({
  value,
  onValueChange,
  locale,
  label,
}: {
  value: string;
  onValueChange: (value: string) => void;
  locale?: string;
  label: string;
}) {
  const is12 = (locale ?? useUILocale()).toLowerCase().startsWith("en-us");
  return (
    <input
      className="asphalt-input"
      type="time"
      value={value}
      aria-label={label}
      onChange={(event) => onValueChange(event.target.value)}
      data-hour-cycle={is12 ? "12" : "24"}
    />
  );
}

export type UploadFile = {
  id: string;
  file: File;
  previewUrl?: string;
  status?: "idle" | "uploading" | "success" | "error";
  error?: string;
};
export function FileUpload({
  files,
  onFilesChange,
  upload,
  accept,
  multiple = true,
}: {
  files: readonly UploadFile[];
  onFilesChange: (files: UploadFile[]) => void;
  upload?: (file: File) => Promise<void>;
  accept?: string;
  multiple?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const add = async (list: FileList | null) => {
    if (!list) return;
    const next = [
      ...files,
      ...Array.from(list).map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        status: upload ? ("uploading" as const) : ("idle" as const),
      })),
    ];
    onFilesChange(next);
    if (upload)
      await Promise.all(
        next
          .filter((item) => item.status === "uploading")
          .map(async (item) => {
            try {
              await upload(item.file);
              onFilesChange(next.map((value) => (value.id === item.id ? { ...value, status: "success" } : value)));
            } catch (error) {
              onFilesChange(
                next.map((value) =>
                  value.id === item.id
                    ? { ...value, status: "error", error: error instanceof Error ? error.message : "Upload failed" }
                    : value,
                ),
              );
            }
          }),
      );
  };
  return (
    <div
      className="asphalt-file-upload"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void add(event.dataTransfer.files);
      }}
    >
      <input
        ref={input}
        aria-label="Choose files"
        className="sr-only"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => void add(event.target.files)}
      />
      <button type="button" className="asphalt-btn" onClick={() => input.current?.click()}>
        Choose files
      </button>
      <span>Drop files here</span>
      {files.map((item) => (
        <div key={item.id}>
          {item.previewUrl && <img src={item.previewUrl} alt="" />} {item.file.name} · {item.status}
        </div>
      ))}
    </div>
  );
}

export function Accordion({ items }: { items: readonly { id: string; title: ReactNode; content: ReactNode }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="asphalt-accordion">
      {items.map((item) => (
        <section key={item.id}>
          <button
            type="button"
            aria-expanded={open === item.id}
            onClick={() => setOpen(open === item.id ? null : item.id)}
          >
            {item.title}
          </button>
          {open === item.id && <div>{item.content}</div>}
        </section>
      ))}
    </div>
  );
}
export function Tabs<T extends string>({
  value,
  onValueChange,
  items,
  label,
}: {
  value: T;
  onValueChange: (value: T) => void;
  label: string;
  items: readonly { value: T; label: ReactNode; content: ReactNode }[];
}) {
  const active = items.find((item) => item.value === value);
  const move = (direction: number) => {
    const index = Math.max(
      0,
      items.findIndex((item) => item.value === value),
    );
    onValueChange(items[(index + direction + items.length) % items.length].value);
  };
  return (
    <div>
      <div
        className="asphalt-tabs"
        role="tablist"
        aria-label={label}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
          if (event.key === "Home") {
            event.preventDefault();
            onValueChange(items[0].value);
          }
          if (event.key === "End") {
            event.preventDefault();
            onValueChange(items[items.length - 1].value);
          }
        }}
      >
        {items.map((item) => (
          <button
            key={item.value}
            role="tab"
            aria-selected={value === item.value}
            tabIndex={value === item.value ? 0 : -1}
            onClick={() => onValueChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{active?.content}</div>
    </div>
  );
}
export function AvatarGroup({ names, max = 4 }: { names: readonly string[]; max?: number }) {
  const visible = names.slice(0, max);
  return (
    <span className="asphalt-avatar-group">
      {visible.map((name) => (
        <span key={name} className="asphalt-avatar" aria-label={name}>
          {name.slice(0, 1)}
        </span>
      ))}
      {names.length > max && <span className="asphalt-avatar">+{names.length - max}</span>}
    </span>
  );
}
export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <span className="asphalt-tooltip" tabIndex={0}>
      {children}
      <span role="tooltip">{content}</span>
    </span>
  );
}
export function Popover({ trigger, children, label }: { trigger: ReactNode; children: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <span ref={ref} className="asphalt-popover" onKeyDown={(event) => event.key === "Escape" && setOpen(false)}>
      <span className="asphalt-popover__trigger" onClick={() => setOpen(!open)}>
        {trigger}
      </span>
      {open && (
        <span className="asphalt-popover__panel" role="dialog" aria-label={label}>
          {children}
        </span>
      )}
    </span>
  );
}
export function Breadcrumbs({ items }: { items: readonly { label: ReactNode; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="asphalt-breadcrumbs">
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav className="asphalt-pagination" aria-label="Pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span>
        {page} / {pageCount}
      </span>
      <button disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
export function Stepper({ steps, current }: { steps: readonly ReactNode[]; current: number }) {
  return (
    <ol className="asphalt-stepper">
      {steps.map((step, index) => (
        <li key={index} data-current={index === current || undefined} data-complete={index < current || undefined}>
          {step}
        </li>
      ))}
    </ol>
  );
}
export function NavigationMenu({
  items,
}: {
  items: readonly { label: ReactNode; href?: string; onSelect?: () => void }[];
}) {
  return (
    <nav className="asphalt-navigation-menu">
      {items.map((item, index) =>
        item.href ? (
          <a key={index} href={item.href}>
            {item.label}
          </a>
        ) : (
          <button key={index} onClick={item.onSelect}>
            {item.label}
          </button>
        ),
      )}
    </nav>
  );
}

function useOverlay(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    previous.current = document.activeElement as HTMLElement;
    const body = document.body;
    const before = body.style.overflow;
    body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    queueMicrotask(() => ref.current?.querySelector<HTMLElement>("button,input,select,textarea")?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = before;
      previous.current?.focus();
    };
  }, [open, onClose]);
  return ref;
}
export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title: ReactNode;
  children: ReactNode;
}) {
  const ref = useOverlay(open, onClose);
  const titleId = useId();
  if (!open) return null;
  return (
    <div className="asphalt-backdrop">
      <aside
        ref={ref}
        className="asphalt-drawer"
        data-side={side}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header>
          <strong id={titleId}>{title}</strong>
          <button type="button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        {children}
      </aside>
    </div>
  );
}
export const Sheet = Drawer;
export const Dialog = Modal;
