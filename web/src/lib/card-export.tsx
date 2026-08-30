import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import type { Portrait } from "./collections/types";

export const CARD_SIZE = { width: 1080, height: 1350 };

const ART_H = 780;
const PAD_X = 64;
const TEXT_W = CARD_SIZE.width - PAD_X * 2;

const INK = { r: 0x48, g: 0x49, b: 0x4b, a: 255 };
const PAPER = { r: 0xe3, g: 0xe5, b: 0xe4, a: 255 };

export function cardFilename(label: string, tokenId: number) {
  return `${label}-${String(tokenId).padStart(4, "0")}-card.png`;
}

export function titleFontSize(title: string) {
  if (title.length > 64) return 38;
  if (title.length > 48) return 44;
  if (title.length > 32) return 52;
  return 60;
}

export function linerFontSize(text: string) {
  if (text.length > 180) return 20;
  if (text.length > 120) return 22;
  return 24;
}

export async function pixelsToPngDataUrl(pixels: string, scale = 16): Promise<string> {
  const w = 40;
  const h = 40;
  const raw = Buffer.alloc(w * h * 4);
  const n = Math.min(pixels.length, w * h);
  for (let i = 0; i < n; i++) {
    const c = pixels[i] === "1" ? INK : PAPER;
    const o = i * 4;
    raw[o] = c.r;
    raw[o + 1] = c.g;
    raw[o + 2] = c.b;
    raw[o + 3] = c.a;
  }
  const png = await sharp(raw, { raw: { width: w, height: h, channels: 4 } })
    .resize(w * scale, h * scale, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function toCoverDataUrl(src: string): Promise<string> {
  if (src.startsWith("data:")) return src;
  const res = await fetch(src, { signal: AbortSignal.timeout(12_000) });
  if (!res.ok) throw new Error(`portrait fetch ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const png = await sharp(buf)
    .resize(CARD_SIZE.width, ART_H, { fit: "cover" })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function loadRemotePortrait(src: string): Promise<string> {
  const urls = [src];
  if (src.includes("/ipfs/")) {
    const path = src.split("/ipfs/")[1];
    urls.push(`https://dweb.link/ipfs/${path}`, `https://gateway.pinata.cloud/ipfs/${path}`);
  }
  let last: unknown;
  for (const url of urls) {
    try {
      return await toCoverDataUrl(url);
    } catch (e) {
      last = e;
    }
  }
  throw last instanceof Error ? last : new Error("portrait fetch failed");
}

async function loadWordmark(): Promise<string | null> {
  try {
    const svg = await readFile(join(process.cwd(), "public/agency-wordmark.svg"));
    const png = await sharp(svg).resize({ height: 40 }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

async function loadFonts() {
  const [jakarta600, jakarta500, jakarta400, geistMono] = await Promise.all([
    fetch("https://fonts.bunny.net/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff").then((r) =>
      r.arrayBuffer(),
    ),
    fetch("https://fonts.bunny.net/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.woff").then((r) =>
      r.arrayBuffer(),
    ),
    fetch("https://fonts.bunny.net/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff").then((r) =>
      r.arrayBuffer(),
    ),
    readFile(join(process.cwd(), "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf")),
  ]);

  return [
    { name: "Plus Jakarta Sans", data: jakarta600, weight: 600 as const, style: "normal" as const },
    { name: "Plus Jakarta Sans", data: jakarta500, weight: 500 as const, style: "normal" as const },
    { name: "Plus Jakarta Sans", data: jakarta400, weight: 400 as const, style: "normal" as const },
    { name: "Geist Mono", data: geistMono, weight: 400 as const, style: "normal" as const },
  ];
}

export async function resolvePortraitUrl(portrait: Portrait): Promise<{ src: string; kind: Portrait["kind"] }> {
  if (portrait.kind === "pixels") {
    return { src: await pixelsToPngDataUrl(portrait.pixels), kind: "pixels" };
  }
  return { src: await loadRemotePortrait(portrait.src), kind: "image" };
}

type CardInput = {
  portrait: Portrait;
  jobTitle: string;
  oneLiner: string;
  idLabel: string;
};

export async function renderEmploymentCard({
  portrait,
  jobTitle,
  oneLiner,
  idLabel,
}: CardInput): Promise<ImageResponse> {
  const [{ src, kind }, wordmark, fonts] = await Promise.all([
    resolvePortraitUrl(portrait),
    loadWordmark(),
    loadFonts(),
  ]);

  const liner = oneLiner.charAt(0).toUpperCase() + oneLiner.slice(1);
  const titlePx = titleFontSize(jobTitle);
  const linerPx = linerFontSize(liner);
  const pixelSize = 40 * 16;

  return new ImageResponse(
    (
      <div
        style={{
          width: CARD_SIZE.width,
          height: CARD_SIZE.height,
          background: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Plus Jakarta Sans",
        }}
      >
        <div
          style={{
            width: CARD_SIZE.width,
            height: ART_H,
            background: "#e8e8e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            width={kind === "pixels" ? pixelSize : CARD_SIZE.width}
            height={kind === "pixels" ? pixelSize : ART_H}
            alt=""
            style={{
              objectFit: kind === "pixels" ? "contain" : "cover",
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: `48px ${PAD_X}px 52px`,
          }}
        >
          {wordmark ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={wordmark} alt="" width={188} height={40} style={{ opacity: 0.28 }} />
          ) : (
            <span style={{ fontSize: 14, color: "#d4d4d4", letterSpacing: "-0.01em" }}>
              the employment agency
            </span>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 18, width: TEXT_W }}>
            <div
              style={{
                fontSize: titlePx,
                fontWeight: 600,
                color: "#171717",
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                width: TEXT_W,
              }}
            >
              {jobTitle}
            </div>
            <div
              style={{
                fontSize: linerPx,
                fontWeight: 500,
                color: "#737373",
                lineHeight: 1.45,
                letterSpacing: "-0.01em",
                width: TEXT_W,
              }}
            >
              {liner}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: TEXT_W,
            }}
          >
            <span
              style={{
                fontFamily: "Geist Mono",
                fontSize: 16,
                color: "#a3a3a3",
                letterSpacing: "-0.01em",
              }}
            >
              {idLabel}
            </span>
            <span style={{ fontSize: 14, color: "#d4d4d4", letterSpacing: "-0.01em" }}>on file</span>
          </div>
        </div>
      </div>
    ),
    {
      ...CARD_SIZE,
      fonts,
    },
  );
}
