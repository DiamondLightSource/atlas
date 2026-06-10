import { type DType } from "@diamondlightsource/cs-web-lib";

type NotConnected = "not connected";

export type RawValue = DType | undefined | NotConnected;
// NOTE - ACHTUNG! DTYPE not exported anymore in newer versions
// Problem is that useConnection returns latest value as Dtype so we need it
// waiting for an answer on this, in the meantime sticking to 0.9.5

export type PvDescription = {
  label: string;
  pv: string;
};

export type ParsePvProps = PvDescription & {
  parseNumeric?: boolean;
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
