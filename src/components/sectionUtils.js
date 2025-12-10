
export function addTeleportEffect(k, parent, glowColor) {
    for (let i = 0; i < 2; i++) {
        const ripple = parent.add([
            k.circle(10),
            k.outline(4, glowColor),
            k.color(0, 0, 0, 0), // Transparent interior
            k.opacity(0.5),
            k.anchor("center"),
            k.z(-1), // Behind the button
            "teleport_effect"
        ]);

        // Ripple animation
        ripple.onUpdate(() => {
            const t = k.time() * 2 + (i * 1.5); // Time offset between rings
            const phase = t % 2; // Cycle between 0 and 2

            // Expansion
            ripple.scale = k.vec2(1 + phase * 2);
            // Fade out while expanding
            ripple.opacity = Math.max(0, 0.8 - (phase * 0.4));
            // Reset outline thickness to prevent it from getting too huge
            ripple.use(k.outline(4 / (1 + phase), glowColor));
        });
    }
}
