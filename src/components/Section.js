import { PALETTE } from "../constants";

export default function makeSection(
  k, 
  posVec2, 
  sectionName, 
  onCollide = null, 
  theme,
  triggerOnce = true 
) {
  
  // 1. Fallback colors
  const colors = theme?.colors || {
    primary: "#2de2e6",
    secondary: "#ff0055",
    tertiary: "#f9f871",
    quaternary: "#bd93f9",
    background: "#0b0c15",
    text: "#ffffff"
  };

  let iconSymbol = "●"; 
  let neonColor = colors.primary; 

  // 2. Dynamic theme logic
  if (sectionName.toLowerCase().includes("skills")) {
    iconSymbol = "</>";
    neonColor = colors.secondary; 
  } else if (sectionName.toLowerCase().includes("experience")) {
    iconSymbol = "💼"; 
    neonColor = colors.primary; 
  } else if (sectionName.toLowerCase().includes("projects")) {
    iconSymbol = "🚀"; 
    neonColor = colors.tertiary; 
  } else if (sectionName.toLowerCase().includes("about")) {
    iconSymbol = "☺"; 
    neonColor = colors.quaternary; 
  }

  const section = k.add([
    k.rect(160, 160, { radius: 16 }),
    k.anchor("center"),
    k.area(), // Necessary for collisions
    k.pos(posVec2),
    
    // 3. Apply theme colors
    k.color(k.Color.fromHex(colors.background)), 
    k.opacity(0.8),
    k.outline(4, k.Color.fromHex(neonColor)),

    sectionName,
    "portal_button"
  ]);

  section.add([
    k.text(iconSymbol, { font: "ibm-bold", size: 80 }),
    k.anchor("center"),
    k.color(k.Color.fromHex(neonColor)),
    k.opacity(0.25), 
    k.pos(0, -10),
  ]);

  section.add([
    k.text(sectionName, { font: "ibm-bold", size: 24 }),
    k.color(k.Color.fromHex(colors.text)), 
    k.anchor("center"),
    k.pos(0, 110),
  ]);

  section.onUpdate(() => {
    const t = k.time() * 3;
    section.opacity = 0.8 + Math.sin(t) * 0.1; 
  });

  section.onHover(() => {
    k.setCursor("pointer");
    section.use(k.scale(1.1));
    section.color = k.Color.fromHex(neonColor); 
    section.opacity = 0.2; 
  });

  section.onHoverEnd(() => {
    k.setCursor("default");
    section.use(k.scale(1)); 
    section.color = k.Color.fromHex(colors.background); 
    section.opacity = 0.8;
  });

  // --- ROBUST COLLISION LOGIC ---
  let isCooldown = false; // Flag to prevent multi-triggering

  if (onCollide) {
    // 1. TRIGGER ON ENTER
    const onCollideHandler = section.onCollide("player", () => {
      // If already active (cooldown), do nothing
      if (isCooldown) return;

      onCollide(section);
      
      if (triggerOnce) {
        // For static content (Projects), disable forever
        onCollideHandler.cancel(); 
      } else {
        // For Modals: Activate cooldown immediately.
        // The portal will NOT trigger again until you leave the area.
        isCooldown = true;
      }
    });

    // 2. RESET ON EXIT
    // If the player is paused (because a modal opened), Kaplay might trigger onCollideEnd incorrectly.
    // We only reset cooldown if the player is active and actually walking away.
    section.onCollideEnd("player", (p) => {
      if (p && p.paused) return; // Ignore fake exit due to pause

      if (!triggerOnce) {
        isCooldown = false; // Re-arm the portal only on real exit
      }
    });
  }

  return section;
}