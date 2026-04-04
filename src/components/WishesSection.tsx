"use client";

import { useState, useRef, useCallback, FormEvent } from "react";

export interface Wish {
  _id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface FormErrors {
  name?: string;
  message?: string;
}

function validate(name: string, message: string): FormErrors {
  const errors: FormErrors = {};

  if (!name.trim()) {
    errors.name = "Vui lòng nhập tên của bạn";
  } else if (name.trim().length > 100) {
    errors.name = "Tên không được quá 100 ký tự";
  }

  if (!message.trim()) {
    errors.message = "Vui lòng nhập lời chúc";
  } else if (message.trim().length > 1000) {
    errors.message = "Lời chúc không được quá 1000 ký tự";
  }

  return errors;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

interface WishesSectionProps {
  initialWishes: Wish[];
}

const WISHES_PER_PAGE = 5;

export default function WishesSection({ initialWishes }: WishesSectionProps) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [visibleCount, setVisibleCount] = useState(WISHES_PER_PAGE);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Load more when scrolled within 50px of the bottom
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      setVisibleCount((prev) => Math.min(prev + WISHES_PER_PAGE, wishes.length));
    }
  }, [wishes.length]);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitResult(null);

    const validationErrors = validate(name, message);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        );
      }

      const newWish: Wish = {
        _id: Date.now().toString(),
        name: name.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
      };

      setWishes([newWish, ...wishes]);
      setName("");
      setMessage("");
      setErrors({});
      setSubmitResult({
        type: "success",
        message: "Cảm ơn bạn đã gửi lời chúc!",
      });
      setTimeout(() => setSubmitResult(null), 3000);
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
    <div>
      {/* Wish submission form */}
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12" noValidate>
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

        <div>
          <label htmlFor="wish-name" className="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            id="wish-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "wish-name-error" : undefined}
          />
          {errors.name && (
            <p id="wish-name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="wish-message" className="block text-sm font-medium text-gray-700 mb-1">
            Lời chúc <span className="text-red-500">*</span>
          </label>
          <textarea
            id="wish-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.message ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "wish-message-error" : undefined}
          />
          {errors.message && (
            <p id="wish-message-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-6 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: submitting ? '#B08D4F' : '#C9A96E' }}
          onMouseEnter={(e) => { if (!submitting) (e.target as HTMLButtonElement).style.backgroundColor = '#B08D4F'; }}
          onMouseLeave={(e) => { if (!submitting) (e.target as HTMLButtonElement).style.backgroundColor = '#C9A96E'; }}
        >
          {submitting ? "Đang gửi..." : "Gửi Lời Chúc"}
        </button>
      </form>

      {/* Wishes list */}
      {wishes.length > 0 ? (
        <div className="max-w-2xl mx-auto">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="max-h-[500px] overflow-y-auto space-y-3 sm:space-y-4 pr-1"
          >
            {wishes.slice(0, visibleCount).map((wish) => (
              <div
                key={wish._id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{wish.name}</h3>
                  <time className="text-xs text-gray-400" dateTime={wish.createdAt}>
                    {formatDate(wish.createdAt)}
                  </time>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">{wish.message}</p>
              </div>
            ))}
            {visibleCount < wishes.length && (
              <p className="text-center text-xs text-gray-400 py-2">Cuộn xuống để xem thêm...</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-center">Chưa có lời chúc nào.</p>
      )}
    </div>
  );
}
