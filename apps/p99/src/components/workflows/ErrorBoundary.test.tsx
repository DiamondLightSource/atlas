import { render, screen, waitFor } from "@atlas/vitest-conf";
import { useEffect, useState } from "react";
import ErrorBoundary from "./ErrorBoundary";

const SynchronousError = () => {
  throw new Error("returned error");
};

const AsynchronousError = () => {
  const [error, setError] = useState<Error | null>(null);

  if (error) throw error;

  useEffect(() => {
    setError(new Error("returned error"));
  }, []);

  return null;
};

test("component works normally", () => {
  render(
    <ErrorBoundary>
      <>All Good!</>
    </ErrorBoundary>,
  );
  expect(screen.getByText("All Good!")).toBeVisible();
});

test("component returns error", () => {
  render(
    <ErrorBoundary fallback={<>Error Boundary</>}>
      <SynchronousError />
    </ErrorBoundary>,
  );
  waitFor(() => {
    expect(screen.getByText("Error Boundary")).toBeVisible();
  });
});

test("async component returns error", async () => {
  render(
    <ErrorBoundary fallback={<>Error Boundary</>}>
      <AsynchronousError />
    </ErrorBoundary>,
  );
  await waitFor(() => {
    expect(screen.getByText("Error Boundary")).toBeVisible();
  });
});
