import { render, screen, waitFor } from "@atlas/vitest-conf";
import { useEffect, useState } from "react";
import ErrorBoundary from "./ErrorBoundary";

const AsynchronousError = () => {
  const [error, setError] = useState<Error | null>(null);
  
  if (error) throw error;

  useEffect(() => {
    setError(new Error("returned error"))
  })

  return null;
};

test('async component returns error', async () => {
  render(
    <ErrorBoundary fallback={<>Error Boundary</>}>
      <AsynchronousError />
    </ErrorBoundary>
  )
  await waitFor(() => {
    expect(screen.getByText("Error Boundary")).toBeVisible();
  })
})