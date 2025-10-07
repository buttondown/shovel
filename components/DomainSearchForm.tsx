"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function normalizeDomain(input: string): string | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const candidate = trimmed.includes("://")
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`);

    return candidate.hostname.replace(/\.$/, "");
  } catch {
    const match = trimmed.match(
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i
    );
    return match ? match[0] : null;
  }
}

export default function DomainSearchForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const domain = normalizeDomain(value);

    if (!domain) {
      setError("Please enter a valid domain or URL.");
      return;
    }

    setError(null);
    router.push(`/domain/${encodeURIComponent(domain)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Enter domain or URL"
        className="bg-white/10 p-2 w-80"
      />
      <button
        type="submit"
        className="bg-white/10 p-2 hover:bg-white/20 transition-colors"
      >
        View Report
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}
