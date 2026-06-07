import { useState } from "react";
import type { AssignmentInput } from "@studyflow/shared";

export interface AssignmentFormProps {
  onSubmit: (data: AssignmentInput) => void;
  isLoading: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
}

function isPastDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + "T00:00:00") < today;
}

export function AssignmentForm({ onSubmit, isLoading }: AssignmentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function validateDueDate(v: string) {
    if (!v?.trim()) return "Due date is required.";
    if (isPastDate(v)) return "Due date must be today or in the future.";
  }

  function validate(v: { title: string; description: string; dueDate: string }): FormErrors {
    const e: FormErrors = {};
    if (!v.title.trim()) e.title = "Title is required.";
    if (!v.description.trim()) e.description = "Description is required.";
    const de = validateDueDate(v.dueDate);
    if (de) e.dueDate = de;
    return e;
  }

  function handleDueDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDueDate(e.target.value);
    setErrors(prev => ({ ...prev, dueDate: validateDueDate(e.target.value) }));
  }

  function handleDueDateBlur(e: React.FocusEvent<HTMLInputElement>) {
    setErrors(prev => ({ ...prev, dueDate: validateDueDate(e.target.value) }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate({ title, description, dueDate });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({ title, description, dueDate });
  }

  const inputBase = "w-full rounded-lg border px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";
  const inputNormal = "border-slate-200 bg-white";
  const inputError  = "border-red-400 bg-red-50";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Assignment details form"
      className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm"
    >
      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="assignment-title" className="block text-sm font-medium text-slate-700">
          Assignment Title
        </label>
        <input
          id="assignment-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={255}
          placeholder="e.g. History essay on World War II"
          aria-describedby={errors.title ? "title-error" : undefined}
          aria-invalid={!!errors.title}
          className={`${inputBase} ${errors.title ? inputError : inputNormal}`}
        />
        {errors.title && (
          <p id="title-error" role="alert" className="text-xs text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="assignment-description" className="block text-sm font-medium text-slate-700">
          Assignment Description
        </label>
        <textarea
          id="assignment-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Describe your assignment in detail — include the topic, what you need to produce, and any specific requirements…"
          aria-describedby={errors.description ? "description-error" : undefined}
          aria-invalid={!!errors.description}
          className={`${inputBase} ${errors.description ? inputError : inputNormal} resize-y`}
        />
        {errors.description && (
          <p id="description-error" role="alert" className="text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Due Date */}
      <div className="space-y-1.5">
        <label htmlFor="assignment-due-date" className="block text-sm font-medium text-slate-700">
          Due Date
        </label>
        <input
          id="assignment-due-date"
          type="date"
          value={dueDate}
          onChange={handleDueDateChange}
          onBlur={handleDueDateBlur}
          aria-describedby={errors.dueDate ? "due-date-error" : undefined}
          aria-invalid={!!errors.dueDate}
          className={`${inputBase} ${errors.dueDate ? inputError : inputNormal} w-full sm:w-56`}
        />
        {errors.dueDate && (
          <p id="due-date-error" role="alert" className="text-xs text-red-600">{errors.dueDate}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        aria-label="Generate study plan"
        className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Generating…" : "Generate Study Plan"}
      </button>
    </form>
  );
}
