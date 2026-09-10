import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles.css";
import {
  Alert,
  AppShell,
  Avatar,
  Badge,
  Button,
  CalendarGrid,
  Card,
  CardActions,
  CardHeader,
  Composer,
  ConfirmAction,
  DataTable,
  DropdownMenu,
  EmptyPanel,
  EmptyState,
  Field,
  IconButton,
  Input,
  ListItem,
  MasterDetail,
  Modal,
  NavigationTree,
  PageContent,
  ProgressBar,
  ResourceCard,
  SearchField,
  SectionHeader,
  SegmentedControl,
  Select,
  Skeleton,
  Spinner,
  StatGrid,
  StatusDot,
  TagInput,
  Timeline,
  ToastViewport,
  Toggle,
} from "../../src";
import {
  Accordion,
  AvatarGroup,
  Blockquote,
  Breadcrumbs,
  Checkbox,
  Combobox,
  DatePicker,
  Drawer,
  FileUpload,
  Heading,
  Icon,
  Link,
  MaskedInput,
  MultiSelect,
  NavigationMenu,
  Pagination,
  Popover,
  RadioGroup,
  Slider,
  Stepper,
  Switch,
  Tabs,
  Text,
  Textarea,
  TimePicker,
  Tooltip,
  UIProvider,
} from "../../src";
import { Calendar, Info } from "lucide-react";
import "./demo.css";

