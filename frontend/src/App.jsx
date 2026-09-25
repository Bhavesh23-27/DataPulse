import { useEffect, useState } from "react";

import {
    BarChart3,
    Database,
    FileSpreadsheet,
    LayoutDashboard,
    LogIn,
    Settings,
    Upload,
    Users
} from "lucide-react";

import {
    getDatasetDashboard,
    getStoredUser,
    login,
    logout
} from "./api";

import "./App.css";

function App() {
    const [user, setUser] = useState(getStoredUser());

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    useEffect(() => {
        if (!user) {
            return;
        }

        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const data = await getDatasetDashboard(1);

                setDashboardData(data);
            } catch (err) {
                console.error("Dashboard API error:", err);

                if (err.response?.status === 401) {
                    logout();
                    setUser(null);
                    setDashboardData(null);
                    setError(
                        "Your session has expired. Please log in again."
                    );
                    return;
                }

                if (err.response?.status === 403) {
                    setError(
                        "You do not have permission to access this dashboard."
                    );
                    return;
                }

                setError(
                    err.response?.data?.error ||
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [user]);

    async function handleLogin(event) {
        event.preventDefault();

        setLoginError("");

        if (!email || !password) {
            setLoginError(
                "Email and password are required."
            );
            return;
        }

        try {
            setLoginLoading(true);

            const data = await login(
                email,
                password
            );

            setUser(data.user);

            setEmail("");
            setPassword("");
        } catch (err) {
            console.error("Login error:", err);

            setLoginError(
                err.response?.data?.error ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoginLoading(false);
        }
    }

    function handleLogout() {
        logout();

        setUser(null);
        setDashboardData(null);
        setError("");
    }

    if (!user) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f4f6fb",
                    padding: "24px"
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: "420px",
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "36px",
                        boxShadow:
                            "0 10px 35px rgba(15, 23, 42, 0.08)"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            marginBottom: "30px"
                        }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: "#635bff",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "800"
                            }}
                        >
                            DP
                        </div>

                        <div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "24px",
                                    color: "#172033"
                                }}
                            >
                                DataPulse
                            </h1>

                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#7b8495",
                                    fontSize: "13px"
                                }}
                            >
                                Analytics Platform
                            </p>
                        </div>
                    </div>

                    <h2
                        style={{
                            margin: "0 0 8px",
                            color: "#172033"
                        }}
                    >
                        Welcome back
                    </h2>

                    <p
                        style={{
                            margin: "0 0 24px",
                            color: "#7b8495",
                            fontSize: "14px"
                        }}
                    >
                        Sign in to continue to DataPulse.
                    </p>

                    <form onSubmit={handleLogin}>
                        <div
                            style={{
                                marginBottom: "18px"
                            }}
                        >
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "7px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#334155"
                                }}
                            >
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your email"
                                autoComplete="email"
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "12px 14px",
                                    border: "1px solid #dbe1ea",
                                    borderRadius: "8px",
                                    fontSize: "15px",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <div
                            style={{
                                marginBottom: "22px"
                            }}
                        >
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "7px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#334155"
                                }}
                            >
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "12px 14px",
                                    border: "1px solid #dbe1ea",
                                    borderRadius: "8px",
                                    fontSize: "15px",
                                    outline: "none"
                                }}
                            />
                        </div>

                        {loginError && (
                            <p
                                style={{
                                    margin: "0 0 16px",
                                    color: "#dc2626",
                                    fontSize: "13px"
                                }}
                            >
                                {loginError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loginLoading}
                            style={{
                                width: "100%",
                                border: "none",
                                borderRadius: "8px",
                                padding: "13px",
                                background: "#635bff",
                                color: "#ffffff",
                                fontSize: "15px",
                                fontWeight: "600",
                                cursor: loginLoading
                                    ? "not-allowed"
                                    : "pointer",
                                opacity: loginLoading
                                    ? 0.7
                                    : 1
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px"
                                }}
                            >
                                <LogIn size={18} />

                                {loginLoading
                                    ? "Signing in..."
                                    : "Sign In"}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-mark">
                        DP
                    </div>

                    <div>
                        <h1>DataPulse</h1>
                        <span>Analytics Platform</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <p className="nav-section-title">
                        MAIN
                    </p>

                    <a
                        href="#"
                        className="nav-item active"
                    >
                        <LayoutDashboard size={19} />
                        <span>Dashboard</span>
                    </a>

                    <a
                        href="#"
                        className="nav-item"
                    >
                        <Database size={19} />
                        <span>Datasets</span>
                    </a>

                    <a
                        href="#"
                        className="nav-item"
                    >
                        <BarChart3 size={19} />
                        <span>Analytics</span>
                    </a>

                    <p className="nav-section-title">
                        DATA
                    </p>

                    <a
                        href="#"
                        className="nav-item"
                    >
                        <Upload size={19} />
                        <span>Import Data</span>
                    </a>

                    <a
                        href="#"
                        className="nav-item"
                    >
                        <FileSpreadsheet size={19} />
                        <span>Data Sources</span>
                    </a>

                    <p className="nav-section-title">
                        SYSTEM
                    </p>

                    <a
                        href="#"
                        className="nav-item"
                    >
                        <Users size={19} />
                        <span>Users</span>
                    </a>

                    <a
                        href="#"
                        className="nav-item"
                    >
                        <Settings size={19} />
                        <span>Settings</span>
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <div className="profile-avatar">
                        {user.name?.charAt(0).toUpperCase() ||
                            "B"}
                    </div>

                    <div className="user-info">
                        <strong>{user.name}</strong>
                        <span>{user.role}</span>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <p className="breadcrumb">
                            Workspace / Dashboard
                        </p>

                        <h2>Dashboard</h2>
                    </div>

                    <div className="topbar-actions">
                        <button
                            className="profile-button"
                            onClick={handleLogout}
                        >
                            <span className="profile-avatar">
                                {user.name
                                    ?.charAt(0)
                                    .toUpperCase() ||
                                    "B"}
                            </span>

                            <span>{user.name}</span>
                        </button>
                    </div>
                </header>

                <section className="dashboard-content">
                    <div className="welcome-section">
                        <div>
                            <p className="eyebrow">
                                OVERVIEW
                            </p>

                            <h3>
                                {loading
                                    ? "Loading dashboard..."
                                    : dashboardData
                                      ? dashboardData.dataset.name
                                      : "Dashboard"}
                            </h3>

                            <p>
                                {error
                                    ? error
                                    : "Monitor your datasets and explore your data through DataPulse analytics."}
                            </p>
                        </div>

                        <button className="primary-button">
                            <Upload size={18} />
                            Import Data
                        </button>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <Database size={21} />
                            </div>

                            <div>
                                <span className="stat-label">
                                    Total Datasets
                                </span>

                                <strong className="stat-value">
                                    {dashboardData
                                        ? 1
                                        : "..."}
                                </strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <FileSpreadsheet
                                    size={21}
                                />
                            </div>

                            <div>
                                <span className="stat-label">
                                    Total Records
                                </span>

                                <strong className="stat-value">
                                    {dashboardData
                                        ? dashboardData
                                              .summary
                                              ?.row_count ??
                                          "..."
                                        : "..."}
                                </strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <BarChart3 size={21} />
                            </div>

                            <div>
                                <span className="stat-label">
                                    Analytics
                                </span>

                                <strong className="stat-value">
                                    {dashboardData
                                        ? "Active"
                                        : "..."}
                                </strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <Users size={21} />
                            </div>

                            <div>
                                <span className="stat-label">
                                    Users
                                </span>

                                <strong className="stat-value">
                                    1
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-card dataset-card">
                            <div className="card-header">
                                <div>
                                    <p className="card-eyebrow">
                                        DATASET
                                    </p>

                                    <h4>
                                        {loading
                                            ? "Loading..."
                                            : dashboardData
                                              ? dashboardData
                                                    .dataset
                                                    .name
                                              : "Dataset"}
                                    </h4>
                                </div>

                                <span className="status-badge">
                                    {dashboardData
                                        ? dashboardData
                                              .dataset
                                              .status
                                        : "..."}
                                </span>
                            </div>

                            <div className="dataset-details">
                                <div>
                                    <span>
                                        Records
                                    </span>

                                    <strong>
                                        {dashboardData
                                            ? dashboardData
                                                  .summary
                                                  ?.row_count ??
                                              "..."
                                            : "..."}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Columns
                                    </span>

                                    <strong>
                                        {dashboardData
                                            ? dashboardData
                                                  .columns
                                                  ?.length ??
                                              "..."
                                            : "..."}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Source
                                    </span>

                                    <strong>
                                        {dashboardData
                                            ? dashboardData
                                                  .dataset
                                                  .source_type
                                                  ?.toUpperCase()
                                            : "..."}
                                    </strong>
                                </div>
                            </div>

                            <button className="secondary-button">
                                View Dataset
                            </button>
                        </div>

                        <div className="dashboard-card activity-card">
                            <div className="card-header">
                                <div>
                                    <p className="card-eyebrow">
                                        SYSTEM
                                    </p>

                                    <h4>
                                        Recent Activity
                                    </h4>
                                </div>
                            </div>

                            <div className="activity-item">
                                <div className="activity-dot" />

                                <div>
                                    <strong>
                                        Dataset loaded
                                    </strong>

                                    <span>
                                        {dashboardData
                                            ? dashboardData
                                                  .dataset
                                                  .name
                                            : "Loading dataset..."}
                                    </span>
                                </div>

                                <time>
                                    Recently
                                </time>
                            </div>

                            <div className="activity-item">
                                <div className="activity-dot" />

                                <div>
                                    <strong>
                                        Analytics generated
                                    </strong>

                                    <span>
                                        Dashboard summary
                                    </span>
                                </div>

                                <time>
                                    Recently
                                </time>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default App;