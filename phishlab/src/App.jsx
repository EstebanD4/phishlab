import { Routes, Route } from "react-router-dom";

import Index from "./index";
import Dashboard from "./pages/dashboard";
import Register from "./pages/register";
import Signin from "./pages/signin";
import CampaignBuilder from "./pages/CampaignBuilder";

import "./App.css";

function App() {

  return (
    <Routes>
      <Route path = "/index" element={<Index />} />
      <Route path = "/campaignBuilder" element={<CampaignBuilder />} />
      <Route path = "/dashboard" element={<Dashboard />} />
      <Route path = "/register" element={<Register />} />
      <Route path = "/" element={<Signin />} />
    </Routes>
  );
}

export default App;
