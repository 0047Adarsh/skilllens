// src/app/api/parse/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // get file from form-data
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // dynamically import pdf-parse
    const pdfModule = await import("pdf-parse");
    const pdfParse = pdfModule.default || pdfModule;

    // parse pdf
    const data = await pdfParse(buffer);

    return NextResponse.json({
      fileName: file.name,
      text: data.text,
    });
  } catch (err: any) {
    console.error("PDF parse error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to parse PDF" },
      { status: 500 }
    );
  }
}
