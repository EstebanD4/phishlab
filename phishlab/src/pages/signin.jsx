import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

import "../App.css";

export default function Login() {
    const nav = useNavigate();
    const [token, setToken] = useState("");

    async function login(event)
    {
        event.preventDefault();
        const tokens = await invoke("login");
        console.log(tokens);
        setToken(tokens);
    }

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
            <p><button type="button" onClick={event => login(event)}>Connectez-vous !</button></p>
            <p>{token}</p>
            <p><button onClick={() => nav("/campaign")}>Campaign Builder</button></p>
        </main>
    );
}
