import { DIAGONAL_FACTOR } from "../constants";
import {
  isEmailModalVisibleAtom,
  isProjectModalVisibleAtom,
  isSocialModalVisibleAtom,
  isSkillsModalVisibleAtom,
  isWorkExperienceModalVisibleAtom,
  isAboutModalVisibleAtom,
  isProjectGalleryVisibleAtom,
  isDialogueVisibleAtom,
  store,
} from "../stores";
import { getDirectionFromInput, updatePlayerAnimation } from "./playerUtils";

export default function makePlayer(k, posVec2, playerConfig) {
  const speed = playerConfig.speed || 100;
  const directionsMode = playerConfig.directions || 8; 

  const player = k.add([
    k.sprite("player", { anim: "walk-down" }),
    k.scale(playerConfig.scale || 8),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0), 10, 10) }),
    k.body(),
    k.pos(posVec2),
    "player",
    {
      direction: k.vec2(0, 0),
      directionName: "walk-down",
      isIdle: true,
      k: k // Attach k instance for utils
    },
  ]);

  // Mouse/Touch Input Handling
  let isMouseDown = false;
  const game = document.getElementById("game");
  if (game) {
    game.addEventListener("focusout", () => { isMouseDown = false; });
    game.addEventListener("mousedown", () => { isMouseDown = true; });
    game.addEventListener("mouseup", () => { isMouseDown = false; });
    game.addEventListener("touchstart", () => { isMouseDown = true; });
    game.addEventListener("touchend", () => { isMouseDown = false; });
  }

  player.onUpdate(() => {
    // Camera Follow
    if (!k.getCamPos().eq(player.pos)) {
      k.tween(
        k.getCamPos(),
        player.pos,
        0.2,
        (newPos) => k.setCamPos(newPos),
        k.easings.linear
      );
    }

    // Stop movement if Modals are open
    if (
      store.get(isSocialModalVisibleAtom) ||
      store.get(isEmailModalVisibleAtom) ||
      store.get(isProjectModalVisibleAtom) ||
      store.get(isSkillsModalVisibleAtom) ||
      store.get(isWorkExperienceModalVisibleAtom) ||
      store.get(isAboutModalVisibleAtom) ||
      store.get(isProjectGalleryVisibleAtom) ||
      store.get(isDialogueVisibleAtom) ||
      player.paused 
    ) {
      if (!player.paused) {
          try { player.play("idle"); } catch(e) {}
      }
      return;
    }

    // Calculate Direction
    player.direction = getDirectionFromInput(k, isMouseDown, player.pos);

    // Animation Logic
    updatePlayerAnimation(player, directionsMode);

    // Physics Movement
    if (player.direction.x && player.direction.y) {
      player.move(player.direction.scale(DIAGONAL_FACTOR * speed));
      return;
    }
    player.move(player.direction.scale(speed));
  });

  return player;
}