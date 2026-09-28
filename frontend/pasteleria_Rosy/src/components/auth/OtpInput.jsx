import { useRef } from "react";
import { cn } from "@/lib/utils";

export function OtpInput({ length = 6, value, onChange, disabled, error }) {
  const inputRefs = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function setDigitAt(index, digit) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
  }

  function handleChange(index, event) {
    const raw = event.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigitAt(index, "");
      return;
    }
    // toma solo el ultimo digito escrito, por si el navegador concatena
    setDigitAt(index, raw[raw.length - 1]);
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigitAt(index - 1, "");
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted.padEnd(length, "").slice(0, length).replace(/\s/g, ""));
    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  }

  return (
    <div className="flex justify-center gap-1.5 sm:gap-2.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          aria-label={`Dígito ${index + 1} del código`}
          className={cn(
            "size-10 rounded-lg border bg-transparent text-center text-lg font-semibold text-foreground outline-none transition-colors sm:size-12",
            "focus-visible:border-brand-primary focus-visible:ring-3 focus-visible:ring-brand-primary/25",
            digit ? "border-brand-primary/40" : "border-input",
            error && "border-destructive",
            disabled && "cursor-not-allowed opacity-50"
          )}
        />
      ))}
    </div>
  );
}
