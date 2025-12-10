import { createStore } from "jotai";

export * from "./uiStore";
export * from "./dataStore";
export { musicVolumeAtom, sfxVolumeAtom, themeAtom, isMusicPausedAtom } from "./settingsStore";
export * from "./gameStore";

export const store = createStore();
