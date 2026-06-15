/** Shared native `<select>` styling — flat like `Input` / `EntitySelect` (no browser chevron). */
export const NATIVE_SELECT_CLASS =
  "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

/** `date` / `datetime-local` — calendar icon aligned to the right edge. */
export const NATIVE_DATE_INPUT_CLASS =
  "relative pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer";
