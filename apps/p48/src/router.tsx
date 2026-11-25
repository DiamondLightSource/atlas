import { type SectionGroup, createRouter } from "@atlas/app-shell";
import { LucideLayoutDashboard } from "lucide-react";
import { Dashboard } from "./Dashboard";
import { ConnectedARPESTab } from "./ConnectedARPESTab";
import { useEffect, useState } from "react";

const navigation: SectionGroup[] = [
  {
    sections: [
      {
        name: "Dashboard",
        icon: <LucideLayoutDashboard />,
        path: "dashboard",
        pages: [
          {
            name: "Dashboard",
            element: <Dashboard />,
          },
          {
            name: "ARPES Viewer",
            path: "arpes",
            element: <ARPESViewer />,
          },
        ],
      },
    ],
  },
];

function ARPESViewer() {
  const [uuid] = useState(() => crypto.randomUUID().slice(-8));

  const baseUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/davidia`;

  useEffect(() => {
    console.info("ARPES Viewer mounted", {
      uuid,
      baseUrl,
    });

    return () => {
      console.info("ARPES Viewer unmounted", { uuid });
    };
  }, [uuid, baseUrl]);

  return <ConnectedARPESTab uuid={uuid} baseUrl={baseUrl} />;
}

export const router = createRouter({
  title: "P48",
  navigation,
});
