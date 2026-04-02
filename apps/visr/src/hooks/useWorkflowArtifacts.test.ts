// src/hooks/useWorkflowArtifacts.test.tsx
import React, { createElement, type PropsWithChildren } from "react";
// import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@atlas/vitest-conf";
import { RelayEnvironmentProvider } from "react-relay";
import { useWorkflowArtifacts } from "./useWorkflowArtifacts";
import { getRelayEnvironment } from "../RelayEnvironment";
import { setupServer } from "msw/node";

describe("useWorkflowArtifacts", async () => {
  const { createGraphQlSubscriptionHandlers } =
    await import("../mocks/handlers");
  const handlers = createGraphQlSubscriptionHandlers();
  const server = setupServer(...handlers);

  const wrapper: React.FC<PropsWithChildren> = ({ children }) => {
    const environment = getRelayEnvironment();
    return createElement(RelayEnvironmentProvider, {
      environment: environment,
      children: children,
    });
  };

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("returns [] when visit is null/invalid", () => {
    const { result } = renderHook(
      () => useWorkflowArtifacts(null, "workflow-name"),
      { wrapper },
    );
    expect(result.current).toEqual([]);
  });

  it("returns [] when name is blank", () => {
    const visit = { number: 1, proposalCode: "cm", proposalNumber: 40661 };
    const { result } = renderHook(() => useWorkflowArtifacts(visit, "  "), {
      wrapper,
    });
    expect(result.current).toEqual([]);
  });

  it("subscribes and returns arre of artifacts from workflow", async () => {
    const visit = { number: 1, proposalCode: "cm", proposalNumber: 40661 };
    const name = "visr-reconstruction";

    const { result } = renderHook(() => useWorkflowArtifacts(visit, name), {
      wrapper,
    });

    const expected = [
      {
        name: "visr-reconstructed-image.png",
        url: "https://sci-nas-s3.diamond.ac.uk/k8s-workflows-test/visr-reconstruction-ws7fl/visr-reconstruction-ws7fl/visr-reconstructed-image.png",
        mimeType: "image/png",
      },
      {
        name: "main.log",
        url: "https://sci-nas-s3.diamond.ac.uk/k8s-workflows-test/visr-reconstruction-ws7fl/visr-reconstruction-ws7fl/main.log",
        mimeType: "text/plain",
      },
    ];

    await waitFor(() => {
      expect(result.current).toEqual(expected);
    });
  });
});
