# Atlas - Diamond II Science UI Monorepo

**Atlas** is the monorepo for Diamond II science-facing web user interfaces.

It provides a shared home for multiple applications built with TypeScript + React, using the sci-react-ui component library for consistent look, feel, and interaction patterns across beamlines and services.

The goal is to keep UI development:

- Centralised – all science UIs live in one repository
- Visible – teams can see, learn from, and contribute to each other’s work
- Reusable – shared components, patterns, and infrastructure
- Consistent – common authentication, layout, and deployment model

## Tech stack

- Frontend: React + Typescript
- UI components: `sci-react-ui`/`mui`
- Deployment: Kubernetes via Helm
- Authentication: OIDC (Keycloak) via `oauth2-proxy`

## Repository structure

```
apps/          # Individual UI applications
helm/          # Shared base Helm chart (ui-base)
packages/      # Shared libraries/utilities (if applicable)
```

Each application under `apps/<name>` is independently buildable and releasable, but follows shared conventions for layout, auth, and deployment.

## Testing

Frontend testing across the monorepo is standardised via [packages/vitest-conf](packages/vitest-conf/README.md). This package centralises shared test setup, including, Vitest configuration, jsdom test environment, Testing Library matchers and common setup.

Applications and shared packages extend this configuration rather than redefining their own, which keeps test setup minimal, consistent, and easy to maintain across the repository.

## Common deployment model

All UIs are deployed behind a shared authentication and routing layer provided by the `ui-base` Helm chart.

Application charts depend on this base chart and only need to declare:

1. Which container image to run
2. Which backend services (“upstreams”) the UI talks to

The base chart handles:

- Ingress
- Service wiring
- OAuth2/OIDC login via Keycloak
- Reverse proxying to backend APIs

This keeps app charts small, declarative, and consistent across the platform.

## Releasing applications

Applications are released using Git tags. Each app is versioned and released independently.

### Tag format

```
<appName>@<semver>
```

### Examples

```
visr@0.1.8
swift@1.2.0-beta.2
```

When a tag matching this format is pushed you will then need to create the release via https://github.com/DiamondLightSource/atlas/releases.

### What happens on release

Once the release is created CI will then:

1. Parse the tag into application name and version
2. Build and publish the application using repo-level Dockerfile and nginx configuration
3. Update the app’s Helm chart:
   - `Chart.yaml`: `version` and `appVersion`
   - `values.yaml`: container image tag
4. Build Helm dependencies
5. Package application chart
6. Push the chart to the GitHub Container Registry (OCI)

This ensures a single Git tag produces a versioned **container image** and a matching **Helm chart**.

## Authentication

All production deployments use OIDC authentication via Diamond’s Keycloak realms, enforced at the ingress layer using `oauth2-proxy`. Applications themselves do not need to implement login flows directly.

## Contributing

When building a new UI:

- Follow existing app structure under apps/
- Use components from sci-react-ui wherever possible
- Keep app-specific logic in the app, and reusable logic in shared packages

Consistency across UIs is a core goal of this repository.
