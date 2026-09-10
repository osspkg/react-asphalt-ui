# @osspkg/asphalt-ui

Tailwind 4 React primitives and page patterns. Tailwind is a required peer
dependency; install it in the consuming application, then import the kit CSS once:

```bash
npm install @osspkg/asphalt-ui tailwindcss lucide-react
```

```tsx
import { Button, PageContent, StatGrid } from "@osspkg/asphalt-ui";
import "@osspkg/asphalt-ui/styles.css";
```

See `DESIGN.md` for component boundaries, token customization, accessibility,
and the command for running the local demo.
