import { PALETTE } from "../constants";

export default function makeSection(
  k, 
  posVec2, 
  title, 
  iconSymbol,
  colorHex, 
  onCollide = null, 
  triggerOnce = true 
) {
  
  // Default background color
  const bgHex = "#0b0c15"; 

  const section = k.add([
    k.rect(160, 160, { radius: 16 }),
    k.anchor("center"),
    k.area(), 
    k.pos(posVec2),
    
    k.color(k.Color.fromHex(bgHex)), 
    k.opacity(0.8),
    k.outline(4, k.Color.fromHex(colorHex)),

    title, // Tag for debugging
    "portal_button"
  ]);

  // Icon Center
  section.add([
    k.text(iconSymbol, { font: "ibm-bold", size: 80 }),
    k.anchor("center"),
    k.color(k.Color.fromHex(colorHex)),
    k.opacity(0.25), 
    k.pos(0, -10),
  ]);

  // Title Bottom
  section.add([
    k.text(title, { font: "ibm-bold", size: 24 }),
    k.color(k.Color.WHITE), 
    k.anchor("center"),
    k.pos(0, 110),
  ]);

  // Animations
  section.onUpdate(() => {
    const t = k.time() * 3;
    section.opacity = 0.8 + Math.sin(t) * 0.1; 
  });

  section.onHover(() => {
    k.setCursor("pointer");
    section.use(k.scale(1.1));
    section.color = k.Color.fromHex(colorHex); 
    section.opacity = 0.2; 
  });

  section.onHoverEnd(() => {
    k.setCursor("default");
    section.use(k.scale(1)); 
    section.color = k.Color.fromHex(bgHex); 
    section.opacity = 0.8;
  });

  // Collision Logic with Cooldown Fix
  let isCooldown = false; 

  if (onCollide) {
    const onCollideHandler = section.onCollide("player", () => {
      if (isCooldown) return;

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
        isCooldown = false; // Reset cooldown only on real exit
      }
    });
  }

  return section;
}