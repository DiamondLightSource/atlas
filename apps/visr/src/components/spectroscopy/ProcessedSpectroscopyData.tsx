import type { WorkflowArtifact } from "../../hooks/useWorkflowArtifacts";

export function ProcessedSpectroscopyData(props: {
  workflowArtifacts: WorkflowArtifact[];
}) {
  const imageUrls = props.workflowArtifacts
    .filter(it => it.mimeType === "image/png")
    .map(it => it.url);
  return (
    <div>
      {imageUrls.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`Processed Spectroscopy image ${i}`}
          style={{ maxWidth: "100%", display: "block", marginBottom: "1rem" }}
        />
      ))}
    </div>
  );
}

export default ProcessedSpectroscopyData;
