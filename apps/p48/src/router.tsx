import { type SectionGroup, createRouter } from "@atlas/app-shell";
import { LucideLayoutDashboard, LucideScanLine } from "lucide-react";
import { Dashboard } from "./Dashboard";
import { ScansPage } from "./ScansPage";

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
        ],
      },
      {
        name: "Scans",
        icon: <LucideScanLine />,
        path: "scans",
        isProtected: true,
        pages: [
          {
            name: "Scans",
            element: <ScansPage />,
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
