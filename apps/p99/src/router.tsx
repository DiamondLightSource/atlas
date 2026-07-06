import { type SectionGroup, createRouter } from "@atlas/app-shell";
import { FileText, LucideLayoutDashboard, ServerCog } from "lucide-react";
import Dashboard from "./routes/Dashboard";
import Plans from "./routes/Plans";
import Workflows from "./routes/Workflows";

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
          }
        ]
      },
      {
        name: "Workflows",
        icon: <ServerCog />,
        path: "workflows",
        pages: [
          {
            name: "Workflows",
            element: <Workflows />,
          }
        ]
      }
    ]
  },
];

export const router = createRouter({title: "P99", navigation})