import { useNavigate } from "react-router-dom";

import "./App.css";
import styles from "./register.module.css";

export default function Register()
{
    const nav = useNavigate();

    function sendCampagin(event)
    {
        const form = new FormData(event.target);
        const name = form.get("name");
        const firstname = form.get("firstName");
        const email = form.get("email");
        const mdp = form.get("password");

        if (name == "" || firstname == "" || email == "" || mdp == "")
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
                if(mdp.length <= 8)
                {
                    alert("Veuillez entrer un mot de passe plus long !");
                }
                else     
                {
                    alert(`Nom ${name}, Prénom : ${firstname}, Email : ${email}, Mdp : ${mdp}`);
                }
            }
        }
    }

    async function register(event) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
    }

    return (
        <main className="container">
            <h1 className={styles.title}>Page Création Compte</h1>
                <form className={styles.form} onSubmit={sendCampagin}>
                    <p className={styles.nameP}>Nom: <input className={styles.name} name = "name"/></p>
                    <p className={styles.firstNameP}>Prenom: <input className={styles.firstName} name = "firstName"/></p>
                    <p className={styles.emailP}>Email : <input className={styles.email} name = "email"/></p>
                    <p className={styles.passwordP}>Mot de passe : <input className={styles.password } type = "password" name = "password"/></p>
                    <button className={styles.submit} type ="submit">Envoyer</button>
                </form>
            <br />
            <div className={styles.div2}>
                <p className={styles.signIn}>Déjà un compte ? <button className={styles.signInButton} type="button" onClick={() => nav("/signin")}>Connectez vous</button> </p>
                <p><button type="button" onClick={() => nav("/")}>Aller au Menu Principal</button></p>
            </div>
        </main>
  );
}