import {useNavigate } from "react-router-dom";

import "./App.css";

export default function Login()
{
    const nav = useNavigate();

    function sendCampagin(event)
    {
        const form = new FormData(event.target);
        const email = form.get("email");
        const mdp = form.get("password");
        alert(`Email : ${email}, Mdp : ${mdp}`);
    }

    return (
        <main className="container">
            <h1>Page Connexion de Compte</h1>
            <form onSubmit={sendCampagin}>
                <p>Email : <input name = "email"/></p>
                <p>Mot de passe : <input name = "password"/></p>
                <button type ="submit">Envoyer</button>
            </form>
            <br />
            <p>Vous n'avez pas de compte ? <button type="button" onClick={() => nav("/register")}>Inscrivez vous</button></p>
            <p><button type="button" onClick={() => nav("/")}>Aller au Menu Principal</button></p>
        </main>
  );
}