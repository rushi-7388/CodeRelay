import { lazy, Suspense } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader";

const HomePage = lazy(() => import("./pages/HomePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const ProblemsPage = lazy(() => import("./pages/ProblemsPage"));
const SessionPage = lazy(() => import("./pages/SessionPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const OrganizationsPage = lazy(() => import("./pages/OrganizationsPage"));
const OrganizationDetailsPage = lazy(() => import("./pages/OrganizationDetailsPage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const EnterprisePage = lazy(() => import("./pages/EnterprisePage"));
const LivePreview = lazy(() => import("./pages/LivePreview"));

function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return <PageLoader label="Starting CodeRelay…" />;

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to="/" />} />
          <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to="/" />} />
          <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to="/" />} />
          <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to="/" />} />
          <Route path="/admin" element={isSignedIn ? <AdminPage /> : <Navigate to="/" />} />
          <Route path="/leaderboard" element={isSignedIn ? <LeaderboardPage /> : <Navigate to="/" />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/organizations" element={isSignedIn ? <OrganizationsPage /> : <Navigate to="/" />} />
          <Route
            path="/organizations/:id"
            element={isSignedIn ? <OrganizationDetailsPage /> : <Navigate to="/" />}
          />
          <Route path="/live/:slug" element={<LivePreview />} />
        </Routes>
      </Suspense>
      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
