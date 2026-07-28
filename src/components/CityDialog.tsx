import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCity } from "../store/citiesSlice";
import type { AppDispatch, RootState } from "../store/store";
import düldülImage from "../assets/düldül.png";
import CheckIcon from '@mui/icons-material/Check';

interface CityDialogProps {
  open: boolean;
  cityCode: string | null;
  onClose: () => void;
}

export default function CityDialog({
  open,
  cityCode,
  onClose,
}: CityDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [showDatePickers, setShowDatePickers] = useState(false);
  const [arrivalDate, setArrivalDate] = useState<Dayjs | null>(null);
  const [departureDate, setDepartureDate] = useState<Dayjs | null>(null);

  const city = useSelector((state: RootState) =>
    state.cities.items.find((item) => item.code === cityCode) ?? null
  );
  const cities = useSelector((state: RootState) => state.cities.items);

  useEffect(() => {
    if (!open) {
      setShowDatePickers(false);
      setArrivalDate(null);
      setDepartureDate(null);
    }
  }, [open]);

  if (!city) return null;

  const isVisited = city.visited;
  const canSave = Boolean(arrivalDate && departureDate);

  const handleSaveVisit = () => {
    if (!city || !arrivalDate || !departureDate) return;

    const formattedArrival = arrivalDate.format("DD/MM/YYYY");
    const formattedDeparture = departureDate.format("DD/MM/YYYY");

    dispatch(
      updateCity({
        code: city.code,
        updates: {
          visited: true,
          visitedFrom: formattedArrival,
          visitedTo: formattedDeparture,
        },
      })
    );

    const nextItems = cities.map((item) =>
      item.code === city.code
        ? {
            ...item,
            visited: true,
            visitedFrom: formattedArrival,
            visitedTo: formattedDeparture,
          }
        : item
    );

    if (typeof window !== "undefined") {
      window.localStorage.setItem("widget-love-cities", JSON.stringify(nextItems));
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background:
              "linear-gradient(180deg, #2a153f 0%, #1b102d 100%)",
            border: "2px solid #ff6b9d",
            borderRadius: 4,
            color: "white",
            boxShadow: "0 0 30px rgba(255, 107, 157, 0.35)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "#fff",
          textAlign: "center",
          fontFamily: '"Loved by the King", cursive',
          fontSize: "2.6rem",
          pb: 1,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "center" }}>
          <span>{city.name}</span>
          {isVisited && <CheckIcon sx={{ color: "#00ff15", fontSize: "3rem" }} />}
        </Stack>
      </DialogTitle>
      <DialogContent>
        {!isVisited ? (
          showDatePickers ? (
            <Stack spacing={2} sx={{ py: 1 }}>
              <Typography
                sx={{
                  textAlign: "center",
                  fontFamily: '"Loved by the King", cursive',
                  fontSize: "1.2rem",
                  color: "#ffd6e8",
                }}
              >
                Geliş ve gidiş tarihlerini seç
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Geliş Tarihi"
                  format="DD/MM/YYYY"
                  value={arrivalDate}
                  onChange={(newValue) => setArrivalDate(newValue)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: '#fff',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff8fb3',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff6b9d',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ffd6e8',
                    },
                    '& .MuiIconButton-root': {
                      color: '#fff',
                    },
                    '& .MuiPickersDay-root.Mui-selected': {
                      backgroundColor: '#ff6b9d',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#ff5a8e',
                      },
                    },
                    '& .MuiPickersDay-root.Mui-today': {
                      borderColor: '#ff8fb3',
                    },
                    '& .MuiPickersCalendarHeader-label': {
                      color: '#fff',
                    },
                    '& .MuiDayCalendar-weekDayLabel': {
                      color: '#ffd6e8',
                    },
                    '& .MuiPickersArrowSwitcher-button': {
                      color: '#fff',
                    },
                  }}
                  slotProps={{
                    textField: {
                      sx: {
                        '& .MuiInputBase-input': {
                          color: '#fff',
                        },
                      },
                    },
                  }}
                />
                <DatePicker
                  label="Gidiş Tarihi"
                  format="DD/MM/YYYY"
                  value={departureDate}
                  onChange={(newValue) => setDepartureDate(newValue)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: '#fff',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff8fb3',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff6b9d',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ffd6e8',
                    },
                    '& .MuiIconButton-root': {
                      color: '#fff',
                    },
                    '& .MuiPickersDay-root.Mui-selected': {
                      backgroundColor: '#ff6b9d',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#ff5a8e',
                      },
                    },
                    '& .MuiPickersDay-root.Mui-today': {
                      borderColor: '#ff8fb3',
                    },
                    '& .MuiPickersCalendarHeader-label': {
                      color: '#fff',
                    },
                    '& .MuiDayCalendar-weekDayLabel': {
                      color: '#ffd6e8',
                    },
                    '& .MuiPickersArrowSwitcher-button': {
                      color: '#fff',
                    },
                  }}
                  slotProps={{
                    textField: {
                      sx: {
                        '& .MuiInputBase-input': {
                          color: '#fff',
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ py: 1, alignItems: "center" }}>
              <img
                src={düldülImage}
                alt="Düldül"
                style={{ width: 180, height: 180, objectFit: "contain" }}
              />
              <Typography
                sx={{
                  textAlign: "center",
                  fontFamily: '"Loved by the King", cursive',
                  fontSize: "1.4rem",
                  color: "#ffd6e8",
                }}
              >
                Düldül buraya gitmek için sabırsızlanıyor...
              </Typography>
            </Stack>
          )
        ) : (
          <Stack spacing={2}>
            <Typography>
              Ziyaret Tarihi: {city.visitedFrom ? `${city.visitedFrom}` : "-"} {city.visitedTo ? `- ${city.visitedTo}` : ""}
            </Typography>
            <Typography>Fotoğraflar: {city.name === 'Ankara' ? '∞' : city.photos.length}</Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        {!isVisited && (
          showDatePickers ? (
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={handleSaveVisit}
              disabled={!canSave}
              sx={{
                borderRadius: 999,
                px: 3,
                py: 1,
                fontFamily: '"Loved by the King", cursive',
                fontSize: "1rem",
                background: "linear-gradient(90deg, #ff6b9d 0%, #ff8fb3 100%)",
                color: "#fff",
                boxShadow: "0 0 15px rgba(255, 107, 157, 0.35)",
                textTransform: "none",
                '&:hover': {
                  background: "linear-gradient(90deg, #ff5a8e 0%, #ff7aa6 100%)",
                },
              }}
            >
              Tik at ;)
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={() => setShowDatePickers(true)}
              sx={{
                borderRadius: 999,
                px: 3,
                py: 1,
                fontFamily: '"Loved by the King", cursive',
                fontSize: "1rem",
                background: "linear-gradient(90deg, #ff6b9d 0%, #ff8fb3 100%)",
                color: "#fff",
                boxShadow: "0 0 15px rgba(255, 107, 157, 0.35)",
                textTransform: "none",
                '&:hover': {
                  background: "linear-gradient(90deg, #ff5a8e 0%, #ff7aa6 100%)",
                },
              }}
            >
              Tik at ;)
            </Button>
          )
        )}
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#fff",
            borderColor: "#ff6b9d",
            fontFamily: '"Loved by the King", cursive',
            fontSize: "1.1rem",
            px: 3,
            borderRadius: 999,
            textTransform: "none",
            background: "rgba(255, 107, 157, 0.12)",
            '&:hover': {
              borderColor: "#ff8fb3",
              background: "rgba(255, 107, 157, 0.22)",
            },
          }}
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
}