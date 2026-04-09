import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const HF_MODEL = "LiheYoung/depth-anything-large-hf";

export async function POST(req: NextRequest) {
  const apiToken = process.env.HUGGINGFACE_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      { error: "HUGGINGFACE_API_TOKEN is not configured" },
      { status: 500 }
    );
  }

  let imageDataUrl: string;
  try {
    const body = await req.json();
    imageDataUrl = body.imageDataUrl;
    if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:")) {
      throw new Error("Invalid imageDataUrl");
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Decode base64 data URL to Blob
  const [header, base64] = imageDataUrl.split(",");
  const mimeMatch = header.match(/data:([^;]+)/);
  const mime = mimeMatch?.[1] ?? "image/jpeg";
  const binary = Buffer.from(base64, "base64");
  const blob = new Blob([binary], { type: mime });

  try {
    const hf = new HfInference(apiToken);

    // depth-estimation returns an image Blob (grayscale PNG depth map)
    const depthBlob = await hf.imageToImage({
      model: HF_MODEL,
      inputs: blob,
    });

    const depthBuffer = Buffer.from(await depthBlob.arrayBuffer());
    const depthDataUrl = `data:${depthBlob.type || "image/png"};base64,${depthBuffer.toString("base64")}`;

    return NextResponse.json({ depthDataUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Inference failed";
    console.error("[depth] HuggingFace error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
