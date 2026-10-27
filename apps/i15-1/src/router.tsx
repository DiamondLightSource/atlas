import {
  type SectionGroup,
  createRouter,
  SystemControls,
} from "@atlas/app-shell";
import {
  Activity,
  ListTodo,
  LucideLayoutDashboard,
  ScanQrCode,
  SlidersHorizontal,
} from "lucide-react";
import Robot from "./routes/Robot";
import Dashboard from "./routes/Dashboard";
import Playlist from "./routes/Playlist";
import Pucks from "./routes/Pucks";
import { QueueView } from "./routes/QueueView";
import { DataVisRedirect } from "./routes/DataVisRedirect";
import { StopAllButton } from "./components/StopAllButton";
import { PlanBrowser } from "@atlas/blueapi-ui";

const INSTRUMENT: string = "i15-1";

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
        pages: [
          {
            name: "Robot",
            element: <Robot />,
          },
          {
            name: "Plans",
            element: <PlanBrowser />,
          },
        ],
      },
    ],
  },
  {
    sections: [
      {
        name: "Setup",
        icon: <SlidersHorizontal />,
        path: "setup",
        pages: [
          {
            name: "Pucks",
            element: <Pucks />,
          },
          {
            name: "Playlist",
            element: <Playlist />,
          },
        ],
      },
      {
        name: "Queue",
        icon: <ListTodo />,
        path: "queue",
        pages: [
          {
            name: "Future tasks",
            element: <QueueView displayMode="future" instrument={INSTRUMENT} />,
          },
          {
            name: "All tasks",
            element: <QueueView displayMode="all" instrument={INSTRUMENT} />,
          },
          {
            name: "Historic tasks",
            element: (
              <QueueView displayMode="historic" instrument={INSTRUMENT} />
            ),
          },
        ],
      },
      {
        name: "DataVis",
        icon: <Activity />,
        path: "datavis",
        pages: [
          {
            name: "DataVis",
            element: <DataVisRedirect />,
          },
        ],
      },
    ],
  },
];

export const router = createRouter({
  title: "i15-1",
  navigation,
  footer: ({ open }) => (
    <SystemControls open={open}>
      <StopAllButton compact={!open} />
    </SystemControls>
  ),
});
