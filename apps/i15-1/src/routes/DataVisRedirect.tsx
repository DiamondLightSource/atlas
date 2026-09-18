import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const DATAVIS_URL = "https://i15-1-datavis.diamond.ac.uk/";

/**
 * Not a real page: opens the DataVis app in a new tab, then
 * immediately redirects back to the dashboard so the "DataVis"
 * nav entry behaves like an external link rather than a route.
 */
export function DataVisRedirect() {
  const navigate = useNavigate();
  const opened = useRef(false);

  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      window.open(DATAVIS_URL, "_blank", "noopener,noreferrer");
    }
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
}
