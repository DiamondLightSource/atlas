import { type SectionGroup, createRouter } from "@atlas/app-shell";
import { LucideLayoutDashboard } from "lucide-react";
import { Dashboard } from "./Dashboard";
import { ConnectedARPESTab,ARPESViewer } from "./ConnectedARPESTab";
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


export const router = createRouter({
  title: "P48",
  navigation,
});
