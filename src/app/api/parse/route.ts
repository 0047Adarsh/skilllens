// src/app/api/parse/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

// Common skills to look for in resumes
const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", 
  "Java", "HTML", "CSS", "SQL", "MongoDB", "PostgreSQL", "Git", "AWS",
  "Docker", "Kubernetes", "Agile", "Scrum", "REST", "GraphQL", "Express",
  "Vue", "Angular", "Svelte", "PHP", "Ruby", "Go", "Rust", "C++", "C#",
  "Swift", "Kotlin", "TensorFlow", "PyTorch", "Machine Learning", "AI",
  "Data Analysis", "Tableau", "Power BI", "Photoshop", "Figma", "UI/UX"
];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      console.error("[Parse API] ❌ No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(`[Parse API] 📂 Received file: ${file.name}, type: ${file.type}`);

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = "";
    
    // Try parsing PDF
    try {
      // Fix for pdf-parse test file issue - disable the test file loading
      const options = {
        // This prevents pdf-parse from trying to access its test files
        max: 0 // Set to 0 to disable
      };
      
      const data = await pdfParse(buffer, options);
      text = data.text;
    } catch (pdfErr: any) {
      console.error("[Parse API] ⚠️ PDF parsing error:", pdfErr.message);
      return NextResponse.json(
        { error: "Failed to parse PDF. Please ensure it's a valid PDF file.", details: pdfErr.message },
        { status: 500 }
      );
    }

    console.log(`[Parse API] ✅ Successfully parsed. Extracted ${text.length} characters`);

    // Extract information from text
    const email = extractEmail(text);
    const phone = extractPhone(text);
    const name = extractName(text);
    const skills = extractSkills(text);

    return NextResponse.json({
      fileName: file.name,
      text,
      email,
      phone,
      name,
      skills
    });
  } catch (err: any) {
    console.error("[Parse API] 🚨 Unexpected error:", err.message);
    return NextResponse.json(
      { error: "Unexpected server error", details: err.message },
      { status: 500 }
    );
  }
}

// Helper functions to extract information from text
function extractEmail(text: string): string | null {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  return emails ? emails[0] : null;
}

function extractPhone(text: string): string | null {
  const phoneRegex = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
  const phones = text.match(phoneRegex);
  return phones ? phones[0] : null;
}

function extractName(text: string): string | null {
  // Simple approach: look for words that might be a name at the beginning of the text
  const lines = text.split('\n');
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Check if this looks like a name (2-3 words, no special characters except maybe periods)
    if (/^[A-Za-z\.\s]{2,50}$/.test(firstLine) && firstLine.split(/\s+/).length <= 3) {
      return firstLine;
    }
  }
  return null;
}

function extractSkills(text: string): string[] {
  const foundSkills: string[] = [];
  const textLower = text.toLowerCase();
  
  COMMON_SKILLS.forEach(skill => {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
}