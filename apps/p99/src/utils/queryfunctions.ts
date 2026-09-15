import axios from "axios";

const tiled = "/tiled";

export const getData = async (scan_id: string, name: string) => {
  const response = await axios.get<number[]>(
    tiled + "/data/" + name,
    // "/array/full/" +
    // scan_id +
    // "/primary/internal/" +
    // name +
    // "?format=application/json",
  );
  if (response.status != 200) {
    throw new Error("Failed to retrieve data");
  }
  return response.data;
};

export const getScans = async (
  visit: string,
  offset: number,
  limit: number,
  sort_key: string,
) => {
  const response = await axios.get(
    tiled + "/scans",
    // "/search/?filter[eq][condition][key]=start.instrument_session&filter[eq][condition][value]=%22" +
    // visit +
    // "%22" +
    // "&page[offset]=" +
    // offset +
    // "&page[limit]=" +
    // limit +
    // "&sort=" +
    // sort_key,
  );
  if (response.status != 200) {
    throw new Error("Failed to retrieve metadata");
  }
  return response.data;
};

export const getMetadata = async (taskId: string) => {
  const response = await axios.get(
    tiled + "/primary",
    // tiled + "/metadata/" + taskId + "/primary"
  );
  if (response.status != 200) {
    throw new Error("Failed to retrieve metadata");
  }
  return response.data;
};
