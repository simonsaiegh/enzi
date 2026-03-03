export const APP_NAME = "Enzi";
export const PET_NAME = "Enzo";
export const PET_NICKNAME = "Enzi";
export const PET_BREED = "Border Collie";

export const DEFAULT_ANTI_DUPLICATE_SECONDS = 60;
export const DEFAULT_ALERT_THRESHOLD_MINUTES = 480; // 8 hours
export const UNDO_WINDOW_MINUTES = 5;

export const MEAL_SOURCES = {
  NFC: "nfc",
  MANUAL: "manual",
} as const;

export const DISPENSER_MODES = {
  AUTO: "auto",
  CONFIRM: "confirm",
} as const;

export const DEFAULT_DISPENSERS = [
  {
    name: "Comida AM",
    icon: "sunrise",
    color: "#F59E0B",
    defaultAmountGrams: 150,
    sortOrder: 0,
  },
  {
    name: "Comida PM",
    icon: "sunset",
    color: "#F97316",
    defaultAmountGrams: 150,
    sortOrder: 1,
  },
] as const;
