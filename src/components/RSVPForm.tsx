"use client";

import { useState, FormEvent } from "react";

interface FormData {
  name: string;
  attending: string; // "yes" | "no" | ""
  numberOfAttendees: number;
  message: string;
}

interface FormErrors {
  name?: string;
  attending?: string;
  numberOfAttendees?: string;
  message?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Vui lòng nhập tên của bạn";
  } else if (data.name.trim().length > 100) {
    errors.name = "Tên không được quá 100 ký tự";
  }

  if (!data.attending) {
    errors.attending = "Vui lòng xác nhận tham dự";
  }

  if (data.attending === "yes") {
    if (data.numberOfAttendees < 1 || data.numberOfAttendees > 10) {
      errors.numberOfAttendees = "Số người tham dự phải từ 1 đến 10";
    }
  }

  if (data.message.length > 500) {
    errors.message = "Lời nhắn không được quá 500 ký tự";
  }

  return errors;
}

export default function RSVPForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    attending: "",
    numberOfAttendees: 1,
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitResult(null);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const body = {
        name: formData.name.trim(),
        attending: formData.attending === "yes",
        ...(formData.attending === "yes" && {
          numberOfAttendees: formData.numberOfAttendees,
        }),
        ...(formData.message.trim() && { message: formData.message.trim() }),
      };

      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        );
      }

      setSubmitResult({
        type: "success",
        message: "Cảm ơn bạn đã xác nhận tham dự!",
      });
      setTimeout(() => setSubmitResult(null), 3000);
      setFormData({ name: "", attending: "", numberOfAttendees: 1, message: "" });
      setErrors({});
    } catch (err) {
      setSubmitResult({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6" noValidate>
      {submitResult && (
        <div
          role="alert"
          className={`p-4 rounded-lg text-sm ${
            submitResult.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {submitResult.message}
        </div>
      )}

      {/* Name field */}
      <div>
        <label htmlFor="rsvp-name" className="block text-sm font-vintage tracking-wide text-vintage-ink/70 mb-1">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          id="rsvp-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-transparent ${
            errors.name ? "border-red-500" : "border-vintage-ink/20"
          }`}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "rsvp-name-error" : undefined}
        />

        {errors.name && (
          <p id="rsvp-name-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Attending radio */}
      <fieldset>
        <legend className="block text-sm font-vintage tracking-wide text-vintage-ink/70 mb-2">
          Bạn có tham dự không? <span className="text-red-500">*</span>
        </legend>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="attending"
              value="yes"
              checked={formData.attending === "yes"}
              onChange={(e) => setFormData({ ...formData, attending: e.target.value })}
              className="text-gold focus:ring-gold/50"
            />
            <span className="font-vintage text-sm">Có, tôi sẽ tham dự</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="attending"
              value="no"
              checked={formData.attending === "no"}
              onChange={(e) => setFormData({ ...formData, attending: e.target.value })}
              className="text-gold focus:ring-gold/50"
            />
            <span className="font-vintage text-sm">Không thể tham dự</span>
          </label>
        </div>
        {errors.attending && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.attending}
          </p>
        )}
      </fieldset>

      {/* Number of attendees - shown only when attending */}
      {formData.attending === "yes" && (
        <div>
          <label htmlFor="rsvp-attendees" className="block text-sm font-vintage tracking-wide text-vintage-ink/70 mb-1">
            Số người tham dự
          </label>
          <select
            id="rsvp-attendees"
            value={formData.numberOfAttendees}
            onChange={(e) =>
              setFormData({ ...formData, numberOfAttendees: parseInt(e.target.value, 10) })
            }
            className="w-full px-4 py-2 border border-vintage-ink/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-transparent"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message textarea */}
      <div>
        <label htmlFor="rsvp-message" className="block text-sm font-vintage tracking-wide text-vintage-ink/70 mb-1">
          Lời nhắn
        </label>
        <textarea
          id="rsvp-message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-transparent resize-none ${
            errors.message ? "border-red-500" : "border-vintage-ink/20"
          }`}
        />
        {errors.message && (
          <p id="rsvp-message-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-6 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: submitting ? '#B08D4F' : '#C9A96E' }}
        onMouseEnter={(e) => { if (!submitting) (e.target as HTMLButtonElement).style.backgroundColor = '#B08D4F'; }}
        onMouseLeave={(e) => { if (!submitting) (e.target as HTMLButtonElement).style.backgroundColor = '#C9A96E'; }}
      >
        {submitting ? "Đang gửi..." : "Gửi Xác Nhận"}
      </button>
    </form>
  );
}
