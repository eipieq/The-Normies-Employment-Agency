// renders a normie's 40x40 pixel bitmap as a crisp SVG.
// each '1' in the 1600-char string is one dark pixel.

type Props = {
  pixels: string;
  size?: number;
  className?: string;
};

export function NormiePortrait({ pixels, size = 200, className }: Props) {
  const rects: React.ReactElement[] = [];
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i] === "1") {
      rects.push(
        <rect
          key={i}
          x={i % 40}
          y={Math.floor(i / 40)}
          width={1}
          height={1}
          fill="#48494b"
        />
      );
    }
  }

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      style={{ imageRendering: "pixelated" }}
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" fill="#e3e5e4" />
      {rects}
    </svg>
  );
}

// returns an svg data url — used by next/og which can't render react components directly.
export function pixelsToDataUrl(pixels: string): string {
  const rects = [];
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i] === "1") {
      rects.push(
        `<rect x="${i % 40}" y="${Math.floor(i / 40)}" width="1" height="1" fill="#48494b"/>`
      );
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" shape-rendering="crispEdges"><rect width="40" height="40" fill="#e3e5e4"/>${rects.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
