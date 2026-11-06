import { type SectionGroup, createRouter } from "@atlas/app-shell";
import { PlanBrowser } from "@atlas/blueapi-ui";
import { LucideLayoutDashboard, ScanQrCode } from "lucide-react";
import { Dashboard } from "./Dashboard";

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
        name: "Acquisition",
        icon: <ScanQrCode />,
        path: "acquisition",
        isProtected: true,
        pages: [
          {
            name: "Plans",
            element: <PlanBrowser />,
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
