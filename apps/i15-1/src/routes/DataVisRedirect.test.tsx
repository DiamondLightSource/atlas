import { render, screen } from "@atlas/vitest-conf";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { DataVisRedirect } from "./DataVisRedirect";

function renderAtDatavis() {
  return render(
    <MemoryRouter initialEntries={["/datavis"]}>
      <Routes>
        <Route path="/datavis" element={<DataVisRedirect />} />
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("DataVisRedirect", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  it("opens the DataVis app in a new tab", () => {
    renderAtDatavis();

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      "https://i15-1-datavis.diamond.ac.uk/",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("redirects back to the dashboard", () => {
    renderAtDatavis();

    expect(screen.getByText("Dashboard page")).toBeInTheDocument();
  });
});
