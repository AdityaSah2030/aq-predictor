import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Predict } from "./pages/Predict";
import { DataView } from "./pages/DataView";
import { MathModel } from "./pages/MathModel";
import { LimitationsView } from "./pages/LimitationsView";
import { loadAllData, DatasetBundle } from "./lib/data";
import { AlertCircle, RefreshCw } from "lucide-react";

export function App() {
  const [data, setData] = useState<DatasetBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hash-based routing - default landing is predictor ("" or "predict")
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace("#/", "").replace("#", "");
    return hash || "";
  });

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const route = window.location.hash.replace("#/", "").replace("#", "");
      setCurrentRoute(route);
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (route: string) => {
    window.location.hash = `#/${route}`;
  };

  useEffect(() => {
    loadAllData()
      .then((bundle) => {
        setData(bundle);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dataset artifacts:", err);
        setError(err.message || "Failed to load data artifacts");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        color: "var(--text-secondary)"
      }}>
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "3px solid var(--accent-light)",
          borderTopColor: "var(--accent)",
          animation: "spin 1s linear infinite"
        }} />
        <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
          Initializing atmospheric data & regression models...
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center"
      }}>
        <AlertCircle size={48} color="var(--bad)" />
        <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Failed to Load Model Data</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "500px" }}>
          {error}. Please run <code>python run_pipeline.py</code> to regenerate model artifacts.
        </p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  // Determine active view (default is Predictor)
  const isPredictor = currentRoute === "" || currentRoute === "predict";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      <main style={{ flex: 1, paddingTop: "calc(var(--header-h) + 2rem)" }}>
        <div className="container">
          {isPredictor && <Predict data={data} navigate={navigate} />}
          {currentRoute === "data" && <DataView data={data} />}
          {currentRoute === "math" && <MathModel data={data} />}
          {currentRoute === "limitations" && <LimitationsView />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