function Demo() {
  const [enabled, setEnabled] = useState(true);
  const [modal, setModal] = useState(false);
  const [tags, setTags] = useState(["Design", "Frontend"]);
  const [toasts, setToasts] = useState([{ id: "saved", tone: "success" as const, message: "Changes saved" }]);
  const [tab, setTab] = useState<"overview" | "activity">("overview");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState("");
  const [combo, setCombo] = useState<string | null>(null);
  const [multiPlan, setMultiPlan] = useState<string[]>(["team"]);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("09:30");
  const [files, setFiles] = useState<any[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [matrixEnabled, setMatrixEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  return (
    <PageContent maxWidth={1000} className="demo">
      <SectionHeader
        eyebrow="React UI kit"
        title="Asphalt UI"
        description="Composable primitives for intentional, readable product pages."
        actions={
          <>
            <IconButton label="Refresh">↻</IconButton>
            <Button variant="primary" onClick={() => setModal(true)}>
              Open modal
            </Button>
          </>
        }
      />
      <section>
        <h2>Actions and form controls</h2>
        <div className="demo__row">
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <IconButton label="Add item">+</IconButton>
        </div>
        <div className="demo__form">
          <Field label="Workspace" hint="A clear helper text belongs below the input.">
            <Input defaultValue="Northwind" />
          </Field>
          <Field label="Plan">
            <Select defaultValue="team">
              <option value="starter">Starter</option>
              <option value="team">Team</option>
            </Select>
          </Field>
          <Toggle
            checked={enabled}
            onCheckedChange={setEnabled}
            label={enabled ? "Notifications enabled" : "Notifications disabled"}
          />
        </div>
      </section>
      <section>
        <h2>Identity and status</h2>
        <div className="demo__row">
          <Avatar name="Ada Lovelace" />
          <Badge>New</Badge>
          <StatusDot tone="success" pulse label="Online" />
          <StatusDot tone="warning" label="Syncing" />
          <StatusDot tone="danger" label="Error" />
          <StatusDot tone="info" label="Info" />
        </div>
      </section>
      <section>
        <h2>Navigation and feedback</h2>
        <div className="demo__row">
          <SearchField placeholder="Search projects…" />
          <SegmentedControl
            ariaLabel="Project view"
            value={tab}
            onValueChange={setTab}
            items={[
              { value: "overview", label: "Overview" },
              { value: "activity", label: "Activity" },
            ]}
          />
        </div>
        <div className="demo__progress">
          <span>Migration progress</span>
          <ProgressBar value={68} label="Migration progress: 68 percent" />
        </div>
      </section>
      <section>
        <h2>Page patterns</h2>
        <StatGrid
          items={[
            { value: "124", label: "projects" },
            { value: "98%", label: "healthy", tone: "success" },
            { value: "12", label: "needs review", tone: "warning" },
            { value: "3", label: "blocked", tone: "danger" },
          ]}
        />
        <div className="demo__empties">
          <EmptyState icon="✦" title="Nothing selected" description="Choose an item to inspect its details." />
          <EmptyPanel icon="⌁" title="No deployments">
            Create a deployment to see its history here.
          </EmptyPanel>
        </div>
      </section>
      <section>
        <h2>Composition and system feedback</h2>
        <div className="demo__grid">
          <Card>
            <CardHeader
              title="Release candidate"
              description="Ready for review"
              actions={
                <DropdownMenu
                  label="Release actions"
                  trigger={<IconButton label="Release actions">⋯</IconButton>}
                  items={[
                    { label: "Duplicate", onSelect: () => {} },
                    { label: "Delete", tone: "danger", onSelect: () => {} },
                  ]}
                />
              }
            />
            <ProgressBar value={72} label="Release completion" />
            <CardActions>
              <ConfirmAction
                confirmLabel="Delete release"
                onConfirm={() =>
                  setToasts((value) => [
                    ...value,
                    { id: String(Date.now()), tone: "error", message: "Release deleted" },
                  ])
                }
              >
                Delete
              </ConfirmAction>
              <Button size="sm">Review</Button>
            </CardActions>
          </Card>
          <Card>
            <CardHeader title="Recipients" />
            <TagInput values={tags} onRemove={(tag) => setTags((value) => value.filter((item) => item !== tag))} />
            <ListItem selected actions={<Badge>Owner</Badge>}>
              Ada Lovelace
            </ListItem>
            <ListItem>Grace Hopper</ListItem>
          </Card>
        </div>
        <div className="demo__grid">
          <Alert tone="warning" title="Attention">
            A deployment requires approval.
          </Alert>
          <div className="demo__loading">
            <Spinner label="Loading projects" />
            <Skeleton width="85%" />
            <Skeleton width="55%" />
          </div>
        </div>
        <DataTable
          rows={[
            { id: "1", name: "Atlas", status: "Healthy" },
            { id: "2", name: "Relay", status: "Review" },
          ]}
          getRowKey={(row) => row.id}
          columns={[
            { key: "name", header: "Project", cell: (row) => row.name },
            { key: "status", header: "Status", cell: (row) => row.status },
          ]}
        />
      </section>
      <section>
        <h2>Feature patterns</h2>
        <div className="demo__patterns">
          <NavigationTree
            activeId="inbox"
            onSelect={() => {}}
            groups={[
              {
                label: "Workspace",
                items: [
                  { id: "inbox", label: "Inbox", badge: 4 },
                  { id: "archive", label: "Archive" },
                ],
              },
            ]}
          />
          <MasterDetail
            minHeight={240}
            master={
              <>
                <ListItem selected>Design review</ListItem>
                <ListItem>Launch plan</ListItem>
              </>
            }
            detail={
              <Timeline
                items={[{ id: "1", icon: "A", heading: "Ada Lovelace", meta: "now", body: "Reviewed the proposal." }]}
              />
            }
          />
          <CalendarGrid
            weekdays={["M", "T", "W", "T", "F", "S", "S"]}
            days={Array.from({ length: 14 }, (_, index) => ({
              id: String(index),
              label: index + 1,
              current: index === 8,
              content: index === 8 ? <Badge>Review</Badge> : undefined,
            }))}
          />
          <ResourceCard
            icon="◈"
            title="API gateway"
            meta="Production"
            status={<StatusDot tone="success" label="Healthy" />}
            actions={<Button size="sm">Open</Button>}
          >
            <ProgressBar value={80} label="Gateway usage" />
          </ResourceCard>
          <Composer
            value={draft}
            onChange={setDraft}
            actions={
              <Button size="sm" variant="primary">
                Send
              </Button>
            }
          />
        </div>
      </section>
      <section>
        <h2>App shell</h2>
        <AppShell
          minHeight={180}
          navigation={
            <NavigationTree activeId="home" onSelect={() => {}} groups={[{ items: [{ id: "home", label: "Home" }] }]} />
          }
          header="Project workspace"
        >
          <div className="demo__shell-content">Consumer content</div>
        </AppShell>
      </section>
      <section>
        <h2>Full component matrix</h2>
        <UIProvider locale="en-US">
          <div className="demo__grid">
            <Card>
              <Heading level={4}>Typography & forms</Heading>
              <Text>
                Semantic text, <Link href="#">links</Link> and input controls.
              </Text>
              <Blockquote>Keep APIs controlled and accessible.</Blockquote>
              <Icon icon={Info} label="Information" />
              <Textarea placeholder="Notes" />
              <MaskedInput mask="phone" placeholder="Phone" />
              <Checkbox label="Receive updates" />
              <RadioGroup
                label="Plan"
                value="pro"
                onValueChange={() => {}}
                options={[{ value: "pro", label: "Pro" }]}
              />
              <Switch
                checked={matrixEnabled}
                onCheckedChange={setMatrixEnabled}
                label={matrixEnabled ? "Enabled" : "Disabled"}
              />
              <Slider label="Volume" value={volume} onValueChange={setVolume} />
            </Card>
            <Card>
              <Heading level={4}>Pickers & upload</Heading>
              <Combobox
                label="Project"
                value={combo}
                onValueChange={setCombo}
                items={[
                  { value: "atlas", label: "Atlas" },
                  { value: "relay", label: "Relay" },
                ]}
              />
              <MultiSelect
                label="Plans"
                value={multiPlan}
                onValueChange={setMultiPlan}
                items={[
                  { value: "starter", label: "Starter" },
                  { value: "team", label: "Team" },
                  { value: "enterprise", label: "Enterprise" },
                ]}
              />
              <DatePicker label="Date" value={date} onValueChange={setDate} />
              <TimePicker label="Time" value={time} onValueChange={setTime} />
              <FileUpload files={files} onFilesChange={setFiles} />
            </Card>
            <Card>
              <Heading level={4}>Display & navigation</Heading>
              <Accordion items={[{ id: "one", title: "Accordion", content: "Content" }]} />
              <Tabs
                label="Demo tabs"
                value="one"
                onValueChange={() => {}}
                items={[{ value: "one", label: "One", content: "Panel" }]}
              />
              <AvatarGroup names={["Ada", "Grace", "Linus"]} />
              <Tooltip content="Helpful text">
                <Button size="sm">Tooltip</Button>
              </Tooltip>
              <Popover label="Popover" trigger={<Button size="sm">Popover</Button>}>
                Context content
              </Popover>
              <Breadcrumbs items={[{ label: "Home", href: "#" }, { label: "Current" }]} />
              <Pagination page={page} pageCount={3} onPageChange={setPage} />
              <Stepper current={1} steps={["Start", "Review", "Done"]} />
              <NavigationMenu items={[{ label: "Overview", href: "#" }]} />
            </Card>
          </div>
          <Button onClick={() => setDrawer(true)} startIcon={<Icon icon={Calendar} />}>
            Open drawer
          </Button>
          <Drawer open={drawer} onClose={() => setDrawer(false)} title="Drawer">
            Focusable overlay content
          </Drawer>
        </UIProvider>
      </section>
      {modal && (
        <Modal
          title="Example modal"
          onClose={() => setModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setModal(false)}>
                Save
              </Button>
            </>
          }
        >
          <Field label="Name">
            <Input autoFocus defaultValue="Design review" />
          </Field>
        </Modal>
      )}
      <ToastViewport
        toasts={toasts}
        onDismiss={(id) => setToasts((value) => value.filter((toast) => toast.id !== id))}
      />
    </PageContent>
  );
}
const demoWindow = window as Window & { __asphaltDemoRoot?: ReturnType<typeof createRoot> };
const demoRoot = (demoWindow.__asphaltDemoRoot ??= createRoot(document.getElementById("root")!));
demoRoot.render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
