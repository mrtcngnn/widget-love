import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import TurkeyMap from "./TurkeyMap";
import CityDialog from "./CityDialog";
import { loadCities } from "../store/citiesSlice";
import type { RootState, AppDispatch } from "../store/store";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const cities = useSelector((state: RootState) => state.cities.items);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    if (cities.length === 0) {
      dispatch(loadCities());
    }
  }, [cities.length, dispatch]);

  const handleCityClick = (city: any) => {
    const rawCode = city?.dataset?.cityCode;
    const normalizedCode = rawCode ? String(rawCode).padStart(2, "0") : null;
    const resolvedCode = normalizedCode === "34" ? "34" : normalizedCode;
    setSelectedCity(resolvedCode ?? null);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at top, #3a1b5a 0%, #1b102d 45%, #0d0d15 100%)",
      }}
    >
      <Typography
        sx={{
          textAlign: "center",
          fontFamily: '"Loved by the King", cursive',
          fontSize: "4rem",
          mt: 2,
          background:
            "linear-gradient(90deg,#ff6b9d,#ff3b6b,#c445ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        DÜLDÜLLE AŞK PEŞİNDE
      </Typography>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TurkeyMap onCityClick={handleCityClick} />
      </Box>

      <CityDialog
        open={selectedCity !== null}
        cityCode={selectedCity}
        onClose={() => setSelectedCity(null)}
      />
    </Box>
  );
}

export default App;