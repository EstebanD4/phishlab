// src/hooks/useEmailList.js
import { useMemo, useState } from "react";
import { isValidEmail, normalizeEmail, uniqueMergeEmails } from "../lib/emailUtils";

export function useEmailList() {
    const [emails, setEmails] = useState([]);
    const [newEmail, setNewEmail] = useState("");
    const [emailError, setEmailError] = useState(null);

    const canAdd = useMemo(() => {
        const e = normalizeEmail(newEmail);
        if (!e) return false;
        if (!isValidEmail(e)) return false;
        if (emails.includes(e)) return false;
        return true;
    }, [newEmail, emails]);

    // ✅ Erreur “live” sous le champ d’ajout (sans cliquer)
    const liveNewEmailError = useMemo(() => {
        const raw = String(newEmail || "");
        if (raw.length === 0) return null; // pas d’erreur tant que vide
        const e = normalizeEmail(raw);
        if (!isValidEmail(e)) return "Invalid email format.";
        if (emails.includes(e)) return "Email already added.";
        return null;
    }, [newEmail, emails]);

    function addEmail() {
        setEmailError(null);
        const e = normalizeEmail(newEmail);

        if (!e) {
            setEmailError("Email is required.");
            return false;
        }
        if (!isValidEmail(e)) {
            setEmailError("Invalid email format.");
            return false;
        }
        if (emails.includes(e)) {
            setEmailError("Email already added.");
            return false;
        }

        setEmails((prev) => [e, ...prev]);
        setNewEmail("");
        return true;
    }

    function removeEmail(emailToRemove) {
        const target = normalizeEmail(emailToRemove);
        setEmails((prev) => prev.filter((x) => x !== target));
    }

    function clearEmails() {
        setEmails([]);
        setEmailError(null);
        setNewEmail("");
    }

    function importFake() {
        setEmailError(null);
        const imported = ["alice@company.com", "bob@company.com", "charlie@company.com"];
        setEmails((prev) => uniqueMergeEmails(prev, imported));
    }

    return {
        emails,
        setEmails,

        newEmail,
        setNewEmail,

        emailError,
        setEmailError,

        // ✅ live
        liveNewEmailError,
        canAdd,

        addEmail,
        removeEmail,
        clearEmails,
        importFake,
    };
}
