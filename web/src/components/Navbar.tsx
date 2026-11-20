import React, { useState } from "react";
import { Wind, Moon, Sun, Menu, X, Calculator, Database, Sigma, AlertCircle } from "lucide-react";

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, isDark, toggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "", label: "Predictor", icon: Calculator },
    { id: "data", label: "Data & Observations", icon: Database },
    { id: "math", label: "Math & Model", icon: Sigma },
    { id: "limitations", label: "Limitations & Roadmap", icon: AlertCircle },
  ];

  const handleNav = (id: string) => {
    navigate(id);
    setMobileMenuOpen(false);
  };

  const activeId = currentRoute === "predict" ? "" : currentRoute;

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "var(--header-h)",
      backgroundColor: "color-mix(in srgb, var(--bg-secondary) 85%, transparent)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--border-color)",
      zIndex: 100,
      display: "flex",
      alignItems: "center"
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav("")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem" }}
        >
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFF",
            boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)"
          }}>
            <Wind size={20} />
          </div>
          <div>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Kolkata<span style={{ color: "var(--accent)" }}>AQ</span>
            </span>
            <span style={{ display: "block", fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: "-3px" }}>
              Air Quality Estimation Platform
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="desktop-nav">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  background: isActive ? "var(--accent-light)" : "transparent",
                  border: "none",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  cursor: "pointer",
                  borderRadius: "var(--radius-pill)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  transition: "all var(--t-hover)"
                }}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Theme toggle & Mobile menu button */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-primary)",
              transition: "transform var(--t-hover)"
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            aria-label="Toggle Menu"
            style={{
              background: "transparent",
              border: "none",
              padding: "0.5rem",
              cursor: "pointer",
              color: "var(--text-primary)"
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed",
          top: "var(--header-h)",
          left: 0,
          right: 0,
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          boxShadow: "var(--shadow-overlay)",
          zIndex: 99
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              style={{
                background: activeId === item.id ? "var(--accent-light)" : "transparent",
                border: "none",
                padding: "0.75rem 1rem",
                textAlign: "left",
                fontSize: "1rem",
                fontWeight: activeId === item.id ? 700 : 500,
                color: activeId === item.id ? "var(--accent)" : "var(--text-primary)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                cursor: "pointer"
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
        @media (min-width: 821px) {
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
