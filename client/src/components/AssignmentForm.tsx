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

const ASSIGNMENT_TYPES = [
  "Essay", "Report", "Presentation", "Coding Project",
  "Problem Set", "Research Paper", "Case Study", "Lab Report", "Other",
];
const SUBJECTS = [
  "History", "English Literature", "Mathematics", "Computer Science",
  "Biology", "Chemistry", "Physics", "Economics", "Psychology",
  "Law", "Business", "Other",
];

function isPastDate(d: string) {
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(d + "T00:00:00") < today;
}

/** Read any file as an ArrayBuffer */
function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsArrayBuffer(file);
  });
}

/** Read plain-text files (txt, md) */
function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve((e.target?.result as string) ?? "");
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsText(file);
  });
}

/** Extract text from a PDF using pdfjs-dist */
async function extractPdf(file: File): Promise<string> {
  // Dynamic import so it's only loaded when needed
  const pdfjsLib = await import("pdfjs-dist");

  // pdfjs needs a worker — use the bundled one
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }
  return pages.join("\n\n");
}

/** Extract text from a DOCX using mammoth */
async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await readAsArrayBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/** Main dispatcher — picks parser based on file type */
async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (name.endsWith(".pdf") || type === "application/pdf") {
    return extractPdf(file);
  }
  if (
    name.endsWith(".docx") ||
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocx(file);
  }
  if (
    name.endsWith(".doc") ||
    type === "application/msword"
  ) {
    // mammoth handles .doc too, but with limited fidelity
    return extractDocx(file);
  }
  // Plain text / markdown
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

  function validate() {
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

    const maxSize = 10 * 1024 * 1024; // 10 MB
    const allowed = [".pdf", ".docx", ".doc", ".txt", ".md"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowed.includes(ext)) {
      setErrors(prev => ({ ...prev, file: "Supported formats: PDF, DOCX, DOC, TXT, MD" }));
      return;
    }
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, file: "File is too large. Max 10 MB." }));
      return;
    }

    setFileLoading(true);
    setErrors(prev => ({ ...prev, file: undefined }));

    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        setErrors(prev => ({ ...prev, file: "Couldn't extract text from this file. Try copying the text manually." }));
        return;
      }
      // Truncate to ~3000 chars to stay within token budget
      const truncated = text.trim().slice(0, 3000);
      setDescription(truncated);
      setFileName(file.name);
    } catch (err) {
      console.error("[FileExtract]", err);
      setErrors(prev => ({
        ...prev,
        file: "Failed to read the file. Make sure it's not password-protected, then try again.",
      }));
    } finally {
      setFileLoading(false);
      // Reset input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeFile() {
    setFileName(null);
    setDescription("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const data: AssignmentInput = {
      title: title.trim(),
      description: description.trim(),
      dueDate,
    };
    if (subject) data.subject = subject;
    if (assignmentType) data.assignmentType = assignmentType;
    if (wordCount && Number(wordCount) > 0) data.wordCount = Number(wordCount);
    onSubmit(data);
  }

  const inputCls = (err?: string) =>
    [
      "w-full rounded-lg border px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white",
      "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition",
      err ? "border-red-400 bg-red-50" : "border-slate-200",
    ].join(" ");

  const selectCls =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 " +
    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Assignment details form"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100"
    >
      {/* ── Section 1: Required ── */}
      <div className="p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Assignment Details</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            The more detail you give, the better your plan will be.
          </p>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="assignment-title" className="block text-sm font-medium text-slate-700">
            Assignment Title <span className="text-red-500">*</span>
          </label>
          <input
            id="assignment-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={255}
            placeholder="e.g. 500-word history essay on World War II"
            aria-describedby={errors.title ? "title-error" : undefined}
            aria-invalid={!!errors.title}
            className={inputCls(errors.title)}
          />
          {errors.title && (
            <p id="title-error" role="alert" className="text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description + upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="assignment-description" className="block text-sm font-medium text-slate-700">
              What does this assignment require? <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={fileLoading}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {fileLoading ? (
                <>
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                  </svg>
                  Reading file…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload brief
                </>
              )}
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload assignment document"
          />

          {/* Accepted formats hint */}
          <p className="text-xs text-slate-400">
            Accepts PDF, DOCX, DOC, TXT, MD — text will be extracted automatically
          </p>

          {/* File chip */}
          {fileName && (
            <div className="flex items-center gap-2 text-xs text-brand-700 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="font-medium truncate flex-1">{fileName}</span>
              <button
                type="button"
                onClick={removeFile}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Remove uploaded file"
              >
                ✕
              </button>
            </div>
          )}

          {errors.file && (
            <p className="text-xs text-red-600">{errors.file}</p>
          )}

          <textarea
            id="assignment-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={4000}
            rows={5}
            placeholder="Describe your assignment — topic, what you need to produce, word count, specific requirements… (or upload a document above)"
            aria-describedby={errors.description ? "description-error" : undefined}
            aria-invalid={!!errors.description}
            className={`${inputCls(errors.description)} resize-y`}
          />
          {errors.description && (
            <p id="description-error" role="alert" className="text-xs text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Due Date */}
        <div className="space-y-1.5">
          <label htmlFor="assignment-due-date" className="block text-sm font-medium text-slate-700">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            id="assignment-due-date"
            type="date"
            value={dueDate}
            onChange={e => {
              setDueDate(e.target.value);
              setErrors(prev => ({ ...prev, dueDate: validateDueDate(e.target.value) }));
            }}
            onBlur={e => setErrors(prev => ({ ...prev, dueDate: validateDueDate(e.target.value) }))}
            aria-describedby={errors.dueDate ? "due-date-error" : undefined}
            aria-invalid={!!errors.dueDate}
            className={`${inputCls(errors.dueDate)} w-full sm:w-48`}
          />
          {errors.dueDate && (
            <p id="due-date-error" role="alert" className="text-xs text-red-600">{errors.dueDate}</p>
          )}
        </div>
      </div>

      {/* ── Section 2: Optional context ── */}
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            More context{" "}
            <span className="text-slate-400 font-normal">(optional — helps generate a better plan)</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="assignment-type" className="block text-xs font-medium text-slate-600">
              Assignment Type
            </label>
            <select
              id="assignment-type"
              value={assignmentType}
              onChange={e => setAssignmentType(e.target.value)}
              className={selectCls}
            >
              <option value="">Select…</option>
              {ASSIGNMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="assignment-subject" className="block text-xs font-medium text-slate-600">
              Subject
            </label>
            <select
              id="assignment-subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className={selectCls}
            >
              <option value="">Select…</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="word-count" className="block text-xs font-medium text-slate-600">
              Word Count
            </label>
            <input
              id="word-count"
              type="number"
              min={0}
              max={20000}
              value={wordCount}
              onChange={e => setWordCount(e.target.value)}
              placeholder="e.g. 500"
              className={inputCls()}
            />
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="p-6">
        <button
          type="submit"
          disabled={isLoading || fileLoading}
          aria-label="Generate study plan"
          className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Building your plan…" : "Generate Study Plan →"}
        </button>
      </div>
    </form>
  );
}
