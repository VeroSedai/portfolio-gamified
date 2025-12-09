import { DIAGONAL_FACTOR } from "../constants";
import {
  isEmailModalVisibleAtom,
  isProjectModalVisibleAtom,
  isSocialModalVisibleAtom,
  isSkillsModalVisibleAtom,
  isWorkExperienceModalVisibleAtom,
  isAboutModalVisibleAtom,
  isProjectGalleryVisibleAtom,
  store,
} from "../store";

export default function makePlayer(k, posVec2, playerConfig) {
  const speed = playerConfig.speed || 100;
  // If not specified, default to 8 (Pro), otherwise use the one from JSON
  const directionsMode = playerConfig.directions || 8; 

  const player = k.add([
    k.sprite("player", { anim: "walk-down" }),
    k.scale(8),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0), 10, 10) }),
    k.body(),
    k.pos(posVec2),
    "player",
    {
      direction: k.vec2(0, 0),
      directionName: "walk-down",
      isIdle: true
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
      player.paused 
    ) {
      if (!player.paused) {
          // Force Idle if blocked
          try { player.play("idle"); } catch(e) {}
      }
      return;
    }

    // Calculate Direction (Mouse or Keys)
    player.direction = k.vec2(0, 0);
    
    // WASD / Arrow Keys Support
    if (k.isKeyDown("left") || k.isKeyDown("a")) player.direction.x = -1;
    if (k.isKeyDown("right") || k.isKeyDown("d")) player.direction.x = 1;
    if (k.isKeyDown("up") || k.isKeyDown("w")) player.direction.y = -1;
    if (k.isKeyDown("down") || k.isKeyDown("s")) player.direction.y = 1;

    // Mouse/Touch Support (overrides keys if active)
    if (isMouseDown) {
       const worldMousePos = k.toWorld(k.mousePos());
       // Prevent movement if clicking on UI
       const isHoveringGame = k.get("game-area").some((obj) => obj.isHovering()); 
       // (Note: game-area might not exist anymore, check removed for safety or needs adaptation)
       player.direction = worldMousePos.sub(player.pos).unit();
    }

    // IDLE CHECK
    if (player.direction.eq(k.vec2(0, 0))) {
      player.isIdle = true;
      // Try playing idle animation (specific or generic)
      const idleName = directionsMode === 8 ? `${player.directionName}-idle` : "idle";
      if (player.getCurAnim()?.name !== idleName) {
         try { player.play(idleName); } catch(e) { /* Silent fallback */ }
      }
      return;
    }
    
    player.isIdle = false;
    player.flipX = false; // Reset flip

    // --- DIRECTION LOGIC ---
    const x = player.direction.x;
    const y = player.direction.y;

    if (directionsMode === 8) {
      // 8 DIRECTIONS (Complex Logic)
      if (x > 0 && y > -0.5 && y < 0.5) player.directionName = "walk-right";
      else if (x < 0 && y > -0.5 && y < 0.5) player.directionName = "walk-left";
      else if (x < 0 && y < -0.8) player.directionName = "walk-up";
      else if (x < 0 && y > 0.8) player.directionName = "walk-down";
      else if (x < 0 && y > -0.8 && y < -0.5) player.directionName = "walk-left-up";
      else if (x < 0 && y > 0.5 && y < 0.8) player.directionName = "walk-left-down";
      else if (x > 0 && y < -0.5 && y > -0.8) player.directionName = "walk-right-up";
      else if (x > 0 && y > 0.5 && y < 0.8) player.directionName = "walk-right-down";
    } 
    else {
      // 4 DIRECTIONS (Cardinal Logic)
      // Determine dominant axis (moving more horizontally or vertically?)
      if (Math.abs(x) >= Math.abs(y)) {
         player.directionName = x > 0 ? "walk-right" : "walk-left";
      } else {
         player.directionName = y > 0 ? "walk-down" : "walk-up";
      }
    }

    // Play Animation
    if (player.getCurAnim()?.name !== player.directionName) {
      try {
        player.play(player.directionName);
      } catch (e) {
        // SMART FALLBACK:
        // If "walk-left" doesn't exist in JSON, try using "walk-right" and flip the sprite.
        if (player.directionName === "walk-left") {
             try { 
                 player.play("walk-right"); 
                 player.flipX = true; 
             } catch(ex) {}
        }
        // If "walk-side" (old convention) is used
        else if (player.directionName === "walk-right" || player.directionName === "walk-left") {
             try {
                 player.play("walk-side");
                 if (player.directionName === "walk-left") player.flipX = true;
             } catch(ex) {}
        }
      }
    }

    // Physics Movement
    if (player.direction.x && player.direction.y) {
      player.move(player.direction.scale(DIAGONAL_FACTOR * speed));
      return;
    }
    player.move(player.direction.scale(speed));
  });

  return player;
}