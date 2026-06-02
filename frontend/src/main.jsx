import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./lib/config";
import { bootstrapPublicConfig } from "./lib/bootstrapConfig";

const queryClient = new QueryClient();
const root = createRoot(document.getElementById("root"));

function renderApp() {
  const publishableKey = config.clerkPublishableKey;

  root.render(
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          {publishableKey ? (
            <ClerkProvider publishableKey={publishableKey}>
              <App />
            </ClerkProvider>
          ) : (
            <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Config missing</h1>
              <p style={{ marginBottom: 8 }}>
                Set <code>CLERK_PUBLISHABLE_KEY</code> on the backend (served via{" "}
                <code>/api/config/public</code>) or <code>VITE_CLERK_PUBLISHABLE_KEY</code> for local dev.
              </p>
            </div>
          )}
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

bootstrapPublicConfig().finally(renderApp);
