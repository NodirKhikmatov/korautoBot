/** Reads a CSS variable as a resolved hex color for Telegram WebApp chrome APIs. */
export function getCssVariableHex(cssVariable: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const probe = document.createElement("div");
  probe.style.display = "none";
  probe.style.backgroundColor = `var(${cssVariable})`;
  document.body.appendChild(probe);

  const computed = getComputedStyle(probe).backgroundColor;
  document.body.removeChild(probe);

  return rgbStringToHex(computed);
}

function rgbStringToHex(rgb: string): string | undefined {
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return undefined;

  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);

  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
