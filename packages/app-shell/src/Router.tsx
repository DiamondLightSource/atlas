import { Layout } from "./Layout";
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import { ContentPanel } from "./ContentPanel";
import { TabbedPanel, type TabDescription } from "./TabbedRoute";

import type { ReactNode } from "react";
import type React from "react";
import { AuthGuard } from "./AuthGuard";

/** App title and navigational intent */
export interface RouterProps {
  /** App name to show in top bar */
  title: string;

  /** a router will be derived to express this */
  navigation: SectionGroup[];

  /** Add a footer to the bottom of the navigation panel */
  footer?: (props: { open: boolean }) => React.ReactNode;
}

/** A group within the main navigation tree */
export interface SectionGroup {
  /** Group name (not currently exposed) */
  name?: string;

  /** The sections within this group */
  sections: Section[];
}

/**
 * A section with a user-friendly name,
 * and optional path.
 * If undefined, path is derived from name */
export interface LabelledRoute {
  name: string;
  path?: string;
  isProtected?: boolean;
}

interface BaseSection extends LabelledRoute {
  /** icon for top-level navigation */
  icon: ReactNode;
}

/** A section rendering several pages as tabs */
export interface TabbedSection extends BaseSection {
  /** First one is default */
  pages: Page[];
  element?: never;
}

/** A section rendering a single page, with no tabs */
export interface SingleSection extends BaseSection {
  element: ReactNode;
  pages?: never;
}

/**
 * This describes a top-level screen,
 * accessible via main navigation component */
export type Section = TabbedSection | SingleSection;

export interface Page extends LabelledRoute {
  element: ReactNode;
}

/** When paths not given, derive from name through this function */
export function sanitisePath(name: string) {
  return name.toLowerCase().replace(/\s/g, "_");
}

export function routePath(route: LabelledRoute) {
  return route.path ?? sanitisePath(route.name);
}

function guarded(section: Section, element: ReactNode): ReactNode {
  return section.isProtected ? <AuthGuard element={element} /> : element;
}

function childRoute(section: Section): RouteObject {
  if (!section.pages) {
    return {
      path: routePath(section),
      element: guarded(section, <ContentPanel>{section.element}</ContentPanel>),
    };
  }

  const tabbedPages: TabDescription[] = section.pages.map((page) => {
    return {
      label: page.name,
      path: routePath(page),
    };
  });
  const sectionPath = routePath(section);
  const element = guarded(
    section,
    <TabbedPanel basePath={`/${sectionPath}`} tabs={tabbedPages} />,
  );
  const childPageRoutes: RouteObject[] = section.pages.map((page) => {
    return {
      path: routePath(page),
      element: page.element,
    };
  });

  const firstTab = section.pages[0];
  const firstTabPath = routePath(firstTab);
  return {
    path: sectionPath,
    element: element,
    children: [
      ...(firstTab
        ? [
            {
              index: true,
              element: <Navigate to={firstTabPath} replace />,
            },
          ]
        : []),
      ...childPageRoutes,
    ],
  };
}

function getRoutes(navigation: SectionGroup[]): Section[] {
  return navigation.flatMap((group) => group.sections);
}

/**
 * Returns a router with a root Route ('/') which renders `<Layout />`,
 * consisting of app bar, side navigation panel, and main content panel (`<Outlet />`).
 *
 * Adds an index child which redirects to the first given route.
 * Sections with pages render a `<TabbedRoute />`, with tabs for each panel,
 * and a redirect to the first panel. Sections with an `element` render it
 * directly, with no tabs.
 *
 */
export function createRouter(props: RouterProps) {
  const routes = getRoutes(props.navigation);
  const children = routes.map(childRoute);

  const firstRoute = routes[0];
  const route: RouteObject = {
    path: "/",
    element: <Layout {...props} />,
    children: [
      {
        index: true,
        element: <Navigate to={`/${firstRoute.path}`} replace />,
      },
      ...children,
    ],
  };
  return createBrowserRouter([route]);
}
