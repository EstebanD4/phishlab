import { Routes, Route } from "react-router-dom";

import Register from "./pages/register";
import Signin from "./pages/signin"

import "./App.css";
import CampaignBuilder from "./pages/CampaignBuilder";

function App() {

  return (
    <Routes>
      <Route path = "/campaign" element={<CampaignBuilder />} />
      <Route path = "/register" element={<Register />} />
      <Route path = "/" element={<Signin />} />
    </Routes>
  );
}

export default App;
