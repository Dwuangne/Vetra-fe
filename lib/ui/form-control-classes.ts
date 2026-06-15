/** Shared native `<select>` styling — flat like `Input` / `EntitySelect` (no browser chevron). */
export const NATIVE_SELECT_CLASS =
  "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

/** Hide browser calendar/spinner chrome on date/time inputs. */
export const HIDE_NATIVE_PICKER_CLASS =
  "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden";
