import {
  type SectionGroup,
  SystemControls,
  createRouter,
} from "@atlas/app-shell";
import { ScanQrCode } from "lucide-react";
import { PlanBrowser } from "@atlas/blueapi-ui";

const navigation: SectionGroup[] = [
  {
    sections: [
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
  title: "i15-1",
  navigation,
  footer: ({ open }) => <SystemControls open={open}></SystemControls>,
});
