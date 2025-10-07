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
                const match = trimmed.match(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i);
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
                <form
                        onSubmit={handleSubmit}
                        className="mt-4 space-y-3 rounded-xl border border-white/15 bg-white/5 p-3 shadow-sm backdrop-blur-sm sm:flex sm:items-center sm:gap-3 sm:space-y-0"
                >
                        <label htmlFor="domain-search" className="sr-only">
                                Domain or URL
                        </label>
                        <div className="flex-1">
                                <input
                                        id="domain-search"
                                        type="text"
                                        value={value}
                                        onChange={(event) => setValue(event.target.value)}
                                        placeholder="Paste a domain or URL"
                                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-white shadow-inner transition focus:border-white focus:outline-none focus:ring-1 focus:ring-white placeholder:text-white/60"
                                        autoComplete="off"
                                />
                                {error && (
                                        <p className="mt-1 text-sm text-rose-200" role="alert">
                                                {error}
                                        </p>
                                )}
                        </div>
                        <button
                                type="submit"
                                aria-label="View report"
                                className="flex h-11 w-full items-center justify-center rounded-lg bg-white text-xl transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-black sm:w-auto"
                        >
                                ⛏️
                        </button>
                </form>
        );
}
