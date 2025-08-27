import { NextRequest } from "next/server";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs";

type ParseResponse = {
  text: string;
  email?: string | null;
  phone?: string | null;
  skills?: string[];
};

function extractFieldsFromText(text: string): Omit<ParseResponse, "text"> {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text
    .replace(/\s+/g, " ")
    .match(/(?:\+?\d[\s-]?)?(?:\(\d{2,4}\)[\s-]?)?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{0,4}/);

  const canonicalSkills = [
    "javascript","typescript","react","next.js","node.js","express","graphql","rest",
    "python","django","flask","pandas","numpy","scikit-learn","tensorflow","pytorch",
    "java","spring","kotlin","android","swift","ios","flutter","dart",
    "aws","gcp","azure","docker","kubernetes","terraform","sql","postgresql","mysql",
    "mongodb","redis","git","github","html","css","tailwind","sass","jest","cypress"
  ];
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const s of canonicalSkills) {
    const token = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(`(^|[^a-z])${token}([^a-z]|$)`, "i");
    if (rx.test(lower)) {
      found.add(s);
    }
  }

  const skills = Array.from(found).sort((a, b) => a.localeCompare(b));
  return { email: emailMatch?.[0] ?? null, phone: phoneMatch?.[0] ?? null, skills };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = file.type || "";
    const name = file.name || "upload";

    let text = "";
    if (mime.includes("pdf") || name.toLowerCase().endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      text = data.text || "";
    } else if (mime.includes("word") || name.toLowerCase().endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } else if (mime.startsWith("text/") || name.toLowerCase().endsWith(".txt")) {
      text = buffer.toString("utf8");
    } else {
      return Response.json({ error: "Unsupported file type. Use PDF or DOCX." }, { status: 415 });
    }

    const clean = text.replace(/\u0000/g, " ").replace(/\s+/g, " ").trim();
    const fields = extractFieldsFromText(clean);
    const payload: ParseResponse = { text: clean, ...fields };
    return Response.json(payload);
  } catch (err: any) {
    return Response.json({ error: err?.message || "Failed to parse file" }, { status: 500 });
  }
}


