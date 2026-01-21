import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import CampaignBuilder from "./pages/CampaignBuilder";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [view, setView] = useState("home");

  if (view === "home") {
    return (
      <main className="App">
        <h1>PhishLab</h1>
        <div className="center-button">
          <button onClick={() => setView("campaignBuilder")}>
            Create Campaign
          </button>
          

        </div>
      </main>
    );
  } else if (view === "campaignBuilder") {
    return <CampaignBuilder onBack={() => setView("home")} />

  }

}

export default App;
