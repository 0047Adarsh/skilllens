import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    console.log("file" + file)
    const validTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
      "text/plain"
    ];
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Please upload a PDF, DOCX, or TXT file." 
      }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File size too large. Please upload a file smaller than 5MB." 
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
  const data = await pdfParse(buffer);
  
 

  const text = data.text;
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?(\d{10})/);
  const nameMatch = text
  .split("\n")
  .map(line => line.trim())
  .find(line => /^[A-Za-z\s.]{3,}$/.test(line) && line.split(" ").length >= 2);

const skillsStartRegex = /(technical\s+skills|core\s+skills|key\s+skills|skills|areas\s+of\s+expertise|professional\s+skills|expertise)/i;
const skillsStart = text.search(skillsStartRegex);

const stopSectionRegex = /(projects|project|experience|work\s+experience|employment\s+history|education|academic\s+background|certifications|courses|summary|profile|achievements|awards|publications|interests|hobbies)/i;

const remainingText = skillsStart !== -1 ? text.slice(skillsStart + 1) : "";
const stopMatch = remainingText.search(stopSectionRegex);

let skillsSection = "";
if (skillsStart !== -1) {
  if (stopMatch !== -1) {
    skillsSection = text.slice(skillsStart, skillsStart + stopMatch).trim();
  } else {
    skillsSection = text.slice(skillsStart).trim();
  }

  skillsSection = skillsSection
    .replace(/\n{2,}/g, "\n")     
    .replace(/•|\t|–|-|●/g, " ")   
    .replace(/:+/g, ": ")
    .replace(/\s{2,}/g, " ")   
    .trim();
}

let skills = [];
if (skillsSection) {
  const cleaned = skillsSection.replace(skillsStartRegex, "").trim();

  skills = cleaned
    .split(/[,;|\n]+/)
    .map(s => s.replace(/^[A-Z][a-z]+:/, "").trim()) 
    .filter(s => s.length > 1);
}


  return NextResponse.json({ text,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    name: nameMatch || null,
    skills
   });
} catch (err) {
  console.error("PDF Parse error details:", err);
  return NextResponse.json({ error: err.message }, { status: 500 });
}
  } catch (err: any) {
    console.error("File parse error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to parse file" },
      { status: 500 }
    );
  }
}
