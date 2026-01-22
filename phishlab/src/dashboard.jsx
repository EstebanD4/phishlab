import { useNavigate } from "react-router-dom";

export default function Dashboard()
{
  const nav = useNavigate();
  return (
    <>
      <h1>Page Dashboard</h1>
      <main className="container">
            <p><button type="button" onClick={() => nav("/")}>Aller au Menu Principal</button></p>
      </main>
    </>
  );
}