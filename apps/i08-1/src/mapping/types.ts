type MappingStage = {
  fastAxis: string;
  slowAxis: string;
};

/** for now just a rectangle */
type Region = {
  fastStart: number;
  fastStop: number;
  slowStart: number;
  slowStop: number;
};

/** for now just a raster */
type Path = {
  xStep: number;
  yStep: number;
};

export type MappingScan = {
  /** what devices we are scanning */
  stage: MappingStage;
  /** extent of the scan */
  region: Region;
  /** trajectory along the region */
  path: Path;
  /** detector name(s), as Blueapi knows it, to exposure time(s) in seconds */
  detectors: Record<string, number>;
};
