import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import AdminPage from "./pages/AdminPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import PricingPage from "./pages/PricingPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import OrganizationDetailsPage from "./pages/OrganizationDetailsPage";
import FeaturesPage from "./pages/FeaturesPage";
import EnterprisePage from "./pages/EnterprisePage";
import LivePreview from "./pages/LivePreview";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />

        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />
        <Route path="/admin" element={isSignedIn ? <AdminPage /> : <Navigate to={"/"} />} />
        <Route path="/leaderboard" element={isSignedIn ? <LeaderboardPage /> : <Navigate to={"/"} />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/enterprise" element={<EnterprisePage />} />
        <Route path="/organizations" element={isSignedIn ? <OrganizationsPage /> : <Navigate to={"/"} />} />
        <Route path="/organizations/:id" element={isSignedIn ? <OrganizationDetailsPage /> : <Navigate to={"/"} />} />
        <Route path="/live/:slug" element={<LivePreview />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
