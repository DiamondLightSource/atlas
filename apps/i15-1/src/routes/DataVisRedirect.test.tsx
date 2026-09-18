import { render, screen } from "@atlas/vitest-conf";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { DataVisRedirect } from "./DataVisRedirect";

function renderAtDatavis() {
  return render(
    <MemoryRouter initialEntries={["/queue", "/datavis"]} initialIndex={1}>
      <Routes>
        <Route path="/queue" element={<div>Queue page</div>} />
        <Route path="/datavis" element={<DataVisRedirect />} />
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

  it("navigates back to the previous page", () => {
    renderAtDatavis();

    expect(screen.getByText("Queue page")).toBeInTheDocument();
  });
});
