import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "../App.css";
import styles from "./register.module.css";

export default function Register()
{
    const nav = useNavigate();
    const [msg, setMsg] = useState("");

    async function sendRegisterForm(event)
    {
        event.preventDefault();
        const form = new FormData(event.target);
        const name = form.get("name");
        const firstname = form.get("firstName");
        const email = form.get("email");
        const password = form.get("password");

        if (name == "" || firstname == "" || email == "" || password == "")
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
                    if(password.length < 8)
                    {
                        alert("Veuillez entrer un mot de passe plus long !");
                    }
                    else     
                    {
                        //alert(`Nom ${name}, Prénom : ${firstname}, Email : ${email}, Mdp : ${password}`);
                        setMsg(await invoke("sendRegisterForm", {name: name, firstname: firstname, email: email, password: password}));
                    }
                }
            }
        }
    }

    return (
        <main className="container">
            <h1 className={styles.title}>Page Création Compte</h1>
                <form className={styles.form} onSubmit={sendRegisterForm}>
                    <p className={styles.nameP}>Nom: <input className={styles.name} name = "name"/></p>
                    <p className={styles.firstNameP}>Prenom: <input className={styles.firstName} name = "firstName"/></p>
                    <p className={styles.emailP}>Email : <input className={styles.email} name = "email"/></p>
                    <p className={styles.passwordP}>Mot de passe : <input className={styles.password } type = "password" name = "password"/></p>
                    <button className={styles.submit} type ="submit">Envoyer</button>
                    <p>{msg}</p>
                </form>
            <br />
            <div className={styles.div2}>
                <p className={styles.signIn}>Déjà un compte ? <button className={styles.signInButton} type="button" onClick={() => nav("/")}>Connectez vous</button> </p>
            </div>
        </main>
  );
}