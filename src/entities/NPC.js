import {
  isDialogueVisibleAtom,
  dialogueContentAtom,
  currentNpcNameAtom,
  dialoguePositionAtom,
  isMusicPausedAtom,
  store
} from "../stores";

export default function makeNPC(k, config) {
  const npc = k.add([
    k.sprite(config.sprite || "player", { anim: "idle" }), // Default to player sprite
    k.scale(8),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0), 12, 12) }),
    k.body({ isStatic: true }),
    k.pos(config.position.x, config.position.y),
    "npc",
    {
      id: config.id,
      name: config.name,
      dialogue: config.dialogue
    }
  ]);

  // Interaction Label
  const label = npc.add([
    k.text("!", { font: "ibm-bold", size: 14 }),
    k.color(k.Color.YELLOW),
    k.anchor("center"),
    k.pos(0, -18),
    k.opacity(0),
    "label"
  ]);

  // Bobbing animation for label
  label.onUpdate(() => {
     label.pos.y = -18 + Math.sin(k.time() * 5) * 2;
  });

  // Collision Logic
  let isNear = false;

  npc.onCollide("player", () => {
      isNear = true;
      k.tween(label.opacity, 1, 0.2, (v) => label.opacity = v, k.easings.linear);
      if (config.stopMusicOnTouch) {
          store.set(isMusicPausedAtom, true);
      }
  });

  npc.onCollideEnd("player", () => {
      isNear = false;
      k.tween(label.opacity, 0, 0.2, (v) => label.opacity = v, k.easings.linear);
      if (config.stopMusicOnTouch) {
          store.set(isMusicPausedAtom, false);
      }
      // Close dialogue if walking away? Optional. 
      // store.set(isDialogueVisibleAtom, false); 
  });

  // Input to Trigger Dialogue
  // Note: We check global input but filter by proximity
  k.onKeyPress("space", () => {
    if (isNear && !store.get(isDialogueVisibleAtom)) {
        const screenPos = k.toScreen(npc.pos);
        store.set(dialoguePositionAtom, { x: screenPos.x, y: screenPos.y });
        store.set(currentNpcNameAtom, config.name);
        store.set(dialogueContentAtom, config.dialogue);
        store.set(isDialogueVisibleAtom, true);
    }
  });
  
  // Also on touch/click for mobile
  npc.onClick(() => {
     if (isNear && !store.get(isDialogueVisibleAtom)) {
        const screenPos = k.toScreen(npc.pos);
        store.set(dialoguePositionAtom, { x: screenPos.x, y: screenPos.y });
        store.set(currentNpcNameAtom, config.name);
        store.set(dialogueContentAtom, config.dialogue);
        store.set(isDialogueVisibleAtom, true);
     }
  });

  return npc;
}
