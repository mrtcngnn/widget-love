import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ButtonBase,
  IconButton,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCity } from "../store/citiesSlice";
import type { AppDispatch, RootState } from "../store/store";
import cityPhotoFiles from "virtual:city-photos";
import düldülImage from "../assets/düldül.png";
import CheckIcon from '@mui/icons-material/Check';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const city = useSelector((state: RootState) =>
    state.cities.items.find((item) => item.code === cityCode) ?? null
  );
  const cities = useSelector((state: RootState) => state.cities.items);

  useEffect(() => {
    if (!open) {
      setShowDatePickers(false);
      setArrivalDate(null);
      setDepartureDate(null);
      setPreviewPhoto(null);
    }
  }, [open]);

  if (!city) return null;

  const isVisited = city.visited;
  const canSave = Boolean(arrivalDate && departureDate);
  const photoDirectory = (city.photosPath ?? `city-photos/${city.code}/`)
    .replace(/^\/+/, "")
    .replace(/\/?$/, "/");
  const cityPhotos = cityPhotoFiles.filter((photoPath) =>
    photoPath.startsWith(photoDirectory)
  );
  const getPhotoSrc = (photoPath: string) =>
    /^https?:\/\//.test(photoPath)
      ? photoPath
      : `${import.meta.env.BASE_URL}${photoPath.replace(/^\/+/, "")}`;

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
    <>
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
                Gidiş ve dönüş tarihlerini seç
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Gidiş Tarihi"
                  format="DD/MM/YYYY"
                  value={arrivalDate}
                  onChange={(newValue) => setArrivalDate(newValue)}
                  sx={datePickerStyles}
                  slotProps={datePickerSlotProps}
                />
                <DatePicker
                  label="Dönüş Tarihi"
                  format="DD/MM/YYYY"
                  value={departureDate}
                  onChange={(newValue) => setDepartureDate(newValue)}
                  sx={datePickerStyles}
                  slotProps={datePickerSlotProps}
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
            {cityPhotos.length > 0 ? (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 1,
                  }}
                >
                  {cityPhotos.map((photoPath, index) => (
                    <ButtonBase
                      key={`${photoPath}-${index}`}
                      onClick={() => setPreviewPhoto(getPhotoSrc(photoPath))}
                      aria-label={`${city.name} fotoğrafını büyüt`}
                      sx={{
                        width: "100%",
                        borderRadius: 2,
                        overflow: "hidden",
                        lineHeight: 0,
                        cursor: "zoom-in",
                        border: "1px solid rgba(255, 143, 179, 0.5)",
                      }}
                    >
                      <Box
                        component="img"
                        src={getPhotoSrc(photoPath)}
                        alt={`${city.name} gezi fotoğrafı ${index + 1}`}
                        loading="lazy"
                        sx={{
                          display: "block",
                          width: "100%",
                          aspectRatio: "4 / 3",
                          objectFit: "cover",
                          transition: "transform 180ms ease",
                          "&:hover": { transform: "scale(1.04)" },
                        }}
                      />
                    </ButtonBase>
                  ))}
                </Box>
              </>
            ) : (
              <Typography sx={{ color: "#ffd6e8" }}>
                Henüz fotoğraf eklenmemiş.
              </Typography>
            )}
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
    <Dialog
      open={Boolean(previewPhoto)}
      onClose={() => setPreviewPhoto(null)}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: "rgba(27, 16, 45, 0.98)",
            border: "2px solid #ff6b9d",
            borderRadius: 3,
            color: "white",
          },
        },
      }}
    >
      <DialogContent
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 2, sm: 4 },
        }}
      >
        {previewPhoto && (
          <>
            <Box
              component="img"
              src={previewPhoto}
              alt={`${city.name} büyük fotoğraf önizlemesi`}
              sx={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 1,
              }}
            />
            <IconButton
              aria-label="Önceki fotoğraf"
              onClick={() => {
                const currentIndex = cityPhotos.findIndex(
                  (photoPath) => getPhotoSrc(photoPath) === previewPhoto
                );
                const previousIndex = (currentIndex - 1 + cityPhotos.length) % cityPhotos.length;
                setPreviewPhoto(getPhotoSrc(cityPhotos[previousIndex]));
              }}
              disabled={cityPhotos.length < 2}
              sx={{
                position: "absolute",
                left: { xs: 8, sm: 20 },
                top: "50%",
                transform: "translateY(-50%)",
                color: "#fff",
                bgcolor: "rgba(42, 21, 63, 0.75)",
                border: "1px solid rgba(255, 107, 157, 0.7)",
                "&:hover": { bgcolor: "rgba(255, 107, 157, 0.8)" },
                "&.Mui-disabled": { color: "rgba(255,255,255,0.35)" },
              }}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
            <IconButton
              aria-label="Sonraki fotoğraf"
              onClick={() => {
                const currentIndex = cityPhotos.findIndex(
                  (photoPath) => getPhotoSrc(photoPath) === previewPhoto
                );
                const nextIndex = (currentIndex + 1) % cityPhotos.length;
                setPreviewPhoto(getPhotoSrc(cityPhotos[nextIndex]));
              }}
              disabled={cityPhotos.length < 2}
              sx={{
                position: "absolute",
                right: { xs: 8, sm: 20 },
                top: "50%",
                transform: "translateY(-50%)",
                color: "#fff",
                bgcolor: "rgba(42, 21, 63, 0.75)",
                border: "1px solid rgba(255, 107, 157, 0.7)",
                "&:hover": { bgcolor: "rgba(255, 107, 157, 0.8)" },
                "&.Mui-disabled": { color: "rgba(255,255,255,0.35)" },
              }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={() => setPreviewPhoto(null)}
          variant="outlined"
          sx={{
            color: "#fff",
            borderColor: "#ff6b9d",
            fontFamily: '"Loved by the King", cursive',
            fontSize: "1.1rem",
            borderRadius: 999,
            px: 3,
            textTransform: "none",
          }}
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

const datePickerStyles = {
  '& .MuiPickersOutlinedInput-root': { color: '#ffd6e8' },
  '& .MuiPickersInputBase-sectionsContainer': { color: '#ffd6e8' },
  '& .MuiPickersInputBase-sectionContent': { color: '#ffd6e8' },
  '& .MuiPickersInputBase-root .MuiIconButton-root': { color: '#ffd6e8' },
  '& .MuiPickersInputBase-root .MuiSvgIcon-root': { color: '#ffd6e8' },
  '& .MuiPickersOutlinedInput-notchedOutline': { borderColor: '#ffd6e8 !important' },
  '& .MuiPickersOutlinedInput-root:hover .MuiPickersOutlinedInput-notchedOutline': {
    borderColor: '#ffd6e8 !important',
  },
  '& .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
    borderColor: '#ffd6e8 !important',
  },
  '& .MuiPickersInputBase-sectionContent::selection': {
    color: '#ffd6e8',
    backgroundColor: 'rgba(255, 214, 232, 0.25)',
  },
  '& .MuiInputLabel-root': { color: '#ffd6e8' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#ffd6e8' },
  '& .MuiIconButton-root': { color: '#ffd6e8' },
  '& .MuiPickersDay-root.Mui-selected': {
    backgroundColor: '#ff6b9d',
    color: '#fff',
    '&:hover': { backgroundColor: '#ff5a8e' },
  },
  '& .MuiPickersDay-root.Mui-today': { borderColor: '#ff8fb3' },
  '& .MuiPickersCalendarHeader-label': { color: '#fff' },
  '& .MuiPickersMonth-monthButton': { color: '#fff' },
  '& .MuiPickersYear-yearButton': { color: '#fff' },
  '& .MuiDayCalendar-weekDayLabel': { color: '#fff' },
  '& .MuiPickersDay-root': { color: '#fff' },
  '& .MuiPickersArrowSwitcher-button': { color: '#fff' },
};

const datePickerSlotProps = {
  textField: {
    sx: {
      '& .MuiPickersOutlinedInput-root': { color: '#ffd6e8' },
      '& .MuiPickersInputBase-sectionsContainer': { color: '#ffd6e8' },
      '& .MuiPickersInputBase-sectionContent': { color: '#ffd6e8' },
      '& .MuiPickersInputBase-root .MuiIconButton-root': { color: '#ffd6e8' },
      '& .MuiPickersInputBase-root .MuiSvgIcon-root': { color: '#ffd6e8' },
      '& .MuiPickersOutlinedInput-notchedOutline': { borderColor: '#ffd6e8 !important' },
      '& .MuiPickersOutlinedInput-root:hover .MuiPickersOutlinedInput-notchedOutline': {
        borderColor: '#ffd6e8 !important',
      },
      '& .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
        borderColor: '#ffd6e8 !important',
      },
      '& .MuiInputLabel-root': { color: '#ffd6e8' },
      '& .MuiInputLabel-root.Mui-focused': { color: '#ffd6e8' },
      '& .MuiPickersInputBase-sectionContent::selection': {
        color: '#ffd6e8',
        backgroundColor: 'rgba(255, 214, 232, 0.25)',
      },
    },
  },
  popper: {
    sx: {
      '& .MuiPaper-root': {
        color: '#ffd6e8',
        background: 'linear-gradient(180deg, #2a153f 0%, #1b102d 100%)',
        border: '1px solid #ff6b9d',
        borderRadius: 3,
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.45)',
      },
      '& .MuiPickersCalendarHeader-label': { color: '#ffd6e8' },
      '& .MuiPickersMonth-monthButton': { color: '#ffd6e8' },
      '& .MuiPickersYear-yearButton': { color: '#ffd6e8' },
      '& .MuiDayCalendar-weekDayLabel': { color: '#ffd6e8 !important' },
      '& .MuiPickerDay-root': { color: '#ffd6e8 !important' },
      '& .MuiPickerDay-root:not(.Mui-selected)': { color: '#ffd6e8 !important' },
      '& .MuiPickerDay-root.Mui-selected': {
        color: '#fff !important',
        backgroundColor: '#ff6b9d',
        '&:hover': { backgroundColor: '#ff5a8e' },
      },
      '& .MuiPickerDay-root.MuiPickerDay-today': { outlineColor: '#ff8fb3' },
      '& .MuiPickersArrowSwitcher-button': { color: '#ffd6e8' },
      '& .MuiPickersCalendarHeader-switchViewButton': { color: '#ffd6e8' },
      '& .MuiIconButton-root': { color: '#ffd6e8' },
    },
  },
};