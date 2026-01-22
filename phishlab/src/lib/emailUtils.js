// src/lib/emailUtils.js

export function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function uniqueMergeEmails(existing, incoming) {
    const cleaned = [...incoming, ...existing]
        .map(normalizeEmail)
        .filter(Boolean);

    return Array.from(new Set(cleaned));
}
