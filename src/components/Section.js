import { PALETTE } from "../constants";
import { addTeleportEffect } from "./sectionUtils";

export default function makeSection(
  k, 
  posVec2, 
  title, 
  iconSymbol, 
  colorHex,   
  onCollide = null, 
  triggerOnce = true 
) {
  
  // Derived colors for 3D effect
  const mainColor = k.Color.fromHex(colorHex);
  const darkColor = k.Color.fromHex(colorHex).darken(100);
  const glowColor = k.Color.fromHex(colorHex);

  // 1. MAIN CONTAINER
  const section = k.add([
    k.pos(posVec2.x, posVec2.y), 
    k.circle(70), // Base shape for collision area
    k.color(0, 0, 0, 0), // Fully transparent
    k.area(), // Auto-generates hitbox based on k.circle
    k.anchor("center"),
    title, 
    "portal_button"
  ]);

  // 2. TELEPORT EFFECT (Ripples under the button)
  addTeleportEffect(k, section, glowColor);

  // 3. BUTTON BASE (Dark body giving 3D height)
  const btnBase = section.add([
    k.circle(70),
    k.color(darkColor),
    k.anchor("center"),
    k.pos(0, 10), // Shifted down for depth
    k.opacity(1)
  ]);

  // 4. BUTTON SURFACE (The colored top part)
  const btnTop = section.add([
    k.circle(70),
    k.color(0, 0, 0), // Black background
    k.outline(6, mainColor), // Thick colored border
    k.anchor("center"),
    k.pos(0, 0), // Initial position (raised)
    k.opacity(1)
  ]);

  // Glass-like semi-transparent fill
  btnTop.add([
    k.circle(64),
    k.color(mainColor),
    k.opacity(0.15),
    k.anchor("center"),
  ]);

  // 5. CENTER ICON
  btnTop.add([
    k.text(iconSymbol, { font: "ibm-bold", size: 60 }),
    k.anchor("center"),
    k.color(mainColor),
    k.opacity(0.9), 
  ]);

  // 6. TITLE 
  section.add([
    k.text(title, { font: "ibm-bold", size: 20 }),
    k.color(k.Color.WHITE), 
    k.anchor("center"),
    k.pos(0, 100), 
    k.opacity(0.8)
  ]);

  // --- FLOATING ANIMATION ---
  // This makes the whole button gently breathe/wave
  section.onUpdate(() => {
    const t = k.time() * 3;
    // Slight scale variation to feel alive
    section.scale = k.vec2(1 + Math.sin(t) * 0.02);
  });

  // --- MOUSE INTERACTION (Hover = Button Press) ---
  section.onHover(() => {
    k.setCursor("pointer");
    // Visually press the button by moving the top part down
    btnTop.pos.y = 5; 
    btnTop.color = k.Color.fromHex("#1a1a1a"); // Slightly lighter on hover
    // Increase ripple intensity
    section.get("teleport_effect").forEach(r => r.opacity = 1);
  });

  section.onHoverEnd(() => {
    k.setCursor("default");
    // Release button (moves back up)
    btnTop.pos.y = 0;
    btnTop.color = k.Color.BLACK;
  });

  // --- COLLISION LOGIC ---
  let isCooldown = false; 
  
  if (onCollide) {
    const onCollideHandler = section.onCollide("player", () => {
      if (isCooldown) return;
      
      // Visual feedback: press button when player walks on it
      btnTop.pos.y = 8;
      k.wait(0.2, () => btnTop.pos.y = 0); // Release after a moment

      onCollide(section);
      
      if (triggerOnce) {
        onCollideHandler.cancel(); 
      } else {
        isCooldown = true;
      }
    });

    section.onCollideEnd("player", (p) => {
      if (p && p.paused) return; 
      if (!triggerOnce) {
        isCooldown = false; 
      }
    });
  }

  return section;
}