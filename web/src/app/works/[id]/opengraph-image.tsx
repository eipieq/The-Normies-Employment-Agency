import { ImageResponse } from "next/og";
import { loadFeatures } from "@/lib/normies";
import { getPersona } from "@/lib/persona";
import { pixelsToDataUrl } from "@/components/normie-portrait";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

export default async function OgImage({ params }: Props) {
  const { id } = await params;
  const tokenId = parseInt(id);
  if (isNaN(tokenId)) return new Response("not found", { status: 404 });

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const [interMedium, interRegular, wordmarkData] = await Promise.all([
    fetch("https://fonts.bunny.net/inter/files/inter-latin-500-normal.woff").then((r) =>
      r.arrayBuffer()
    ),
    fetch("https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff").then((r) =>
      r.arrayBuffer()
    ),
    fetch(`${baseUrl}/agency-wordmark.png`).then((r) => r.arrayBuffer()),
  ]);

  const wordmarkUrl = `data:image/png;base64,${Buffer.from(wordmarkData).toString("base64")}`;

  const features = await loadFeatures(tokenId);
  const persona = await getPersona(tokenId, features);
  const portraitUrl = pixelsToDataUrl(features.pixels);

  const idLabel = `#${String(tokenId).padStart(4, "0")}`;
  const categoryLabel = features.archetype.category;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#f5f5f5",
          display: "flex",
          fontFamily: "Inter",
        }}
      >
        {/* portrait panel */}
        <div
          style={{
            width: 460,
            height: 630,
            background: "#e8e8e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portraitUrl}
            width={320}
            height={320}
            style={{ imageRendering: "pixelated" }}
            alt=""
          />
        </div>

        {/* content panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 56px",
          }}
        >
          {/* wordmark */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wordmarkUrl} alt="the normies employment agency" style={{ height: 22, width: "auto", opacity: 0.35 }} />

          {/* job title + one-liner */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 52,
                fontWeight: 500,
                color: "#171717",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {persona.jobTitle}
            </div>
            <div
              style={{
                fontSize: 20,
                color: "#737373",
                lineHeight: 1.5,
                letterSpacing: "-0.01em",
              }}
            >
              {persona.oneLiner}
            </div>
          </div>

          {/* bottom row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 15,
                  color: "#a3a3a3",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                }}
              >
                {idLabel}
              </span>
              <span style={{ color: "#d4d4d4", fontSize: 15 }}>·</span>
              <span style={{ fontSize: 15, color: "#a3a3a3" }}>
                {categoryLabel}
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#d4d4d4",
                letterSpacing: "-0.01em",
              }}
            >
              normie works
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interMedium, style: "normal", weight: 500 },
        { name: "Inter", data: interRegular, style: "normal", weight: 400 },
      ],
    }
  );
}
