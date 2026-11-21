import { type SectionGroup, createRouter } from "@atlas/app-shell";
import { LucideLayoutDashboard } from "lucide-react";
import { Dashboard } from "./Dashboard";

const navigation: SectionGroup[] = [
  {
    sections: [
      {
        name: "Dashboard",
        icon: <LucideLayoutDashboard />,
        path: "dashboard",
        element: <Dashboard />,
      },
    ],
  },
];

export const router = createRouter({
  title: "P48",
  navigation,
});
