import { Suspense, lazy } from "react";
import "./App.css";

// Lazy load the main dashboard component to optimize the initial bundle size
const JobPilotDashboard = lazy(() => import("./JobPilotDashboard"));

/**
 * Loading Fallback Component
 * Displayed while the main component chunks are being fetched over the network
 */
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#0b0b18",
      color: "#00e5a0",
      fontFamily: "'Space Mono', monospace",
      fontSize: "14px",
      letterSpacing: "0.5px",
    }}
  >
    Initializing JobPilot Dashboard...
  </div>
);

/**
 * App Component
 *
 * The root container of the application. This is the standard location to wrap
 * the application with global providers (e.g., ThemeProvider, AuthProvider,
 * Redux Provider), Setup Error Boundaries, and define application-wide routing.
 *
 * @returns {JSX.Element} Root application element
 */
const App = () => {
  return (
    <main className="app-main-layout">
      {/* 
        Global providers and routing should be placed here.
        Example:
        <ErrorBoundary>
          <ReduxProvider store={store}>
            <ThemeProvider>
              <Router>
                ...
              </Router>
            </ThemeProvider>
          </ReduxProvider>
        </ErrorBoundary>
      */}
      <Suspense fallback={<LoadingFallback />}>
        <JobPilotDashboard />
      </Suspense>
    </main>
  );
};

export default App;
