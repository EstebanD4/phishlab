import {useNavigate } from "react-router-dom";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "../App.css";
<<<<<<< HEAD
=======
import styles from "./signin.module.css";
>>>>>>> 7c00952d81a17a508f5c1ccbb69c3035a35b1fb9

export default function Login()
{
    const nav = useNavigate();
<<<<<<< HEAD
    /*const [msg, setMsg] = useState("");
=======
    const [msg, setMsg] = useState("");
>>>>>>> 7c00952d81a17a508f5c1ccbb69c3035a35b1fb9

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
                if((email.includes("=") == true) || (email.includes(";") == true) || (email.includes("(") == true) || (email.includes(")") == true) || (email.includes('"') == true))
                {
                    alert("Veuillez ne pas utiliser de caractère spécial !");
                }
                else
                {
                    //alert(`Email : ${email}, Mdp : ${password}`);
                    setMsg(await invoke("sendLoginForm", {email: email, password: password}));
                }
            }
        }
<<<<<<< HEAD
    }*/
=======
    }
>>>>>>> 7c00952d81a17a508f5c1ccbb69c3035a35b1fb9

    async function login(event)
    {
        event.preventDefault();
        const tokens = await invoke("login");
        console.log(tokens);
    }


    return (
        <main className="container">
            <h1>Page Connexion de Compte</h1>
<<<<<<< HEAD
            <p><button type="button" onClick={event => login(event)}>Connectez-vous !</button></p>
            <p><button onClick={() => nav("/campaign")}>Campaign Builder</button></p>
=======
            <form className={styles.form} onSubmit={login}>
                <p className={styles.emailP}>Email : <input className={styles.email} name = "email"/></p>
                <p className={styles.passwordP}>Mot de passe : <input className={styles.password} type = "password" name = "password"/></p>
                <button className={styles.submit} type ="submit">Envoyer</button>
            </form>
            <br />
            <p>{msg}</p>
            <p>Vous n'avez pas de compte ? <button type="button" onClick={() => nav("/register")}>Inscrivez vous</button></p>
>>>>>>> 7c00952d81a17a508f5c1ccbb69c3035a35b1fb9
        </main>
  );
}