import { Box, Typography, Slider } from "@mui/material";
import { useEffect, useState } from "react";

export default function SliceViewer() {
  // view different image slices with slider
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="overline" color="primary">
          Slice View
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          overflow: "hidden",
          p: 0.5,
        }}
      >
        <Box
          component="img"
          src="/test-data/seal.png"
          alt="projection"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
      </Box>

      <Slider
        aria-label="Slice View"
        defaultValue={1}
        // onChange = {handleChange}
        // getAriaValueText={valuetext}
        valueLabelDisplay="auto"
        shiftStep={1}
        step={1}
        marks
        min={1}
        max={10}
      />
    </Box>
  );
}
