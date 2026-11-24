/** for now just a rectangle */
type Region = {
  fastStart: number;
  fastStop: number;
  slowStart: number;
  slowStop: number;
};

/** for now just a raster */
type Path = {
  xPoints: number;
  yPoints: number;
};

export type MappingScan = {
  /** extent of the scan */
  region: Region;
  /** trajectory along the region */
  path: Path;
  /** for now just an exposure */
  exposure: number;
};

/** params of the panda_scan plan in blueapi */
export type PandaScanParameters = {
  start: number;
  start_slow: number;
  stop: number;
  stop_slow: number;
  num: number;
  duration: number;
};
