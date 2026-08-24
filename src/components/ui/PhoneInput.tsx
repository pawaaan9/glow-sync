import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const COUNTRY_CODES = [
  { code: "+94", country: "LK", flag: "🇱🇰" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+64", country: "NZ", flag: "🇳🇿" },
  { code: "+92", country: "PK", flag: "🇵🇰" },
  { code: "+880", country: "BD", flag: "🇧🇩" },
];

function splitPhone(value: string) {
  const match = COUNTRY_CODES.find((c) => value.startsWith(c.code));
  if (match) return { dialCode: match.code, number: value.slice(match.code.length).trimStart() };
  return { dialCode: COUNTRY_CODES[0]!.code, number: value.replace(/^\+/, "") };
}

interface PhoneInputProps {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  wrapperClassName?: string;
}

export function PhoneInput({
  label,
  error,
  hint,
  placeholder,
  name,
  value = "",
  onChange,
  onBlur,
  className,
  wrapperClassName,
}: PhoneInputProps) {
  const [local, setLocal] = useState(() => splitPhone(value));

  const dialCode = value ? splitPhone(value).dialCode : local.dialCode;
  const number = value ? splitPhone(value).number : local.number;

  function emit(nextDialCode: string, nextNumber: string) {
    setLocal({ dialCode: nextDialCode, number: nextNumber });
    onChange?.(nextNumber ? `${nextDialCode} ${nextNumber}` : "");
  }

  const inputId = name ? `${name}-number` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium tracking-tight text-neutral-800"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "group flex h-12 items-stretch overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-200 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100 hover:border-neutral-300",
          error && "border-red-400 focus-within:border-red-500 focus-within:ring-red-100",
          className,
        )}
      >
        <label className="relative flex shrink-0 items-center border-r border-neutral-200">
          <span className="sr-only">Country code</span>
          <select
            aria-label="Country code"
            value={dialCode}
            onChange={(e) => emit(e.target.value, number)}
            onBlur={onBlur}
            className="h-full appearance-none bg-transparent py-0 pl-4 pr-6 text-sm text-ink outline-none [&::-ms-expand]:hidden"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={`${c.country}-${c.code}`} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
        </label>
        <input
          id={inputId}
          name={name}
          type="tel"
          inputMode="tel"
          placeholder={placeholder}
          value={number}
          onChange={(e) => emit(dialCode, e.target.value)}
          onBlur={onBlur}
          className="h-full w-full min-w-0 flex-1 bg-white px-4 text-sm text-ink outline-none placeholder:text-neutral-400"
        />
      </div>
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}
