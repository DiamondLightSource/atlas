import { Navigate, type RouteObject } from "react-router-dom";
import {
  createRouter,
  sanitisePath,
  type Section,
  type RouterProps,
} from "./Router";
import { Layout } from "./Layout";
import React from "react";
import { TabbedPanel } from "./TabbedRoute";

describe("createRouter", () => {
  const props: RouterProps = {
    title: "test",
    navigation: [
      {
        sections: [
          {
            name: "route1",
            path: "r1",
            icon: <div />,
            pages: [
              { name: "1A", element: <div test-data="1a" /> },
              { name: "1B", element: <div test-data="1b" /> },
            ],
          },
          {
            name: "route2",
            path: "r2",
            icon: <div />,
            pages: [
              { name: "2A", element: <div test-data="2a" /> },
              { name: "2B", element: <div test-data="2b" /> },
              { name: "2C", element: <div test-data="2c" /> },
            ],
          },
          {
            name: "Route 3",
            icon: <div />,
            pages: [{ name: "3A", element: <div test-data="3a" /> }],
          },
        ],
      },
    ],
  };

  const router = createRouter(props);

  it("creates a root element with Layout component", () => {
    const root: RouteObject = router.routes[0];
    expect(root.path).toEqual("/");
    expect(getReactElement(root.element).type).toBe(Layout);
  });

  it("sets all given routes as children of the root element", () => {
    const root = router.routes[0];
    const children: RouteObject[] = root.children!.filter(
      (child) => !child.index,
    ); // there is an additional index route, tested elsewhere

    expect(children.length).toEqual(props.navigation[0].sections.length);
  });

  it("adds an index route which redirects to our first route", () => {
    const root: RouteObject = router.routes[0];

    // find all children with the index properties
    const indexRoute = root.children!.filter((child) => child.index)!;

    // there's only one
    expect(indexRoute.length).toBe(1);

    // it has a Navigate element, pointing to the first given route's path, with the replace prop
    const indexElement = getReactElement(indexRoute[0].element);
    expect(indexElement.type).toBe(Navigate);
    expect(indexElement.props).toEqual({
      to: "/r1",
      replace: true,
    });
  });

  it("creates child routes with TabbedPanel element", () => {
    const children: RouteObject[] = router.routes[0].children!.filter(
      (child) => !child.index,
    );

    children.forEach((child) => {
      const element = getReactElement(child.element);
      expect(element.type).toBe(TabbedPanel);

      // TODO: test props: basePath, tabs
    });
  });

  it("adds an index route to each non-index child, redirecting to first panel", () => {
    const children = router.routes[0].children!.filter((child) => !child.index);
    children.forEach((child) => {
      const indexRoutes: RouteObject[] = child.children?.filter(
        (child) => child.index,
      )!;
      expect(indexRoutes.length).toBe(1);
      const indexElement = getReactElement(indexRoutes[0].element);
      expect(indexElement.type).toBe(Navigate);

      const route: Section = props.navigation[0].sections.find(
        (r) => child.path === (r.path ?? sanitisePath(r.name)),
      )!;

      const firstPanel = route.pages[0];
      const expectedPath = firstPanel.path ?? sanitisePath(firstPanel.name);
      expect(indexElement.props).toEqual({
        to: expectedPath,
        replace: true,
      });
    });
  });

  it("derives paths from route names if not explicitly given", () => {
    const children = router.routes[0].children!.filter((child) => !child.index);
    // the third route has no path
    const expectedPath = sanitisePath(props.navigation[0].sections[2].name);
    const route3 = children.filter((child) => child.path === expectedPath)[0];
    expect(route3).toBeDefined();
  });
});

function getReactElement(el: unknown) {
  if (!React.isValidElement(el)) {
    throw new Error("Not a React element");
  }
  return el;
}
