
import { atom } from "jotai";

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

export const isSkillsModalVisibleAtom = atom(false);
export const isWorkExperienceModalVisibleAtom = atom(false);
export const isProjectGalleryVisibleAtom = atom(false);
export const isAboutModalVisibleAtom = atom(false);

export const isDialogueVisibleAtom = atom(false);
export const dialogueContentAtom = atom([]);
export const currentNpcNameAtom = atom("");
export const dialoguePositionAtom = atom({ x: 0, y: 0 });
