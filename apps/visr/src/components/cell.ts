import type { ReactNode } from "react";

export interface Cell {
  key: string;
  title: string;
  content: ReactNode;
}
