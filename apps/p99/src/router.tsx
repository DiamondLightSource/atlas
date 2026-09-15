import { type SectionGroup, createRouter } from "@atlas/app-shell";
import {
  FileText,
  LucideLayoutDashboard,
  ServerCog,
  Wallpaper,
} from "lucide-react";
import Dashboard from "./routes/Dashboard";
import Plans from "./routes/Plans";
import Workflows from "./routes/Workflows";
import Visualisation from "./routes/Visualisation";

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
        name: "Plans",
        icon: <FileText />,
        path: "acquisition",
        pages: [
          {
            name: "Plans",
            element: <Plans />,
          },
        ],
      },
      {
        name: "Workflows",
        icon: <ServerCog />,
        path: "workflows",
        pages: [
          {
            name: "Workflows",
            element: <Workflows />,
          },
        ],
      },
      {
        name: "Visualisation",
        icon: <Wallpaper />,
        path: "visualisation",
        pages: [
          {
            name: "Visualisation",
            element: <Visualisation />,
          },
        ],
      },
    ],
  },
];

export const router = createRouter({ title: "P99", navigation });
