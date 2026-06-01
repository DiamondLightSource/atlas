# @atlas/app-shell

A React application shell and router builder for Atlas applications.

`@atlas/app-shell` provides a common application layout consisting of:

- Top bar
- Side navigation
- Tabbed content area
- React Router integration

Applications describe their navigational structure using simple TypeScript objects. A React Router configuration is then generated automatically.

## Installation

```bash
pnpm add -F myApp @atlas/app-shell --workspace
pnpm add -F @atlas/myApp react-router-dom
```

## Usage

Define your application's navigational structure:

```tsx
import { createRouter } from "@atlas/app-shell";

const router = createRouter({
  title: "My Application",
  navigation: [
    {
      sections: [
        {
          name: "Dashboard",
          icon: <DashboardIcon />,
          pages: [
            {
              name: "Status",
              element: <StatusPage />,
            },
            {
              name: "Stage",
              element: <StagePage />,
            },
          ],
        },
        {
          name: "Acquisition",
          icon: <ScanIcon />,
          pages: [
            {
              name: "Configuration",
              element: <ConfigurationPage />,
            },
          ],
        },
      ],
    },
  ],
});
```

Use the generated router with React Router:

```tsx
import { RouterProvider } from "react-router-dom";

export function App() {
  return <RouterProvider router={router} />;
}
```

## Navigation Model

Applications provide navigation intent rather than defining React Router routes directly.

### Section Groups

A section group contains one or more sections.

### Sections

A section represents a top-level screen visible in the side navigation.

Each section:

- Has a display name
- Has an icon
- Contains one or more pages

The first page is treated as the default page.

### Pages

A page represents content displayed within a section.

Pages are rendered as tabs within the main content area.

The first page is treated as the default page for its section.

## Path Generation

Both sections and pages may optionally specify a path.

If omitted, a path is derived automatically from the display name.

For example:

```ts
{
  name: "Sample Environment";
}
```

becomes:

```
sample_environment
```
