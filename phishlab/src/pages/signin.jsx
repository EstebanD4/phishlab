import {useNavigate } from "react-router-dom";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "../App.css";

export default function Login()
{
    const nav = useNavigate();
    /*const [msg, setMsg] = useState("");

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
    }*/

    async function login(event)
    {
        event.preventDefault();
        event.preventDefault();
        const tokens = await invoke("login");
        console.log(tokens);
        const parsed =
            typeof tokens === "string" ? JSON.parse(tokens) : tokens;
        localStorage.setItem("Phishlab_Token", JSON.stringify(parsed));
        nav("/CampaignBuilder");

    }


    return (
        <main className="container">
            <h1>Page Connexion de Compte</h1>
            <p><button type="button" onClick={event => login(event)}>Connectez-vous !</button></p>
            <p><button onClick={() => nav("/campaign")}>Campaign Builder</button></p>
        </main>
  );
}