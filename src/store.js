import { atom, createStore } from "jotai";

export const isSocialModalVisibleAtom = atom(false);
export const selectedLinkAtom = atom(null);
export const selectedLinkDescriptionAtom = atom("");

export const isEmailModalVisibleAtom = atom(false);
export const emailAtom = atom("");

export const isProjectModalVisibleAtom = atom(false);
export const chosenProjectDataAtom = atom({
  title: "",
  links: [{ id: 0, name: "", link: "" }],
});

export const musicVolumeAtom = atom(0.15);
export const sfxVolumeAtom = atom(1);

export const cameraZoomValueAtom = atom({ value: 1 });

export const isSkillsModalVisibleAtom = atom(false);
export const skillsDataAtom = atom([]);

export const store = createStore();