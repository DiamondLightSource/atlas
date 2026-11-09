import { type SectionGroup, createRouter } from "@atlas/app-shell";
import { PlanBrowser } from "@atlas/blueapi-ui";
import {
  FileCodeCorner,
  LucideLayoutDashboard,
  ScanQrCode,
  SlidersHorizontal,
} from "lucide-react";
import { Dashboard } from "./Dashboard";
import { Typography } from "@mui/material";

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
        name: "Setup",
        icon: <SlidersHorizontal />,
        path: "setup",
        isProtected: true,
        pages: [
          {
            name: "Sample change",
            element: <></>,
          },
          {
            name: "Alignment",
            element: <></>,
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
            element: (
              <>
                <Typography variant="caption">
                  Note this page is given as example only. This beamline's users
                  came here to do science, not to run plans
                </Typography>
                <PlanBrowser />
              </>
            ),
          },
          {
            name: "Queue",
            element: (
              <Typography variant="caption">Still to be built</Typography>
            ),
          },
        ],
      },
      {
        name: "Scripts",
        icon: <FileCodeCorner />,
        path: "scripts",
        isProtected: true,
        pages: [
          {
            name: "Scripts",
            element: <></>,
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
