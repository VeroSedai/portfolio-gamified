import { atom } from "jotai";

export const cameraZoomValueAtom = atom({ value: 1 });
export const sfxTriggerAtom = atom({ name: "", id: 0 });
export const activeMiniGameAtom = atom(null); // "matrix", "quiz", etc.
