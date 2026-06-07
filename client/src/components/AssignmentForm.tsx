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

/** Extract plain text from a plain-text or .md file */
async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve((e.target?.result as string) ?? "");
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}

export function AssignmentForm({ onSubmit, isLoading }: AssignmentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subject, setSubject] = useState("");
  const [assignmentType, setAssignmentType] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
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

    const allowedTypes = ["text/plain", "text/markdown", "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.some(t => file.type === t || file.name.endsWith(".txt") || file.name.endsWith(".md"))) {
      setErrors(prev => ({ ...prev, file: "Please upload a .txt, .md, or text-based file." }));
      return;
    }
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, file: "File is too large. Max 2MB." }));
      return;
    }

    try {
      const text = await extractTextFromFile(file);
      const truncated = text.slice(0, 3000); // cap to avoid token overflow
      setDescription(prev => {
        const prefix = prev.trim() ? prev.trim() + "\n\n--- From uploaded document ---\n" : "";
        return prefix + truncated;
      });
      setFileName(file.name);
      setErrors(prev => ({ ...prev, file: undefined }));
    } catch {
      setErrors(prev => ({ ...prev, file: "Could not read the file. Try copying the text manually." }));
    }
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
    `w-full rounded-lg border px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white
     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition
     ${err ? "border-red-400 bg-red-50" : "border-slate-200"}`;

  const selectCls = "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Assignment details form"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100"
    >
      {/* Section 1 — Required fields */}
      <div className="p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Assignment Details</h2>
          <p className="text-xs text-slate-400 mt-0.5">The more detail you give, the better your plan will be.</p>
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
          {errors.title && <p id="title-error" role="alert" className="text-xs text-red-600">{errors.title}</p>}
        </div>

        {/* Description + file upload */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="assignment-description" className="block text-sm font-medium text-slate-700">
              What does this assignment require? <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload brief
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.text"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload assignment brief"
          />
          {fileName && (
            <div className="flex items-center gap-2 text-xs text-brand-700 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="font-medium truncate">{fileName}</span>
              <button type="button" onClick={() => { setFileName(null); if (fileRef.current) fileRef.current.value = ""; }} className="ml-auto text-slate-400 hover:text-red-500">✕</button>
            </div>
          )}
          {errors.file && <p className="text-xs text-red-600">{errors.file}</p>}
          <textarea
            id="assignment-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={4000}
            rows={4}
            placeholder="Describe your assignment — topic, what you need to produce, word count, specific requirements, any constraints…"
            aria-describedby={errors.description ? "description-error" : undefined}
            aria-invalid={!!errors.description}
            className={`${inputCls(errors.description)} resize-y`}
          />
          {errors.description && <p id="description-error" role="alert" className="text-xs text-red-600">{errors.description}</p>}
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
            onChange={e => { setDueDate(e.target.value); setErrors(prev => ({ ...prev, dueDate: validateDueDate(e.target.value) })); }}
            onBlur={e => setErrors(prev => ({ ...prev, dueDate: validateDueDate(e.target.value) }))}
            aria-describedby={errors.dueDate ? "due-date-error" : undefined}
            aria-invalid={!!errors.dueDate}
            className={`${inputCls(errors.dueDate)} w-full sm:w-48`}
          />
          {errors.dueDate && <p id="due-date-error" role="alert" className="text-xs text-red-600">{errors.dueDate}</p>}
        </div>
      </div>

      {/* Section 2 — Optional context (collapsed visually but always shown) */}
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">More context <span className="text-slate-400 font-normal">(optional but helps a lot)</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Assignment Type */}
          <div className="space-y-1.5">
            <label htmlFor="assignment-type" className="block text-xs font-medium text-slate-600">Type</label>
            <select
              id="assignment-type"
              value={assignmentType}
              onChange={e => setAssignmentType(e.target.value)}
              className={selectCls}
            >
              <option value="">Select type…</option>
              {ASSIGNMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label htmlFor="assignment-subject" className="block text-xs font-medium text-slate-600">Subject</label>
            <select
              id="assignment-subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className={selectCls}
            >
              <option value="">Select subject…</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Word Count */}
          <div className="space-y-1.5">
            <label htmlFor="word-count" className="block text-xs font-medium text-slate-600">Word count (if writing)</label>
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

      {/* Submit */}
      <div className="p-6">
        <button
          type="submit"
          disabled={isLoading}
          aria-label="Generate study plan"
          className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Building your plan…" : "Generate Study Plan →"}
        </button>
      </div>
    </form>
  );
}
