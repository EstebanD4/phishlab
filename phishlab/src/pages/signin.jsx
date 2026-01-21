import {useNavigate } from "react-router-dom";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "../App.css";
import styles from "./signin.module.css";

export default function Login()
{
    const nav = useNavigate();
    const [msg, setMsg] = useState("");

    async function sendCampagin(event)
    {
        event.preventDefault();
        const form = new FormData(event.target);
        const email = form.get("email");
        const password = form.get("password");

        if (email == "" || password == "")
        {
            alert("Veuillez remplir le/les champ(s) !");
        }
        else
        {
            if (email.search("@") == -1)
            {
                alert("Veuillez entrer une adresse email valide !");
            }
            else     
            {
                //alert(`Email : ${email}, Mdp : ${password}`);
                setMsg(await invoke("sendLoginForm", {email: email, password: password}));
            }
        }
    }

    return (
        <main className="container">
            <h1>Page Connexion de Compte</h1>
            <form className={styles.form} onSubmit={sendCampagin}>
                <p className={styles.emailP}>Email : <input className={styles.email} name = "email"/></p>
                <p className={styles.passwordP}>Mot de passe : <input className={styles.password} type = "password" name = "password"/></p>
                <button className={styles.submit} type ="submit">Envoyer</button>
            </form>
            <br />
            <p>{msg}</p>
            <p>Vous n'avez pas de compte ? <button type="button" onClick={() => nav("/register")}>Inscrivez vous</button></p>
        </main>
  );
}