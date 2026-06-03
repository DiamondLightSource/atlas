import { type SectionGroup, createRouter } from "@atlas/app-shell";
import {
  ClipboardClock,
  ListTodo,
  LucideLayoutDashboard,
  ScanQrCode,
  SlidersHorizontal,
} from "lucide-react";
import Robot from "./routes/Robot";
import Dashboard from "./routes/Dashboard";

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
        pages: [
          {
            name: "Playlist",
            element: <div />,
          },
          {
            name: "Samples",
            element: <div />,
          },
          {
            name: "Pucks",
            element: <div />,
          },
        ],
      },
      {
        name: "Acquisition",
        icon: <ScanQrCode />,
        path: "acquisition",
        pages: [
          {
            name: "Home",
            element: <div />,
          },
          {
            name: "Robot",
            element: <Robot />,
          },
          {
            name: "Stage",
            element: <div />,
          },
          {
            name: "Plans",
            element: <div />,
          },
        ],
      },
      {
        name: "Queue",
        icon: <ListTodo />,
        path: "queue",
        pages: [
          {
            name: "All queue tasks",
            element: <div />,
          },
          {
            name: "Next tasks",
            element: <div />,
          },
          {
            name: "Previous tasks",
            element: <div />,
          },
        ],
      },
    ],
  },
  {
    sections: [
      {
        name: "Log",
        icon: <ClipboardClock />,
        path: "log",
        pages: [{ name: "Log", element: <div /> }],
      },
    ],
  },
];

export const router = createRouter({ title: "i15-1", navigation });
