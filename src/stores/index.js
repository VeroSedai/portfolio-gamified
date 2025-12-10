import { createStore } from "jotai";

export * from "./uiStore";
export * from "./dataStore";
export * from "./settingsStore";
export * from "./gameStore";

export const store = createStore();
