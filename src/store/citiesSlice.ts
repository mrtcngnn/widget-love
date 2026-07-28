import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import citiesData from "../assets/cities.json";

const cityDataSource = citiesData as CityEntry[];

export interface CityEntry {
  code: string;
  name?: string;
  visited: boolean;
  visitedFrom: string | null;
  visitedTo: string | null;
  photos: string[];
}

interface CitiesState {
  items: CityEntry[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CitiesState = {
  items: cityDataSource.map((city) => ({ ...city })),
  status: "succeeded",
  error: null,
};

const persistCities = async (cities: CityEntry[]) => {
  if (typeof window === "undefined") return;

  try {
    const response = await fetch("/api/cities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cities),
    });

    if (!response.ok) {
      throw new Error("Failed to persist cities");
    }
  } catch {
    // fail silently for now
  }
};

export const loadCities = createAsyncThunk("cities/loadCities", async () => {
  return cityDataSource.map((city) => ({ ...city }));
});

type CityUpdatePayload = {
  code: string;
  updates: Partial<Pick<CityEntry, "visited" | "visitedFrom" | "visitedTo" | "photos">>;
};

const citiesSlice = createSlice({
  name: "cities",
  initialState,
  reducers: {
    setCities: (state, action: PayloadAction<CityEntry[]>) => {
      state.items = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    updateCity: (state, action: PayloadAction<CityUpdatePayload>) => {
      const index = state.items.findIndex((item) => item.code === action.payload.code);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload.updates,
        };
        void persistCities(state.items);
        state.status = "succeeded";
        state.error = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCities.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadCities.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(loadCities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load cities";
      });
  },
});

export const { setCities, updateCity } = citiesSlice.actions;
export default citiesSlice.reducer;
