import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

import "../App.css";

export default function Login() {
    const nav = useNavigate();

    async function login(event) {
        event.preventDefault();
        console.log("[Login] click");

        try {
            // 1) Login Keycloak via Rust
            const tokens = await invoke("login");
            console.log("[Login] tokens raw:", tokens);

            const parsed = typeof tokens === "string" ? JSON.parse(tokens) : tokens;
            localStorage.setItem("Phishlab_Token", JSON.stringify(parsed));

            // 2) Récupère ce qu'on vient de stocker
            const storedTokens = localStorage.getItem("Phishlab_Token");
            if (!storedTokens) {
                console.log("[Login] no stored tokens -> nav /");
                nav("/");
                return;
            }

            const reparsed = JSON.parse(storedTokens);
            console.log("[Login] reparsed keys:", Object.keys(reparsed || {}));
            console.log("[Login] access_token exists?", !!reparsed?.access_token);

            if (!reparsed?.access_token) {
                console.log("[Login] missing access_token -> clear + nav /");
                localStorage.removeItem("Phishlab_Token");
                nav("/");
                return;
            }

            // 3) Vérification côté Rust
            console.log("[Login] before verify_token");
            const okRaw = await invoke("verify_token", { token: reparsed.access_token });
            console.log("[Login] verify_token raw =", okRaw, "type =", typeof okRaw);

            // coercition en booléen (au cas où Rust renvoie "true"/"false")
            const ok = okRaw === true || okRaw === "true" || okRaw === 1 || okRaw === "1";
            console.log("[Login] verify_token coerced ok =", ok);

            if (!ok) {
                console.log("[Login] token invalid -> clear + nav /");
                localStorage.removeItem("Phishlab_Token");
                nav("/");
                return;
            }

            // 4) Token OK -> go campaign
            console.log("[Login] NAV -> /campaign");
            nav("/campaign");
            return;
        } catch (e) {
            console.error("[Login] error:", e);
            localStorage.removeItem("Phishlab_Token");
            nav("/");
            return;
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
        </main>
    );
}
