import { ImageResponse } from "next/og";
import { getCollection, parseTokenId } from "@/lib/collections";
import { loadWorks } from "@/lib/load-works";
import { pixelsToDataUrl } from "@/components/normie-portrait";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ collection: string; id: string }> };

export default async function OgImage({ params }: Props) {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null) return new Response("not found", { status: 404 });

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  let data: Awaited<ReturnType<typeof loadWorks>>;
  try {
    data = await loadWorks(adapter.meta.slug, tokenId);
  } catch {
    return new Response("not found", { status: 404 });
  }

  const { dossier, persona } = data;

  const [interMedium, interRegular, wordmarkData] = await Promise.all([
    fetch("https://fonts.bunny.net/inter/files/inter-latin-500-normal.woff").then((r) =>
      r.arrayBuffer(),
    ),
    fetch("https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff").then((r) =>
      r.arrayBuffer(),
    ),
    fetch(`${baseUrl}/agency-wordmark.png`)
      .then((r) => r.arrayBuffer())
      .catch(() => null),
  ]);

  const wordmarkUrl = wordmarkData
    ? `data:image/png;base64,${Buffer.from(wordmarkData).toString("base64")}`
    : null;

  // resolve portrait — pixels for normies, remote image URL for others
  let portraitUrl: string;
  if (dossier.portrait.kind === "pixels") {
    portraitUrl = pixelsToDataUrl(dossier.portrait.pixels);
  } else {
    portraitUrl = dossier.portrait.src;
  }

  const idLabel = `${adapter.meta.label} #${String(tokenId).padStart(4, "0")}`;

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
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portraitUrl}
            width={dossier.portrait.kind === "pixels" ? 320 : 460}
            height={dossier.portrait.kind === "pixels" ? 320 : 630}
            style={{
              imageRendering: dossier.portrait.kind === "pixels" ? "pixelated" : "auto",
              objectFit: "cover",
            }}
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
          {/* wordmark or fallback */}
          {wordmarkUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={wordmarkUrl}
              alt="the employment agency"
              style={{ height: 22, width: "auto", opacity: 0.35 }}
            />
          ) : (
            <span style={{ fontSize: 13, color: "#d4d4d4", letterSpacing: "-0.01em" }}>
              the employment agency
            </span>
          )}

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
            <span style={{ fontSize: 15, color: "#a3a3a3", fontWeight: 500 }}>
              {idLabel}
            </span>
            <span style={{ fontSize: 13, color: "#d4d4d4", letterSpacing: "-0.01em" }}>
              on file
            </span>
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
    },
  );
}
