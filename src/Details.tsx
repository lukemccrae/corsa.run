import React from "react";
import { PaceTable } from "./PaceTable";
import { Link, useParams } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { getPlanById } from "./services/fetchPlans.service";
import { FeatureCollection, FeatureProperties, Plan } from "./types";
import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { MapComponent } from "./MapComponent";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getGeoJsonBySortKey } from "./services/fetchMap.service";
import { DeleteCourse } from "./DeleteCourse";


import { ChartWrapper } from "./ChartWrapper";
import { useScreenSize } from "./helpers/screensize.helper";
// @ts-ignore
import LexicalEditorWrapper from "./text-editor/components/LexicalEditorWrapper";

export const Details = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [plan, setPlan] = React.useState<Plan>();
  const [coords, setCoords] = React.useState<number[][]>();
  const [properties, setProperties] = React.useState<FeatureProperties>();
  const [hoveredPoint, setHoveredPoint] = React.useState<number>(0);

  const screenSize = useScreenSize();

  let elevationWidth: number;

  switch (screenSize) {
    case 'sm':
      elevationWidth = window.innerWidth - 100;
      console.log(screenSize)

      break;
    case 'md':
      elevationWidth = 500;
      console.log(screenSize)

      break;
    case 'lg':
      elevationWidth = 700;
      console.log(screenSize)

      break;
    case 'xl':
      elevationWidth = 700;
      console.log(screenSize)

      break;
    default:
      elevationWidth = 700;
      break;
  }


  // condensedPointIndex is a way for the pace calculations to be on the same index with the elevation profile
  // elevation profile is shortened version of points so this guides indexing the map array

  React.useEffect(() => {
    if (id && user) {
      const userId = user.userId;
      const planId = id;

      const fetchPlan = async () => {
        const planResult: Plan = await getPlanById({ userId, planId });
        const mapResult: FeatureCollection = await getGeoJsonBySortKey({ planId });
        setPlan(planResult);
        setCoords(mapResult.features[0].geometry.coordinates);
        setProperties(mapResult.features[0].properties)
      };
      fetchPlan();
    }
  }, [id, user]);

  const handleSetHoveredPoint = (x: number) => {
    if (properties) {
      setHoveredPoint(Math.floor((x / elevationWidth) * properties.pointMetadata.length))
    }
  }

  if (plan) {
    return (
      <Container sx={{ mt: '100px' }} maxWidth="xl">
        <Box
          display="flex"
          flexDirection={{ xs: "column", xl: "row" }}  // Stack on small, side-by-side on xl
          sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}  // Align to the left
          width="100%"
          gap={4}  // Reduced gap for better spacing
        >
          {/* Left Side - Locked to Left */}
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            flex="0 0 300px"  // Fixed width, doesn't grow or shrink
            sx={{ alignSelf: "stretch" }}  // Stretch to match right column's height
          >
            <Link to="/app" style={{ color: '#515B63' }}>
              <ArrowBackIcon />
            </Link>

            <DeleteCourse planId={plan.id} label={"Delete"} />

            <PaceTable plan={plan} />

            {(properties && coords) && (
              <ChartWrapper
                elevationWidth={elevationWidth}
                coords={coords}
                hoveredPoint={hoveredPoint}
                handleSetHoveredPoint={handleSetHoveredPoint}
                properties={properties}
                plan={plan}
              />
            )}
          </Box>

          {/* Right Side - Wider Lexical Editor */}
          <Box
            flex="1 1 auto"  // Takes up remaining space
            minWidth="600px"  // Minimum width for comfort
            sx={{ alignSelf: "stretch" }}  // Matches left column's height
          >
            <LexicalEditorWrapper />
          </Box>
        </Box>
      </Container>

    );
  } else {
    return <div></div>;
  }
};
