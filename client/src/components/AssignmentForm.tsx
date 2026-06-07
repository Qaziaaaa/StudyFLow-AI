import { useState, useRef } from "react";
import type { AssignmentInput } from "@studyflow/shared";

export interface AssignmentFormProps {
  onSubmit: (data: AssignmentInput) => void;
  isLoading: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
  file?: string;
}

const ASSIGNMENT_TYPES = ["Essay", "Report", "Presentation", "Coding Project", "Problem Set", "Research Paper", "Case Study", "Lab Report", "Other"];
const SUBJECTS = ["History", "English Literature", "Mathematics", "Computer Science", "Biology", "Chemistry", "Physics", "Economics", "Psychology", "Law", "Business", "Other"];

function isPastDate(d: string) {
  if (!d) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(d + "T00:00:00") < today;
}

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsArrayBuffer(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve((e.target?.result as string) ?? "");
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsText(file);
  });
}

async function extractPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
  const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(file) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => ("str" in item ? item.str : "")).join(" "));
  }
  return pages.join("\n\n");
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: await readAsArrayBuffer(file) });
  return result.value;
}

async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractPdf(file);
  if (name.endsWith(".docx") || name.endsWith(".doc")) return extractDocx(file);
  return readAsText(file);
}

export function AssignmentForm({ onSubmit, isLoading }: AssignmentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subject, setSubject] = useState("");
  const [assignmentType, setAssignmentType] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function validateDueDate(v: string) {
    if (!v?.trim()) return "Due date is required.";
    if (isPastDate(v)) return "Due date must be today or in the future.";
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim()) e.title = "Please enter your assignment title.";
    if (!description.trim()) e.description = "Please describe your assignment.";
    const de = validateDueDate(dueDate);
    if (de) e.dueDate = de;
    return e;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (![".pdf", ".docx", ".doc", ".txt", ".md"].includes(ext)) {
      setErrors(prev => ({ ...prev, file: "Supported: PDF, DOCX, DOC, TXT, MD" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: "File too large — max 10 MB" }));
      return;
    }
    setFileLoading(true);
    setErrors(prev => ({ ...prev, file: undefined }));
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) { setErrors(prev => ({ ...prev, file: "Could not extract text. Try copying it manually." })); return; }
      setDescription(text.trim().slice(0, 4000));
      setFileName(file.name);
    } catch { setErrors(prev => ({ ...prev, file: "Failed to read file — make sure it isn't password protected." })); }
    finally { setFileLoading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const data: AssignmentInput = { title: title.trim(), description: description.trim(), dueDate };
    if (subject) data.subject = subject;
    if (assignmentType) data.assignmentType = assignmentType;
    if (wordCount && Number(wordCount) > 0) data.wordCount = Number(wordCount);
    onSubmit(data);
  }

  const inputCls = (err?: string) =>
    `input-field${err ? " error" : ""}`;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Assignment details form" className="card-elevated overflow-hidden">

      {/* ── Card header ── */}
      <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Assignment Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">More detail = better plan</p>
          </div>
        </div>
      </div>

      {/* ── Fields ── */}
      <div className="px-6 py-5 space-y-5">

        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="assignment-title" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Assignment Title <span className="text-red-400 normal-case tracking-normal font-normal">*</span>
          </label>
          <input id="assignment-title" type="text" value={title}
            onChange={e => setTitle(e.target.value)} maxLength={255}
            placeholder="e.g. 500-word history essay on World War II"
            aria-invalid={!!errors.title} className={inputCls(errors.title)} />
          {errors.title && <p role="alert" className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.title}</p>}
        </div>

        {/* Description + upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="assignment-description" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              What's the assignment? <span className="text-red-400 normal-case tracking-normal font-normal">*</span>
            </label>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={fileLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors">
              {fileLoading
                ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg> Reading…</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload brief</>
              }
            </button>
          </div>

          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={handleFileChange} className="hidden" />

          {/* File types hint */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["PDF", "DOCX", "TXT"].map(f => (
              <span key={f} className="badge badge-neutral" style={{ fontSize: "0.6rem", padding: "2px 7px" }}>{f}</span>
            ))}
            <span className="text-xs text-slate-400">files accepted</span>
          </div>

          {/* File chip */}
          {fileName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#eef2ff", border: "1px solid #c7d2fe" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="text-xs font-medium text-indigo-700 truncate flex-1">{fileName}</span>
              <button type="button" onClick={() => { setFileName(null); setDescription(""); if (fileRef.current) fileRef.current.value = ""; }}
                className="text-slate-400 hover:text-red-500 transition-colors text-sm leading-none">✕</button>
            </div>
          )}
          {errors.file && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.file}</p>}

          <textarea id="assignment-description" value={description}
            onChange={e => setDescription(e.target.value)} maxLength={4000} rows={4}
            placeholder="Describe the assignment — topic, deliverable, word count, any specific requirements… (or upload a document above)"
            aria-invalid={!!errors.description}
            className={`${inputCls(errors.description)} resize-y`} />
          {errors.description && <p role="alert" className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.description}</p>}
        </div>

        {/* Due date */}
        <div className="space-y-1.5">
          <label htmlFor="assignment-due-date" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Due Date <span className="text-red-400 normal-case tracking-normal font-normal">*</span>
          </label>
          <input id="assignment-due-date" type="date" value={dueDate}
            onChange={e => { setDueDate(e.target.value); setErrors(prev => ({ ...prev, dueDate: validateDueDate(e.target.value) })); }}
            onBlur={e => setErrors(prev => ({ ...prev, dueDate: validateDueDate(e.target.value) }))}
            aria-invalid={!!errors.dueDate}
            className={`${inputCls(errors.dueDate)} max-w-[200px]`} />
          {errors.dueDate && <p role="alert" className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.dueDate}</p>}
        </div>
      </div>

      {/* ── Optional context ── */}
      <div className="px-6 py-4 space-y-3" style={{ background: "#fafbff", borderTop: "1px solid #f1f5f9" }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">More context</span>
          <span className="badge badge-neutral" style={{ fontSize: "0.6rem" }}>optional</span>
          <span className="text-xs text-slate-400">— helps generate a more specific plan</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label htmlFor="assignment-type" className="block text-xs text-slate-500 font-medium">Type</label>
            <select id="assignment-type" value={assignmentType} onChange={e => setAssignmentType(e.target.value)}
              className="input-field text-xs py-2">
              <option value="">Select…</option>
              {ASSIGNMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="assignment-subject" className="block text-xs text-slate-500 font-medium">Subject</label>
            <select id="assignment-subject" value={subject} onChange={e => setSubject(e.target.value)}
              className="input-field text-xs py-2">
              <option value="">Select…</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="word-count" className="block text-xs text-slate-500 font-medium">Word count</label>
            <input id="word-count" type="number" min={0} max={20000} value={wordCount}
              onChange={e => setWordCount(e.target.value)} placeholder="e.g. 500"
              className="input-field text-xs py-2" />
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="px-6 py-5" style={{ borderTop: "1px solid #f1f5f9" }}>
        <button type="submit" disabled={isLoading || fileLoading} aria-label="Generate study plan" className="btn-primary">
          {isLoading
            ? <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                Building your plan…
              </span>
            : <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Generate Study Plan
              </span>
          }
        </button>
      </div>
    </form>
  );
}
