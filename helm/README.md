# ui-base Helm Chart

`ui-base` is a foundational Helm chart for deploying authenticated web UIs inside the platform. It encapsulates all Kubernetes and OAuth plumbing so that application charts can focus on just two concerns:

1. **What container image should run the UI**
2. **What upstream services the UI needs to talk to**

Everything else — ingress, service wiring, and OAuth2/OIDC authentication via **oauth2-proxy** — is handled centrally.

This chart is intended to be used **as a dependency** by individual UI application charts in this monorepo.

---

## What This Chart Provides

When included as a dependency, `ui-base` deploys:

- A **Deployment** running your UI container
- A **Service** exposing the UI internally
- An **Ingress** configured to:
  - Route external traffic to the UI
  - Enforce authentication via **oauth2-proxy**

- An **oauth2-proxy** instance configured for Keycloak-based OIDC login
- Reverse-proxy routing from the UI path space to declared backend **upstreams**

This creates a consistent, secure pattern for all web UIs.

---

## How Application Charts Use `ui-base`

Application charts depend on `ui-base` and provide their configuration under the `ui-base:` key in their own `values.yaml`.

### Example Application Chart

```yaml
apiVersion: v2
name: visr
description: ViSR UI
type: application
version: 0.1.8
appVersion: "0.1.8"

dependencies:
  - name: ui-base
    repository: "file://../../../helm/"
    version: 0.1.0
```

```yaml
ui-base:
  name: visr
  host: douglas.diamond.ac.uk

  image:
    repository: ghcr.io/diamondlightsource/atlas/visr
    tag: 0.1.8

  # Note that if these have changed you may need to manually restart the oauth2-proxy pod on deployment
  upstreams:
    - id: blueapi
      path: /api/blueapi/
      rewriteTarget: /
      target:
        external:
          uri: http://b01-1-blueapi.diamond.ac.uk

    - id: workflows
      path: /api/workflows
      rewriteTarget: /graphql
      target:
        external:
          uri: https://workflows.diamond.ac.uk

    - id: data
      path: /api/data/
      rewriteTarget: /
      target:
        service:
          name: dataserver
          port: 8000

    - id: supergraph
      path: /api/graphql
      rewriteTarget: /
      target:
        external:
          uri: https://graph-nightly.diamond.ac.uk
      passHostHeader: false

  identityProvider: legacy
```

From the app chart’s perspective, this is all that is required to get a fully authenticated UI deployed.

---

## Core Values (ui-base)

These are the main values exposed by `ui-base` and typically set by the parent application chart.

### Basic App Configuration

| Key                | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `name`             | Logical name of the UI application (used in resource naming) |
| `image.repository` | Container image repository                                   |
| `image.tag`        | Container image tag                                          |
| `image.pullPolicy` | Kubernetes image pull policy                                 |
| `replicaCount`     | Number of UI pod replicas                                    |
| `ui.port`          | Port your UI container listens on (default `8080`)           |
| `host`             | External hostname used for ingress                           |

---

### Upstreams

The `upstreams` list defines backend services that are exposed behind the same authenticated domain.

Each upstream defines a path on the public host that is proxied to either a Kubernetes Service or an external URL.

```yaml
upstreams:
  - id: data
    path: /api/data/
    rewriteTarget: /
    target:
      service:
        name: dataserver
        port: 8000
```

Note that if these have changed you may need to manually restart the `oauth2-proxy` pod on deployment.

#### Fields

| Field                 | Description                                         |
| --------------------- | --------------------------------------------------- |
| `id`                  | Unique identifier used in generated config          |
| `path`                | Public path prefix                                  |
| `rewriteTarget`       | Path rewrite rule before forwarding upstream        |
| `passHostHeader`      | Whether to pass original Host header (default true) |
| `target.service`      | Route to a Kubernetes Service                       |
| `target.external.uri` | Route to an external HTTP(S) endpoint               |

---

## Authentication & Identity Providers

Authentication is handled by **oauth2-proxy** using OIDC against Keycloak realms.

### Selecting an Identity Provider

```yaml
identityProviders:
  prod: https://identity.diamond.ac.uk/realms/dls
  test: https://identity-test.diamond.ac.uk/realms/dls
  dev: https://identity-dev.diamond.ac.uk/realms/dls
  legacy: https://authn.diamond.ac.uk/realms/master

identityProvider: prod
```

Application charts select the realm using:

```yaml
ui-base:
  identityProvider: legacy
```

---

## Required Secrets

This chart expects certain secrets to already exist in the target namespace.

### `ui-keycloak-secret` (Required)

`oauth2-proxy` is configured to read its client credentials from a secret named:

```
ui-keycloak-secret
```

This secret must contain the Keycloak OIDC client configuration (client ID, client secret, [cookie secret](https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/#generating-a-cookie-secret)).

It must be created **before** installing the chart, unless it is supplied by another chart in the same release.

---

### Other oauth2-proxy Config Secrets

`ui-base` also references:

- `oauth2-proxy-config`
- `ui-oauth2-alpha-secret`

These are used for advanced oauth2-proxy configuration.

---

## ⚠ Namespace Limitation

Because several resources use **fixed names**, only **one `ui-base` deployment per namespace** is currently supported.

Conflicting shared resource names include:

- `ui-oauth2-alpha-secret`
- `oauth2-proxy-config`

Installing multiple releases of charts that depend on `ui-base` into the **same namespace** will cause resource name collisions unless the chart is modified to parameterize these names.

---

## oauth2-proxy Subchart

`ui-base` depends on the upstream `oauth2-proxy` Helm chart:

```yaml
dependencies:
  - name: oauth2-proxy
    repository: https://oauth2-proxy.github.io/manifests
    version: 10.1.0
```

It is enabled by default and preconfigured with:

- Standard, request, and auth logging
- Provider button skipped
- Debug output on auth errors
- Service port `4180`

Ingress for oauth2-proxy itself is disabled; traffic flows through the main UI ingress.

---

## Summary

`ui-base` standardizes how authenticated UIs are deployed:

- Application charts declare **image + upstreams**
- `ui-base` handles **auth, ingress, routing, and services**
- Security and identity integration stay consistent across all UIs

This keeps app charts small, declarative, and focused purely on application behavior rather than infrastructure.
