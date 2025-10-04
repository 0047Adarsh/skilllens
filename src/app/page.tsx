"use client";

import { useState, useCallback } from "react";
import styles from "./page.module.css";
import Image from "next/image";

interface ParseResult {
  text: string;
  email?: string | null;
  phone?: string | null;
  skills?: string[];
  name?: string | null;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResult | null>(null);

  const handleFileChange = (selectedFile: File) => {
    const validTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
      "text/plain"
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please select a PDF, DOCX, or TXT file");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }
    
    try {
      setLoading(true);
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data?.error || "Failed to parse resume");
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Something went wrong during parsing");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setError(null);
    setResult(null);
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Image 
            src="https://ik.imagekit.io/adarsha/Portfolio/skilllens/skilllens%20logo.jpeg?updatedAt=1756303004878" 
            alt="SkillLens Logo" 
            width={40} 
            height={40} 
          />
          <span className={styles.brand}>SkillLens</span>
        </div>
        <ul className={styles.navLinks}>
          <li><a href="#features">Features</a></li>
          <li><a href="#howItWorks">How It Works</a></li>
          <li><a href="#about">About</a></li>
        </ul>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            Extract skills from resumes
            <span className={styles.gradientText}> instantly</span>
          </h1>
          <p>
            Upload a resume to get structured insights like contact details and a
            curated skill list powered by modern parsing.
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.primaryCta} href="#upload">Get Started</a>
            <a className={styles.secondaryCta} href="#features">See Features</a>
          </div>
        </div>
        <div className={styles.heroGlow} />
      </header>

      <form id="upload" onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Upload Resume</h2>
          <span className={styles.badge}>PDF, DOCX, or TXT (Max 5MB)</span>
        </div>
        
        <div 
          className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''} ${file ? styles.hasFile : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          {file ? (
            <div className={styles.fileInfo}>
              <div className={styles.fileIcon}>📄</div>
              <div className={styles.fileDetails}>
                <div className={styles.fileName}>{file.name}</div>
                <div className={styles.fileSize}>{(file.size / 1024).toFixed(2)} KB</div>
              </div>
              <button 
                type="button" 
                className={styles.changeFileButton}
                onClick={handleReset}
              >
                Change File
              </button>
            </div>
          ) : (
            <>
              <div className={styles.uploadIcon}>📁</div>
              <div className={styles.uploadText}>
                <p>Drag & drop your resume here</p>
                <span>or</span>
              </div>
              <label htmlFor="resume" className={styles.browseButton}>
                Browse files
              </label>
              <input
                className={styles.fileInput}
                id="resume"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={onFileInputChange}
              />
            </>
          )}
        </div>
        
        <button 
          className={styles.submitButton} 
          type="submit" 
          disabled={loading || !file}
        >
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Parsing...
            </>
          ) : "Upload & Parse"}
        </button>
      </form>

      {error && (
        <div className={styles.errorCard}>
          <div className={styles.cardHeader}>
            <h3>Error</h3>
          </div>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {result && (
        <section className={styles.results}>
          <div className={styles.sectionHeader}>
            <h2>Parsed Results</h2>
            <button 
              type="button" 
              className={styles.resetButton}
              onClick={handleReset}
            >
              Parse Another Resume
            </button>
          </div>
          
          <div className={styles.resultGrid}>
            <div className={styles.resultCard}>
              <div className={styles.cardIcon}>📧</div>
              <div>
                <div className={styles.muted}>Email</div>
                <div className={styles.resultValue}>{result.email || "—"}</div>
              </div>
            </div>
            
            <div className={styles.resultCard}>
              <div className={styles.cardIcon}>📞</div>
              <div>
                <div className={styles.muted}>Phone</div>
                <div className={styles.resultValue}>{result.phone || "—"}</div>
              </div>
            </div>
            
            <div className={styles.resultCard}>
              <div className={styles.cardIcon}>👤</div>
              <div>
                <div className={styles.muted}>Name</div>
                <div className={styles.resultValue}>{result.name || "—"}</div>
              </div>
            </div>
            
            <div className={`${styles.resultCard} ${styles.resultSkills}`}>
              <div className={styles.cardIcon}>🛠️</div>
              <div>
                <div className={styles.muted}>Skills</div>
                <div className={styles.skillChips}>
                  {(result.skills && result.skills.length > 0) ? (
                    result.skills.map((s) => (
                      <span key={s} className={styles.skillChip}>{s}</span>
                    ))
                  ) : (
                    <span className={styles.muted}>—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <details className={styles.rawText}>
            <summary>View Extracted Text</summary>
            <pre>{result.name}</pre>
          </details>
        </section>
      )}

      <section id="features" className={styles.features}>
        <h2>Features</h2>
        <ul className={styles.featureGrid}>
          <li>
            <div className={styles.featureIcon}>⬆️</div>
            <div className={styles.featureTitle}>Upload PDF/DOCX</div>
            <div className={styles.featureText}>Drag and drop or browse files securely.</div>
          </li>
          <li>
            <div className={styles.featureIcon}>🔎</div>
            <div className={styles.featureTitle}>Extract Key Details</div>
            <div className={styles.featureText}>Name, email, phone, and skills in seconds.</div>
          </li>
          <li>
            <div className={styles.featureIcon}>📦</div>
            <div className={styles.featureTitle}>Structured Output</div>
            <div className={styles.featureText}>Save or export clean, structured data.</div>
          </li>
          <li>
            <div className={styles.featureIcon}>🤖</div>
            <div className={styles.featureTitle}>AI Parsing (soon)</div>
            <div className={styles.featureText}>Better skill recognition and clustering.</div>
          </li>
        </ul>
      </section>

      <section id="howItWorks" className={styles.howItWorks}>
        <h2>How It Works</h2>
        <ol className={styles.steps}>
          <li><span>1</span> Upload your resume</li>
          <li><span>2</span> We extract key details</li>
          <li><span>3</span> View and export results</li>
        </ol>
      </section>

      <section id="about" className={styles.about}>
        <h2>About</h2>
        <p>
          SkillLens helps recruiters and candidates quickly analyze resumes to
          surface relevant skills and contact information with a delightful UI.
        </p>
      </section>

      <footer className={styles.footer}>
        <p>© 2025 SkillLens. Built with Next.js.</p>
      </footer>
    </div>
  );
}