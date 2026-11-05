import { type SectionGroup, createRouter } from "@atlas/app-shell";
import { ScanQrCode } from "lucide-react";
import { PlanBrowser } from "@atlas/blueapi-ui";

const INSTRUMENT = "b21";
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
  title: INSTRUMENT,
  navigation,
});
