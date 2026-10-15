/** Reconstructed volumes, read from Tiled through the /api/data proxy */

/** The Tiled container that holds results derived from raw data */
export const ANALYSIS = "analysis";

/** The metadata `visr.kind` that marks a node as a tomography reconstruction */
export const RECONSTRUCTION_KIND = "tomography-reconstruction";

export interface Reconstruction {
  /** Path of the array node in Tiled, e.g. "analysis/visr-tomo-test-recon" */
  path: string;
  /** What to call it in the UI */
  label: string;
  shape: [number, number, number];
  /** When it was registered (ISO 8601), if the metadata says */
  created?: string;
}

/** The parts of a Tiled search result this reads */
interface SearchResult {
  id: string;
  attributes: {
    structure_family: string;
    metadata: {
      visr?: { workflow_run?: string; created?: string; kind?: string };
    };
    structure?: {
      shape: number[];
      data_type?: { kind: string; itemsize: number };
    };
  };
}

/** A search result as a Reconstruction, or null if the UI can't show it */
export function toReconstruction(result: SearchResult): Reconstruction | null {
  const { structure_family, structure, metadata } = result.attributes;
  const type = structure?.data_type;
  // the viewer takes a 3D volume of bytes, as the workflow writes
  if (
    structure_family !== "array" ||
    structure?.shape.length !== 3 ||
    type?.kind !== "u" ||
    type.itemsize !== 1
  ) {
    return null;
  }
  const run = metadata.visr?.workflow_run;
  return {
    path: `${ANALYSIS}/${result.id}`,
    label: run ? `${result.id} (${run})` : result.id,
    shape: structure.shape as [number, number, number],
    created: metadata.visr?.created,
  };
}

/** The reconstructions in Tiled that the viewer can show, newest first */
export async function listReconstructions(): Promise<Reconstruction[]> {
  const params = new URLSearchParams({
    "filter[eq][condition][key]": "visr.kind",
    "filter[eq][condition][value]": JSON.stringify(RECONSTRUCTION_KIND),
  });
  const resp = await fetch(`/api/data/search/${ANALYSIS}?${params}`);
  // no analysis container yet: nothing has been reconstructed
  if (resp.status === 404) return [];
  if (!resp.ok) throw new Error(`Listing reconstructions: ${resp.statusText}`);
  const body = (await resp.json()) as { data: SearchResult[] };
  return body.data
    .map(toReconstruction)
    .filter((r): r is Reconstruction => r !== null)
    .sort((a, b) => (b.created ?? "").localeCompare(a.created ?? ""));
}

/** The whole volume of a reconstruction, as bytes in C order */
export async function fetchVolume(
  reconstruction: Reconstruction,
): Promise<Uint8Array> {
  const resp = await fetch(
    `/api/data/array/full/${reconstruction.path}?format=application/octet-stream`,
  );
  if (!resp.ok) throw new Error(`Loading the volume: ${resp.statusText}`);
  const data = new Uint8Array(await resp.arrayBuffer());
  const expected = reconstruction.shape.reduce((a, b) => a * b, 1);
  if (data.length !== expected) {
    throw new Error(
      `Volume has ${data.length} bytes; its shape needs ${expected}`,
    );
  }
  return data;
}
