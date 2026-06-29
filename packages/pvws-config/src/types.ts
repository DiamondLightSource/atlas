import { type DType } from "@diamondlightsource/cs-web-lib";

type NotConnected = "not connected";

export type RawValue = DType | undefined | NotConnected;

export type PvDescription = {
  label: string;
  pv: string;
};

export type ParsePvProps = PvDescription & {
  parseNumeric?: boolean;
  parseByeArr?: boolean;
  decimals?: number;
  scaleFactor?: number;
  units?: string;
};

type RenderPvComponent = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => JSX.Element;
export type RenderPvProps = ParsePvProps & { render?: RenderPvComponent };
