
export async function makeAppear(k, gameObj) {
    await k.tween(
      gameObj.opacity,
      1,
      0.5,
      (val) => {
        gameObj.opacity = val;
        for (const child of gameObj.children) {
          child.opacity = gameObj.opacity;
        }
      },
      k.easings.linear
    );
  
    if (gameObj.opacityTrickleDown) gameObj.opacityTrickleDown.cancel();
  }
  
  // By default in Kaplay the opacity is not inherited from the parent.
  // It becomes tricky to change the opacity of indirect children.
  // This function makes sure the parent opacity's trickle down to indirect
  // children.
  export function opacityTrickleDown(parent, indirectChildren) {
    parent.opacityTrickleDown = parent.onUpdate(() => {
      for (const indirectChild of indirectChildren) {
        indirectChild.opacity = parent.opacity;
      }
    });
  }
// Helper for safe fetching
export const safeFetch = async (relativePath) => {
  const fullPath = resolvePath(relativePath);
  try {
    const response = await fetch(fullPath);
    if (!response.ok) throw new Error(`File missing: ${fullPath}`);
    return await response.json();
  } catch (e) {
    console.error(`JSON Error ${fullPath}:`, e);
    return {};
  }
};

// --- PATH HELPER ---

export const resolvePath = (path) => {
  const baseUrl = import.meta.env.BASE_URL;
  const cleanPath = path.replace(/^\.?\//, "");
  const safeBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${safeBase}${cleanPath}`;
};

