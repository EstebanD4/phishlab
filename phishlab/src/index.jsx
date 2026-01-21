import { useNavigate } from "react-router-dom";

export default function Index()
{
    const nav = useNavigate();

    return (
    <>
        <h1>Page Principale</h1>
        <main className="container">
            <p><button type="button" onClick={() => nav("/dashboard")}>Aller au Dashboard</button></p>
            <p><button type="button" onClick={() => nav("/campaignBuilder")}>Création d'une campagne</button></p>
            <p><button type="button" onClick={() => nav("/register")}>Créer un compte</button></p>
        </main>
    </>
  );
}