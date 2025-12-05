export default function makeIcon(k, parent, posVec2, imageData, subtitle, theme) {
  const icon = parent.add([
    k.sprite(imageData.name, {
      width: imageData.width,
      height: imageData.height,
    }),
    k.anchor("center"),
    k.pos(posVec2),
    k.opacity(0),
    k.offscreen({ hide: true, distance: 300 }),
  ]);

  const textColor = theme?.colors?.text || "#ffffff";

  const subtitleText = icon.add([
    k.text(subtitle, { font: "ibm-bold", size: 32 }),
    k.color(k.Color.fromHex(textColor)), 
    k.anchor("center"),
    k.pos(0, 100),
    k.opacity(0),
  ]);

  return [icon, subtitleText];
}