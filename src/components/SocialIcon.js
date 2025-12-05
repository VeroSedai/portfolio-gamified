import {
  isSocialModalVisibleAtom,
  selectedLinkAtom,
  selectedLinkDescriptionAtom,
  store,
} from "../store";
import { opacityTrickleDown } from "../utils";
import makeIcon from "./Icon";

export default function makeSocialIcon(
  k,
  parent,
  posVec2,
  imageData,
  subtitle,
  link,
  description,
  theme
) {
  const [socialIcon, subtitleText] = makeIcon(
    k,
    parent,
    posVec2,
    imageData,
    subtitle,
    theme
  );

  const backgroundColor = theme?.colors?.background || "#0b0c15";

  const linkSwitch = socialIcon.add([
    k.circle(30),
    k.color(k.Color.fromHex(backgroundColor)), 
    k.anchor("center"),
    k.area(),
    k.pos(0, 150),
    k.opacity(0),
  ]);

  linkSwitch.onCollide("player", () => {
    store.set(isSocialModalVisibleAtom, true);
    store.set(selectedLinkAtom, link);
    store.set(selectedLinkDescriptionAtom, description);
  });

  opacityTrickleDown(parent, [subtitleText, linkSwitch]);

  return socialIcon;
}