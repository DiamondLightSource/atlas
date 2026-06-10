import { useState } from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CodeIcon from "@mui/icons-material/Code";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import type { Plan } from "@atlas/blueapi";
import {
  useGetWorkerState,
  useSetActiveTask,
  useSubmitTask,
} from "@atlas/blueapi-query";

interface SchemaProperty {
  type?: string;
  title?: string;
  description?: string;
}

interface PydanticValidationError {
  loc?: (string | number)[];
  msg: string;
  type: string;
}

interface PlanCardProps {
  plan: Plan;
  instrumentSession: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function PlanCard({
  plan,
  instrumentSession,
  onSuccess,
  onError,
}: PlanCardProps) {
  const [formValues, setFormValues] = useState<Record<string, string | number>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const submitTask = useSubmitTask();
  const startTask = useSetActiveTask();
  const workerState = useGetWorkerState();

  const cleanDescription = plan.description?.split(/parameters/i)[0].trim();

  // JSON Schema blocks from the generic Plan type object
  const planSchema = plan.schema as
    | { properties?: Record<string, SchemaProperty>; required?: string[] }
    | undefined;
  const properties = planSchema?.properties || {};
  const requiredFields = planSchema?.required || [];

  const handleInputChange = (paramName: string, value: string) => {
    setFormValues(prev => ({ ...prev, [paramName]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const processedParams: Record<
        string,
        string | number | (string | number)[]
      > = {};

      Object.entries(properties).forEach(([key, value]) => {
        const userValue = formValues[key];

        if (userValue === undefined || userValue === "") return;

        if (value.type === "array") {
          if (typeof userValue === "string") {
            processedParams[key] = userValue
              .split(",")
              .map(item => item.trim())
              .filter(item => item !== "");
          } else {
            processedParams[key] = [userValue];
          }
        } else if (value.type === "number" || value.type === "integer") {
          processedParams[key] = Number(userValue);
        } else {
          processedParams[key] = userValue;
        }
      });

      const submitResult = await submitTask.mutateAsync({
        name: plan.name || "",
        params: processedParams,
        instrument_session: instrumentSession,
      });

      await startTask.mutateAsync(submitResult.task_id);
      onSuccess(`Plan ${plan.name} started successfully!`);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { detail?: string | PydanticValidationError[] } };
      };
      const errorData = axiosError.response?.data?.detail;
      let userFriendlyMessage = `Execution failed for ${plan.name}.`;

      if (typeof errorData === "string") {
        userFriendlyMessage = errorData;
      } else if (Array.isArray(errorData)) {
        userFriendlyMessage = errorData
          .map((e: PydanticValidationError) => {
            const field = e.loc ? e.loc[e.loc.length - 1] : "Parameter";
            return `${field}: ${e.msg}`;
          })
          .join(" | ");
      }

      onError(userFriendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      elevation={2}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: "monospace",
              color: "primary.main",
              fontWeight: "bold",
            }}
          >
            {plan.name}
          </Typography>
        </Stack>

        <Divider sx={{ mt: 2 }} />

        <Accordion
          defaultExpanded={false}
          elevation={0}
          sx={{ bgcolor: "transparent" }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CodeIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" fontWeight="bold">
                Configure & View Details
              </Typography>
            </Stack>
          </AccordionSummary>

          <AccordionDetails sx={{ px: 0 }}>
            <Stack spacing={2.5}>
              {cleanDescription && (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    borderLeft: "3px solid",
                    borderColor: "primary.light",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 0.5,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    Protocol Documentation:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", lineHeight: 1.5 }}
                  >
                    {cleanDescription}
                  </Typography>
                </Box>
              )}

              {Object.entries(properties).map(([key, value]) => {
                const isRequired = requiredFields.includes(key);
                const isDevice =
                  key.toLowerCase().includes("device") ||
                  key.toLowerCase().includes("detector");

                return (
                  <TextField
                    key={key}
                    label={isRequired ? `${key} (Required)` : key}
                    fullWidth
                    size="small"
                    required={isRequired}
                    type={
                      value.type === "number" || value.type === "integer"
                        ? "number"
                        : "text"
                    }
                    value={formValues[key] ?? ""}
                    onChange={e => handleInputChange(key, e.target.value)}
                    helperText={
                      value.type === "array"
                        ? `Enter values separated by commas (e.g. det1, det2). ${value.description || ""}`
                        : isDevice
                          ? `Enter device ID (e.g. motor_x). ${value.description || ""}`
                          : value.description
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    placeholder={
                      value.type === "array"
                        ? "det1, det2"
                        : isDevice
                          ? "e.g., detector_a"
                          : ""
                    }
                    sx={{
                      ...(isRequired && {
                        "& .MuiInputLabel-root": {
                          color: "warning.main",
                          fontWeight: "bold",
                        },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "rgba(237, 108, 2, 0.5)",
                          },
                          "&:hover fieldset": { borderColor: "warning.main" },
                        },
                      }),
                    }}
                  />
                );
              })}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </CardContent>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Button
          variant="contained"
          fullWidth
          startIcon={
            submitting ? <CircularProgress size={20} /> : <PlayArrowIcon />
          }
          onClick={handleSubmit}
          disabled={submitting || workerState.data !== "IDLE"}
        >
          {submitting ? "Running..." : `Run ${plan.name}`}
        </Button>
      </Box>
    </Card>
  );
}
