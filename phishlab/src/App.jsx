import { Routes, Route } from "react-router-dom";

<<<<<<< HEAD
import Register from "./pages/register";
import Signin from "./pages/signin"

import "./App.css";
import CampaignBuilder from "./pages/CampaignBuilder";

=======
import Index from "./index";
import Dashboard from "./pages/dashboard";
import Register from "./pages/register";
import Signin from "./pages/signin";
import CampaignBuilder from "./pages/CampaignBuilder";

import "./App.css";

>>>>>>> 7c00952d81a17a508f5c1ccbb69c3035a35b1fb9
function App() {

  return (
    <Routes>
<<<<<<< HEAD
      <Route path = "/campaign" element={<CampaignBuilder />} />
=======
      <Route path = "/index" element={<Index />} />
      <Route path = "/campaignBuilder" element={<CampaignBuilder />} />
      <Route path = "/dashboard" element={<Dashboard />} />
>>>>>>> 7c00952d81a17a508f5c1ccbb69c3035a35b1fb9
      <Route path = "/register" element={<Register />} />
      <Route path = "/" element={<Signin />} />
    </Routes>
  );
}

export default App;
