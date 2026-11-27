import { type SectionGroup, createRouter } from "@atlas/app-shell";
import { LucideLayoutDashboard } from "lucide-react";
import { Dashboard } from "./Dashboard";
import { Console } from "./Console";

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
    ],
  },
];

export const router = createRouter({
  title: "P48",
  navigation,
  panelComponents: {
    components: [
      {
        label: "Console",
        content: <Console />,
      },
    ],
  },
});
