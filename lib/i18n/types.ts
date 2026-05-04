import type messages from "./messages.json";

export type Locale = "en" | "vi";

export type MessagesPayload = typeof messages;

/** Bilingual leaf used under `errors` and `common`. */
export type LocalizedString = { en: string; vi: string };
