import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "../App.css";

export default function Login() {
    const nav = useNavigate();
    const [tokenDebug, setTokenDebug] = useState("");

    async function login(event) {
        event.preventDefault();

        try {
            // 1) Login (Rust -> Keycloak -> tokens)
            const tokens = await invoke("login");
            console.log("[Login] tokens raw:", tokens);

            // debug UI (optionnel)
            setTokenDebug(typeof tokens === "string" ? tokens : JSON.stringify(tokens));

            // 2) Parse + store
            const parsed = typeof tokens === "string" ? JSON.parse(tokens) : tokens;
            localStorage.setItem("Phishlab_Token", JSON.stringify(parsed));

            const stored = localStorage.getItem("Phishlab_Token");
            if (!stored) {
                nav("/");
                return;
            }

            const reparsed = JSON.parse(stored);

            if (!reparsed?.access_token) {
                console.log("[Login] missing access_token -> clear + nav /");
                localStorage.removeItem("Phishlab_Token");
                nav("/");
                return;
            }

            // 3) Verify token (Rust)
            const okRaw = await invoke("verify_token", { token: reparsed.access_token });
            const ok = okRaw === true || okRaw === "true" || okRaw === 1 || okRaw === "1";

            console.log("[Login] verify_token:", okRaw, "=> ok =", ok);

            if (!ok) {
                console.log("[Login] token invalid -> clear + nav /");
                localStorage.removeItem("Phishlab_Token");
                nav("/");
                return;
            }

            // 4) Token OK -> go campaign
            console.log("[Login] NAV -> /campaign");
            nav("/campaign");
        } catch (e) {
            console.error("[Login] error:", e);
            localStorage.removeItem("Phishlab_Token");
            nav("/");
        }
    }

    return (
        <main className="container">
            <h1>Page Connexion de Compte</h1>

            <p>
                <button type="button" onClick={login}>
                    Connectez-vous !
                </button>
            </p>

            {/* DEBUG: à enlever en prod */}
            {tokenDebug ? (
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {tokenDebug}
        </pre>
            ) : null}

            <p>
                <button type="button" onClick={() => nav("/campaign")}>
                    Campaign Builder
                </button>
            </p>
        </main>
    );
}
