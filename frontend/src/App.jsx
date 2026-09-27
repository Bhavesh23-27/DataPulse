import { useEffect, useState } from "react";

import {
    BarChart3,
    Database,
    FileSpreadsheet,
    LayoutDashboard,
    LogIn,
    Settings,
    Upload,
    Users,
    X,
    FileUp,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import {
    createDataset,
    updateDataset,
    getDatasetDashboard,
    getDatasets,
    getStoredUser,
    getDatasetRecords,
    importDatasetFile,
    login,
    logout
} from "./api";

import "./App.css";

function App() {
    const [user, setUser] = useState(getStoredUser());

    const [activePage, setActivePage] = useState("dashboard");

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [datasetRecords, setDatasetRecords] = useState([]);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [recordsError, setRecordsError] = useState("");

    const [datasets, setDatasets] = useState([]);
    const [datasetsLoading, setDatasetsLoading] = useState(false);
    const [datasetsError, setDatasetsError] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    // =========================
    // IMPORT STATE
    // =========================

    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importDatasetId, setImportDatasetId] = useState("1");
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState("");
    const [importSuccess, setImportSuccess] = useState("");

    // =========================
    // CREATE DATASET STATE
    // =========================

    const [showCreateDatasetModal, setShowCreateDatasetModal] =
        useState(false);

    const [datasetName, setDatasetName] = useState("");
    const [datasetDescription, setDatasetDescription] = useState("");
    const [datasetSourceType, setDatasetSourceType] = useState("csv");
    const [createDatasetLoading, setCreateDatasetLoading] = useState(false);
    const [createDatasetError, setCreateDatasetError] = useState("");
    const [createDatasetSuccess, setCreateDatasetSuccess] = useState("");

    // =========================
    // EDIT DATASET STATE
    // =========================

    const [showEditDatasetModal, setShowEditDatasetModal] =
        useState(false);

    const [editingDatasetId, setEditingDatasetId] = useState(null);
    const [editDatasetName, setEditDatasetName] = useState("");
    const [editDatasetDescription, setEditDatasetDescription] =
        useState("");
    const [editDatasetSourceType, setEditDatasetSourceType] =
        useState("csv");
    const [editDatasetStatus, setEditDatasetStatus] =
        useState("pending");
    const [editDatasetLoading, setEditDatasetLoading] =
        useState(false);
    const [editDatasetError, setEditDatasetError] = useState("");
    const [editDatasetSuccess, setEditDatasetSuccess] = useState("");

    // =========================
    // LOAD DASHBOARD
    // =========================

    useEffect(() => {
        if (!user || activePage !== "dashboard") {
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
    }, [user, activePage]);

    // =========================
    // LOAD DATASETS
    // =========================

    useEffect(() => {
        if (!user || activePage !== "datasets") {
            return;
        }

        async function loadDatasets() {
            try {
                setDatasetsLoading(true);
                setDatasetsError("");

                const data = await getDatasets();

                const datasetList = Array.isArray(data)
                    ? data
                    : data.datasets || [];

                setDatasets(datasetList);

                if (
                    datasetList.length > 0 &&
                    !datasetList.some(
                        (dataset) =>
                            String(dataset.id) ===
                            String(importDatasetId)
                    )
                ) {
                    setImportDatasetId(String(datasetList[0].id));
                }
            } catch (err) {
                console.error("Datasets API error:", err);

                if (err.response?.status === 401) {
                    logout();
                    setUser(null);
                    return;
                }

                setDatasetsError(
                    err.response?.data?.error ||
                        "Unable to load datasets."
                );
            } finally {
                setDatasetsLoading(false);
            }
        }

        loadDatasets();
    }, [user, activePage]);

    // =========================
    // LOGIN
    // =========================

    async function handleLogin(event) {
        event.preventDefault();

        setLoginError("");

        if (!email || !password) {
            setLoginError("Email and password are required.");
            return;
        }

        try {
            setLoginLoading(true);

            const data = await login(email, password);

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

    // =========================
    // LOGOUT
    // =========================

    function handleLogout() {
        logout();

        setUser(null);
        setDashboardData(null);
        setDatasets([]);
        setActivePage("dashboard");
        setError("");
        setDatasetsError("");
    }

    // =========================
    // NAVIGATION
    // =========================

    function navigateTo(page) {
        setActivePage(page);
    }

    // =========================
    // CREATE DATASET
    // =========================

    function openCreateDatasetModal() {
        setDatasetName("");
        setDatasetDescription("");
        setDatasetSourceType("csv");
        setCreateDatasetError("");
        setCreateDatasetSuccess("");

        setShowCreateDatasetModal(true);
    }

    function closeCreateDatasetModal() {
        if (createDatasetLoading) {
            return;
        }

        setShowCreateDatasetModal(false);
        setDatasetName("");
        setDatasetDescription("");
        setDatasetSourceType("csv");
        setCreateDatasetError("");
        setCreateDatasetSuccess("");
    }

    async function handleCreateDataset() {
        setCreateDatasetError("");
        setCreateDatasetSuccess("");

        if (!datasetName.trim()) {
            setCreateDatasetError("Dataset name is required.");
            return;
        }

        try {
            setCreateDatasetLoading(true);

            const result = await createDataset({
                name: datasetName.trim(),
                description: datasetDescription.trim() || null,
                source_type: datasetSourceType
            });

            setCreateDatasetSuccess(
                result.message || "Dataset created successfully."
            );

            const refreshedDatasets = await getDatasets();

            const datasetList = Array.isArray(refreshedDatasets)
                ? refreshedDatasets
                : refreshedDatasets.datasets || [];

            setDatasets(datasetList);

            setTimeout(() => {
                setShowCreateDatasetModal(false);
                setCreateDatasetSuccess("");
            }, 1200);
        } catch (err) {
            console.error("Create dataset error:", err);

            if (err.response?.status === 401) {
                logout();
                setUser(null);
                return;
            }

            setCreateDatasetError(
                err.response?.data?.error ||
                    "Unable to create dataset."
            );
        } finally {
            setCreateDatasetLoading(false);
        }
    }

    const loadDatasetRecords = async (datasetId) => {
    setRecordsLoading(true);
    setRecordsError("");

    try {
        const data = await getDatasetRecords(datasetId);

        setDatasetRecords(data.records || []);
    } catch (error) {
        console.error(
            "Failed to load dataset records:",
            error
        );

        setDatasetRecords([]);

        setRecordsError(
            error.response?.data?.error ||
            "Failed to load dataset records"
        );
    } finally {
        setRecordsLoading(false);
    }
};

    // =========================
    // EDIT DATASET
    // =========================

    function openEditDatasetModal(dataset) {
        setEditingDatasetId(dataset.id);
        setEditDatasetName(dataset.name || "");
        setEditDatasetDescription(dataset.description || "");
        setEditDatasetSourceType(dataset.source_type || "csv");
        setEditDatasetStatus(dataset.status || "pending");
        setEditDatasetError("");
        setEditDatasetSuccess("");

        setShowEditDatasetModal(true);
    }

    function closeEditDatasetModal() {
        if (editDatasetLoading) {
            return;
        }

        setShowEditDatasetModal(false);
        setEditingDatasetId(null);
        setEditDatasetName("");
        setEditDatasetDescription("");
        setEditDatasetSourceType("csv");
        setEditDatasetStatus("pending");
        setEditDatasetError("");
        setEditDatasetSuccess("");
    }

    async function handleUpdateDataset() {
        setEditDatasetError("");
        setEditDatasetSuccess("");

        if (!editDatasetName.trim()) {
            setEditDatasetError("Dataset name is required.");
            return;
        }

        if (!editingDatasetId) {
            setEditDatasetError("No dataset selected.");
            return;
        }

        try {
            setEditDatasetLoading(true);

            const result = await updateDataset(
                editingDatasetId,
                {
                    name: editDatasetName.trim(),
                    description:
                        editDatasetDescription.trim() || null,
                    source_type: editDatasetSourceType,
                    status: editDatasetStatus
                }
            );

            setEditDatasetSuccess(
                result.message || "Dataset updated successfully."
            );

            const refreshedDatasets = await getDatasets();

            const datasetList = Array.isArray(refreshedDatasets)
                ? refreshedDatasets
                : refreshedDatasets.datasets || [];

            setDatasets(datasetList);

            setTimeout(() => {
                setShowEditDatasetModal(false);
                setEditingDatasetId(null);
                setEditDatasetName("");
                setEditDatasetDescription("");
                setEditDatasetSourceType("csv");
                setEditDatasetStatus("pending");
                setEditDatasetSuccess("");
            }, 1200);
        } catch (err) {
            console.error("Update dataset error:", err);

            if (err.response?.status === 401) {
                logout();
                setUser(null);
                return;
            }

            setEditDatasetError(
                err.response?.data?.error ||
                    "Unable to update dataset."
            );
        } finally {
            setEditDatasetLoading(false);
        }
    }

    // =========================
    // FORMATTERS
    // =========================

    function formatCurrency(value) {
        if (value === undefined || value === null) {
            return "...";
        }

        return `₹${Number(value).toLocaleString("en-IN", {
            maximumFractionDigits: 0
        })}`;
    }

    function formatNumber(value) {
        if (value === undefined || value === null) {
            return "...";
        }

        return Number(value).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    }

    // =========================
    // CHART DATA
    // =========================

    function getSalesTrend() {
        if (
            !dashboardData?.trends?.["Sale Date:Sales"]?.trend
        ) {
            return [];
        }

        return dashboardData.trends["Sale Date:Sales"].trend.map(
            (item) => ({
                date: item.date,
                sales: item.value
            })
        );
    }

    function getCategoryDistribution() {
        if (
            !dashboardData?.distributions?.Category?.values
        ) {
            return [];
        }

        return dashboardData.distributions.Category.values.map(
            (item) => ({
                category: item.value,
                records: item.count,
                percentage: Number(item.percentage.toFixed(1))
            })
        );
    }

    function getQuantityTrend() {
        if (
            !dashboardData?.trends?.["Sale Date:Quantity"]?.trend
        ) {
            return [];
        }

        return dashboardData.trends["Sale Date:Quantity"].trend.map(
            (item) => ({
                date: item.date,
                quantity: item.value
            })
        );
    }

    function getAnalyticsSummary() {
        const salesSummary =
            dashboardData?.summary?.columns?.Sales;

        const quantitySummary =
            dashboardData?.summary?.columns?.Quantity;

        const categoryDistribution =
            getCategoryDistribution();

        const salesTrend = getSalesTrend();

        const quantityTrend = getQuantityTrend();

        const highestCategory =
            categoryDistribution.length > 0
                ? [...categoryDistribution].sort(
                      (a, b) => b.records - a.records
                  )[0]
                : null;

        const highestSalesDay =
            salesTrend.length > 0
                ? [...salesTrend].sort(
                      (a, b) => b.sales - a.sales
                  )[0]
                : null;

        const highestQuantityDay =
            quantityTrend.length > 0
                ? [...quantityTrend].sort(
                      (a, b) => b.quantity - a.quantity
                  )[0]
                : null;

        return {
            salesSummary,
            quantitySummary,
            categoryDistribution,
            salesTrend,
            quantityTrend,
            highestCategory,
            highestSalesDay,
            highestQuantityDay
        };
    }

    // =========================
    // IMPORT MODAL
    // =========================

    function openImportModal() {
        setSelectedFile(null);
        setImportError("");
        setImportSuccess("");

        const firstDataset =
            datasets.length > 0 ? datasets[0].id : 1;

        setImportDatasetId(String(firstDataset));

        setShowImportModal(true);
    }

    function closeImportModal() {
        if (importLoading) {
            return;
        }

        setShowImportModal(false);
        setSelectedFile(null);
        setImportError("");
        setImportSuccess("");
    }

    function handleFileChange(event) {
        const file = event.target.files?.[0];

        setImportError("");
        setImportSuccess("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        const fileName = file.name.toLowerCase();

        if (
            !fileName.endsWith(".csv") &&
            !fileName.endsWith(".json")
        ) {
            setSelectedFile(null);

            setImportError(
                "Only CSV and JSON files are supported."
            );

            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    }

    function getImportErrorMessage(err) {
        const responseData = err.response?.data;

        if (
            responseData?.errors &&
            Array.isArray(responseData.errors)
        ) {
            return responseData.errors
                .map((item) => {
                    const errors = Array.isArray(item.errors)
                        ? item.errors.join(", ")
                        : item.errors;

                    return `Row ${item.row}: ${errors}`;
                })
                .join("\n");
        }

        return (
            responseData?.error ||
            err.message ||
            "Unable to import the file."
        );
    }

    async function handleImport() {
        setImportError("");
        setImportSuccess("");

        if (!selectedFile) {
            setImportError(
                "Please select a CSV or JSON file."
            );

            return;
        }

        if (!importDatasetId) {
            setImportError("Please select a dataset.");
            return;
        }

        try {
            setImportLoading(true);

            const result = await importDatasetFile(
                importDatasetId,
                selectedFile
            );

            setImportSuccess(
                `${result.imported_count || 0} records imported successfully.`
            );

            setSelectedFile(null);

            if (String(importDatasetId) === "1") {
                try {
                    const refreshedDashboard =
                        await getDatasetDashboard(1);

                    setDashboardData(refreshedDashboard);
                } catch (dashboardError) {
                    console.error(
                        "Dashboard refresh failed:",
                        dashboardError
                    );
                }
            }

            try {
                const refreshedDatasets =
                    await getDatasets();

                setDatasets(
                    Array.isArray(refreshedDatasets)
                        ? refreshedDatasets
                        : refreshedDatasets.datasets || []
                );
            } catch (datasetError) {
                console.error(
                    "Dataset refresh failed:",
                    datasetError
                );
            }

            setTimeout(() => {
                setShowImportModal(false);
                setImportSuccess("");
            }, 1800);
        } catch (err) {
            console.error("Import error:", err);

            if (err.response?.status === 401) {
                logout();
                setUser(null);
                return;
            }

            setImportError(getImportErrorMessage(err));
        } finally {
            setImportLoading(false);
        }
    }

    // =========================
    // LOGIN SCREEN
    // =========================

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
                        <div style={{ marginBottom: "18px" }}>
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
                                    setEmail(event.target.value)
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

                        <div style={{ marginBottom: "22px" }}>
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
                                    setPassword(event.target.value)
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
                                opacity: loginLoading ? 0.7 : 1
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

    const salesSummary =
        dashboardData?.summary?.columns?.Sales;

    const quantitySummary =
        dashboardData?.summary?.columns?.Quantity;

    const salesTrend = getSalesTrend();

    const categoryDistribution =
        getCategoryDistribution();

    const analyticsSummary =
        getAnalyticsSummary();

    const quantityTrend =
        analyticsSummary.quantityTrend;

    return (
        <>
            <div className="app">
                <aside className="sidebar">
                    <div className="sidebar-logo">
                        <div className="logo-mark">
                            DP
                        </div>

                        <div>
                            <h1>DataPulse</h1>

                            <span>
                                Analytics Platform
                            </span>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <p className="nav-section-title">
                            MAIN
                        </p>

                        <button
                            type="button"
                            className={`nav-item ${
                                activePage === "dashboard"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                navigateTo("dashboard")
                            }
                        >
                            <LayoutDashboard size={19} />

                            <span>Dashboard</span>
                        </button>

                        <button
                            type="button"
                            className={`nav-item ${
                                activePage === "datasets"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                navigateTo("datasets")
                            }
                        >
                            <Database size={19} />

                            <span>Datasets</span>
                        </button>

                        <button
                            type="button"
                            className={`nav-item ${
                                activePage === "analytics"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                navigateTo("analytics")
                            }
                        >
                            <BarChart3 size={19} />

                            <span>Analytics</span>
                        </button>

                        <p className="nav-section-title">
                            DATA
                        </p>

                        <button
                            type="button"
                            className="nav-item"
                            onClick={openImportModal}
                        >
                            <Upload size={19} />

                            <span>Import Data</span>
                        </button>

                        <button
                            type="button"
                            className="nav-item"
                        >
                            <FileSpreadsheet size={19} />

                            <span>Data Sources</span>
                        </button>

                        <p className="nav-section-title">
                            SYSTEM
                        </p>

                        <button
                            type="button"
                            className="nav-item"
                        >
                            <Users size={19} />

                            <span>Users</span>
                        </button>

                        <button
                            type="button"
                            className="nav-item"
                        >
                            <Settings size={19} />

                            <span>Settings</span>
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <div className="profile-avatar">
                            {user.name
                                ?.charAt(0)
                                .toUpperCase() || "B"}
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
                                Workspace /{" "}
                                {activePage === "dashboard"
                                    ? "Dashboard"
                                    : activePage === "datasets"
                                    ? "Datasets"
                                    : "Analytics"}
                            </p>

                            <h2>
                                {activePage === "dashboard"
                                    ? "Dashboard"
                                    : activePage === "datasets"
                                    ? "Datasets"
                                    : "Analytics"}
                            </h2>
                        </div>

                        <div className="topbar-actions">
                            <button
                                className="profile-button"
                                onClick={handleLogout}
                            >
                                <span className="profile-avatar">
                                    {user.name
                                        ?.charAt(0)
                                        .toUpperCase() || "B"}
                                </span>

                                <span>{user.name}</span>
                            </button>
                        </div>
                    </header>

                    {/* =========================
                        DASHBOARD
                    ========================= */}

                    {activePage === "dashboard" && (
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
                                        {error ||
                                            "Monitor your datasets and explore your data through DataPulse analytics."}
                                    </p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={openImportModal}
                                >
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
                                            Total Records
                                        </span>

                                        <strong className="stat-value">
                                            {dashboardData
                                                ? formatNumber(
                                                      dashboardData
                                                          .summary
                                                          ?.row_count
                                                  )
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
                                            Total Sales
                                        </span>

                                        <strong className="stat-value">
                                            {formatCurrency(
                                                salesSummary?.sum
                                            )}
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
                                            Average Sales
                                        </span>

                                        <strong className="stat-value">
                                            {formatCurrency(
                                                salesSummary?.average
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <Users size={21} />
                                    </div>

                                    <div>
                                        <span className="stat-label">
                                            Total Quantity
                                        </span>

                                        <strong className="stat-value">
                                            {formatNumber(
                                                quantitySummary?.sum
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="dashboard-grid"
                                style={{
                                    marginBottom: "20px"
                                }}
                            >
                                <div className="dashboard-card">
                                    <div className="card-header">
                                        <div>
                                            <p className="card-eyebrow">
                                                PERFORMANCE
                                            </p>

                                            <h4>
                                                Sales Trend
                                            </h4>
                                        </div>

                                        <span className="status-badge">
                                            {
                                                salesTrend.length
                                            }{" "}
                                            Records
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: "100%",
                                            height: "300px"
                                        }}
                                    >
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <LineChart
                                                data={salesTrend}
                                                margin={{
                                                    top: 10,
                                                    right: 10,
                                                    left: 0,
                                                    bottom: 5
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#edf0f4"
                                                />

                                                <XAxis
                                                    dataKey="date"
                                                    tick={{
                                                        fontSize: 10,
                                                        fill: "#8992a3"
                                                    }}
                                                    tickFormatter={(
                                                        value
                                                    ) =>
                                                        value?.slice(
                                                            5
                                                        )
                                                    }
                                                />

                                                <YAxis
                                                    tick={{
                                                        fontSize: 10,
                                                        fill: "#8992a3"
                                                    }}
                                                    tickFormatter={(
                                                        value
                                                    ) =>
                                                        `₹${(
                                                            value /
                                                            1000
                                                        ).toFixed(
                                                            0
                                                        )}k`
                                                    }
                                                />

                                                <Tooltip
                                                    formatter={(
                                                        value
                                                    ) => [
                                                        formatCurrency(
                                                            value
                                                        ),
                                                        "Sales"
                                                    ]}
                                                />

                                                <Line
                                                    type="monotone"
                                                    dataKey="sales"
                                                    stroke="#635bff"
                                                    strokeWidth={3}
                                                    dot={{
                                                        r: 4,
                                                        fill: "#635bff"
                                                    }}
                                                    activeDot={{
                                                        r: 6
                                                    }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="dashboard-card">
                                    <div className="card-header">
                                        <div>
                                            <p className="card-eyebrow">
                                                BREAKDOWN
                                            </p>

                                            <h4>
                                                Category Distribution
                                            </h4>
                                        </div>

                                        <span className="status-badge">
                                            {
                                                categoryDistribution.length
                                            }{" "}
                                            Categories
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: "100%",
                                            height: "300px"
                                        }}
                                    >
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={
                                                    categoryDistribution
                                                }
                                                margin={{
                                                    top: 10,
                                                    right: 10,
                                                    left: 0,
                                                    bottom: 5
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#edf0f4"
                                                />

                                                <XAxis
                                                    dataKey="category"
                                                    tick={{
                                                        fontSize: 10,
                                                        fill: "#8992a3"
                                                    }}
                                                />

                                                <YAxis
                                                    allowDecimals={
                                                        false
                                                    }
                                                    tick={{
                                                        fontSize: 10,
                                                        fill: "#8992a3"
                                                    }}
                                                />

                                                <Tooltip
                                                    formatter={(
                                                        value
                                                    ) => [
                                                        value,
                                                        "Records"
                                                    ]}
                                                />

                                                <Bar
                                                    dataKey="records"
                                                    fill="#635bff"
                                                    radius={[
                                                        5,
                                                        5,
                                                        0,
                                                        0
                                                    ]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
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

                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            navigateTo(
                                                "datasets"
                                            )
                                        }
                                    >
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
                                                Data Summary
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="activity-item">
                                        <div className="activity-dot" />

                                        <div>
                                            <strong>
                                                Highest Sale
                                            </strong>

                                            <span>
                                                {formatCurrency(
                                                    salesSummary?.maximum
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="activity-item">
                                        <div className="activity-dot" />

                                        <div>
                                            <strong>
                                                Lowest Sale
                                            </strong>

                                            <span>
                                                {formatCurrency(
                                                    salesSummary?.minimum
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="activity-item">
                                        <div className="activity-dot" />

                                        <div>
                                            <strong>
                                                Quantity Range
                                            </strong>

                                            <span>
                                                {formatNumber(
                                                    quantitySummary?.minimum
                                                )}{" "}
                                                –{" "}
                                                {formatNumber(
                                                    quantitySummary?.maximum
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* =========================
                        DATASETS
                    ========================= */}

                    {activePage === "datasets" && (
                        <section
                            style={{
                                padding: "36px",
                                background: "#f5f7fb",
                                minHeight:
                                    "calc(100vh - 86px)"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "center",
                                    marginBottom: "28px"
                                }}
                            >
                                <div>
                                    <p
                                        style={{
                                            margin: 0,
                                            color: "#635bff",
                                            fontSize: "12px",
                                            fontWeight: "800",
                                            letterSpacing: "1px"
                                        }}
                                    >
                                        DATA MANAGEMENT
                                    </p>

                                    <h3
                                        style={{
                                            margin:
                                                "8px 0 6px",
                                            fontSize: "28px",
                                            color: "#172033"
                                        }}
                                    >
                                        Your Datasets
                                    </h3>

                                    <p
                                        style={{
                                            margin: 0,
                                            color: "#7b8495"
                                        }}
                                    >
                                        Manage and explore
                                        your organization's
                                        datasets.
                                    </p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={openImportModal}
                                >
                                    <Upload size={18} />

                                    Import Data
                                </button>
                            </div>

                            {datasetsLoading && (
                                <div
                                    style={{
                                        background: "#ffffff",
                                        border:
                                            "1px solid #e3e7ef",
                                        borderRadius: "14px",
                                        padding: "32px",
                                        textAlign: "center",
                                        color: "#7b8495"
                                    }}
                                >
                                    Loading datasets...
                                </div>
                            )}

                            {datasetsError && (
                                <div
                                    style={{
                                        background: "#fff1f2",
                                        border:
                                            "1px solid #fecdd3",
                                        borderRadius: "14px",
                                        padding: "20px",
                                        color: "#be123c",
                                        whiteSpace: "pre-wrap"
                                    }}
                                >
                                    {datasetsError}
                                </div>
                            )}

                            {!datasetsLoading &&
                                !datasetsError &&
                                datasets.length === 0 && (
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border:
                                                "1px solid #e3e7ef",
                                            borderRadius: "14px",
                                            padding: "48px",
                                            textAlign: "center"
                                        }}
                                    >
                                        <Database
                                            size={42}
                                            color="#635bff"
                                        />

                                        <h4
                                            style={{
                                                margin:
                                                    "16px 0 8px",
                                                fontSize: "20px"
                                            }}
                                        >
                                            No datasets found
                                        </h4>

                                        <p
                                            style={{
                                                margin: 0,
                                                color: "#7b8495"
                                            }}
                                        >
                                            Create or import
                                            your first
                                            dataset.
                                        </p>

                                        <button
                                            className="primary-button"
                                            style={{
                                                marginTop:
                                                    "20px"
                                            }}
                                            onClick={
                                                openCreateDatasetModal
                                            }
                                        >
                                            Create Dataset
                                        </button>
                                    </div>
                                )}

                            {!datasetsLoading &&
                                !datasetsError &&
                                datasets.length > 0 && (
                                    <>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "flex-end",
                                                marginBottom:
                                                    "20px"
                                            }}
                                        >
                                            <button
                                                className="secondary-button"
                                                onClick={
                                                    openCreateDatasetModal
                                                }
                                            >
                                                + Create Dataset
                                            </button>
                                        </div>

                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "repeat(auto-fill, minmax(300px, 1fr))",
                                                gap: "20px"
                                            }}
                                        >
                                            {datasets.map(
                                                (dataset) => (
                                                    <div
                                                        key={
                                                            dataset.id
                                                        }
                                                        style={{
                                                            background:
                                                                "#ffffff",
                                                            border:
                                                                "1px solid #e3e7ef",
                                                            borderRadius:
                                                                "14px",
                                                            padding:
                                                                "24px",
                                                            boxShadow:
                                                                "0 4px 12px rgba(15, 23, 42, 0.03)"
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                justifyContent:
                                                                    "space-between",
                                                                alignItems:
                                                                    "flex-start",
                                                                gap: "12px"
                                                            }}
                                                        >
                                                            <div>
                                                                <p
                                                                    style={{
                                                                        margin:
                                                                            "0 0 8px",
                                                                        color:
                                                                            "#7b8495",
                                                                        fontSize:
                                                                            "12px",
                                                                        fontWeight:
                                                                            "700",
                                                                        textTransform:
                                                                            "uppercase"
                                                                    }}
                                                                >
                                                                    Dataset
                                                                </p>

                                                                <h4
                                                                    style={{
                                                                        margin: 0,
                                                                        fontSize:
                                                                            "20px",
                                                                        color:
                                                                            "#172033"
                                                                    }}
                                                                >
                                                                    {
                                                                        dataset.name
                                                                    }
                                                                </h4>
                                                            </div>

                                                            <span
                                                                style={{
                                                                    background:
                                                                        dataset.status ===
                                                                        "ready"
                                                                            ? "#e9f9f0"
                                                                            : "#f1f5f9",
                                                                    color:
                                                                        dataset.status ===
                                                                        "ready"
                                                                            ? "#16834b"
                                                                            : "#64748b",
                                                                    padding:
                                                                        "6px 10px",
                                                                    borderRadius:
                                                                        "999px",
                                                                    fontSize:
                                                                        "11px",
                                                                    fontWeight:
                                                                        "700"
                                                                }}
                                                            >
                                                                {
                                                                    dataset.status
                                                                }
                                                            </span>
                                                        </div>

                                                        <p
                                                            style={{
                                                                color:
                                                                    "#7b8495",
                                                                fontSize:
                                                                    "14px",
                                                                lineHeight:
                                                                    1.6,
                                                                minHeight:
                                                                    "44px"
                                                            }}
                                                        >
                                                            {dataset.description ||
                                                                "No description available."}
                                                        </p>

                                                        <div
                                                            style={{
                                                                display:
                                                                    "grid",
                                                                gridTemplateColumns:
                                                                    "1fr 1fr",
                                                                gap: "12px",
                                                                marginTop:
                                                                    "20px"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    background:
                                                                        "#f7f8fc",
                                                                    borderRadius:
                                                                        "10px",
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        display:
                                                                            "block",
                                                                        color:
                                                                            "#7b8495",
                                                                        fontSize:
                                                                            "12px"
                                                                    }}
                                                                >
                                                                    Source
                                                                </span>

                                                                <strong
                                                                    style={{
                                                                        display:
                                                                            "block",
                                                                        marginTop:
                                                                            "4px",
                                                                        color:
                                                                            "#172033"
                                                                    }}
                                                                >
                                                                    {dataset.source_type?.toUpperCase() ||
                                                                        "-"}
                                                                </strong>
                                                            </div>

                                                            <div
                                                                style={{
                                                                    background:
                                                                        "#f7f8fc",
                                                                    borderRadius:
                                                                        "10px",
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        display:
                                                                            "block",
                                                                        color:
                                                                            "#7b8495",
                                                                        fontSize:
                                                                            "12px"
                                                                    }}
                                                                >
                                                                    Dataset
                                                                    ID
                                                                </span>

                                                                <strong
                                                                    style={{
                                                                        display:
                                                                            "block",
                                                                        marginTop:
                                                                            "4px",
                                                                        color:
                                                                            "#172033"
                                                                    }}
                                                                >
                                                                    {
                                                                        dataset.id
                                                                    }
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        <div
                                                            style={{
                                                                display:
                                                                    "grid",
                                                                gridTemplateColumns:
                                                                    "1fr 1fr",
                                                                gap: "10px",
                                                                marginTop:
                                                                    "20px"
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="secondary-button"
                                                                onClick={() =>
                                                                    openEditDatasetModal(
                                                                        dataset
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="secondary-button"
                                                                onClick={() =>
                                                                    navigateTo(
                                                                        "dashboard"
                                                                    )
                                                                }
                                                            >
                                                                View
                                                                Dashboard
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}
                        </section>
                    )}

                    {/* =========================
                        ANALYTICS
                    ========================= */}

                    {activePage === "analytics" && (
                        <section
                            style={{
                                padding: "36px",
                                background: "#f5f7fb",
                                minHeight:
                                    "calc(100vh - 86px)"
                            }}
                        >
                            <div
                                style={{
                                    marginBottom: "28px"
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        color: "#635bff",
                                        fontSize: "12px",
                                        fontWeight: "800",
                                        letterSpacing: "1px"
                                    }}
                                >
                                    DATA ANALYSIS
                                </p>

                                <h3
                                    style={{
                                        margin:
                                            "8px 0 6px",
                                        fontSize: "28px",
                                        color: "#172033"
                                    }}
                                >
                                    Analytics
                                </h3>

                                <p
                                    style={{
                                        margin: 0,
                                        color: "#7b8495"
                                    }}
                                >
                                    Explore trends, distributions,
                                    and key insights from your
                                    dataset.
                                </p>
                            </div>

                            {!dashboardData && loading && (
                                <div
                                    style={{
                                        background:
                                            "#ffffff",
                                        border:
                                            "1px solid #e3e7ef",
                                        borderRadius:
                                            "14px",
                                        padding:
                                            "40px",
                                        textAlign:
                                            "center",
                                        color:
                                            "#7b8495"
                                    }}
                                >
                                    Loading analytics...
                                </div>
                            )}

                            {!dashboardData && !loading && (
                                <div
                                    style={{
                                        background:
                                            "#ffffff",
                                        border:
                                            "1px solid #e3e7ef",
                                        borderRadius:
                                            "14px",
                                        padding:
                                            "40px",
                                        textAlign:
                                            "center"
                                    }}
                                >
                                    <BarChart3
                                        size={44}
                                        color="#635bff"
                                    />

                                    <h4
                                        style={{
                                            margin:
                                                "16px 0 8px",
                                            color:
                                                "#172033"
                                        }}
                                    >
                                        No analytics data
                                    </h4>

                                    <p
                                        style={{
                                            margin: 0,
                                            color:
                                                "#7b8495"
                                        }}
                                    >
                                        Import data or open the
                                        dashboard to load analytics.
                                    </p>
                                </div>
                            )}

                            {dashboardData && (
                                <>
                                    {/* Analytics KPI cards */}

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(4, minmax(0, 1fr))",
                                            gap: "18px",
                                            marginBottom:
                                                "20px"
                                        }}
                                    >
                                        <div
                                            className="dashboard-card"
                                            style={{
                                                padding:
                                                    "22px"
                                            }}
                                        >
                                            <p
                                                className="card-eyebrow"
                                                style={{
                                                    marginBottom:
                                                        "8px"
                                                }}
                                            >
                                                TOTAL SALES
                                            </p>

                                            <h4
                                                style={{
                                                    fontSize:
                                                        "25px",
                                                    margin:
                                                        0,
                                                    color:
                                                        "#172033"
                                                }}
                                            >
                                                {formatCurrency(
                                                    analyticsSummary
                                                        .salesSummary
                                                        ?.sum
                                                )}
                                            </h4>

                                            <p
                                                style={{
                                                    margin:
                                                        "8px 0 0",
                                                    color:
                                                        "#7b8495",
                                                    fontSize:
                                                        "13px"
                                                }}
                                            >
                                                Across all
                                                records
                                            </p>
                                        </div>

                                        <div
                                            className="dashboard-card"
                                            style={{
                                                padding:
                                                    "22px"
                                            }}
                                        >
                                            <p
                                                className="card-eyebrow"
                                                style={{
                                                    marginBottom:
                                                        "8px"
                                                }}
                                            >
                                                AVERAGE SALE
                                            </p>

                                            <h4
                                                style={{
                                                    fontSize:
                                                        "25px",
                                                    margin:
                                                        0,
                                                    color:
                                                        "#172033"
                                                }}
                                            >
                                                {formatCurrency(
                                                    analyticsSummary
                                                        .salesSummary
                                                        ?.average
                                                )}
                                            </h4>

                                            <p
                                                style={{
                                                    margin:
                                                        "8px 0 0",
                                                    color:
                                                        "#7b8495",
                                                    fontSize:
                                                        "13px"
                                                }}
                                            >
                                                Mean sales
                                                value
                                            </p>
                                        </div>

                                        <div
                                            className="dashboard-card"
                                            style={{
                                                padding:
                                                    "22px"
                                            }}
                                        >
                                            <p
                                                className="card-eyebrow"
                                                style={{
                                                    marginBottom:
                                                        "8px"
                                                }}
                                            >
                                                TOTAL QUANTITY
                                            </p>

                                            <h4
                                                style={{
                                                    fontSize:
                                                        "25px",
                                                    margin:
                                                        0,
                                                    color:
                                                        "#172033"
                                                }}
                                            >
                                                {formatNumber(
                                                    analyticsSummary
                                                        .quantitySummary
                                                        ?.sum
                                                )}
                                            </h4>

                                            <p
                                                style={{
                                                    margin:
                                                        "8px 0 0",
                                                    color:
                                                        "#7b8495",
                                                    fontSize:
                                                        "13px"
                                                }}
                                            >
                                                Units recorded
                                            </p>
                                        </div>

                                        <div
                                            className="dashboard-card"
                                            style={{
                                                padding:
                                                    "22px"
                                            }}
                                        >
                                            <p
                                                className="card-eyebrow"
                                                style={{
                                                    marginBottom:
                                                        "8px"
                                                }}
                                            >
                                                TOP CATEGORY
                                            </p>

                                            <h4
                                                style={{
                                                    fontSize:
                                                        "25px",
                                                    margin:
                                                        0,
                                                    color:
                                                        "#172033"
                                                }}
                                            >
                                                {analyticsSummary
                                                    .highestCategory
                                                    ?.category ||
                                                    "..."}
                                            </h4>

                                            <p
                                                style={{
                                                    margin:
                                                        "8px 0 0",
                                                    color:
                                                        "#7b8495",
                                                    fontSize:
                                                        "13px"
                                                }}
                                            >
                                                {analyticsSummary
                                                    .highestCategory
                                                    ?.records ??
                                                    0}{" "}
                                                records
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sales and quantity trends */}

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(2, minmax(0, 1fr))",
                                            gap: "20px",
                                            marginBottom:
                                                "20px"
                                        }}
                                    >
                                        <div className="dashboard-card">
                                            <div className="card-header">
                                                <div>
                                                    <p className="card-eyebrow">
                                                        TREND
                                                    </p>

                                                    <h4>
                                                        Sales
                                                        Performance
                                                    </h4>
                                                </div>

                                                <span className="status-badge">
                                                    {
                                                        salesTrend.length
                                                    }{" "}
                                                    Points
                                                </span>
                                            </div>

                                            <div
                                                style={{
                                                    width:
                                                        "100%",
                                                    height:
                                                        "320px"
                                                }}
                                            >
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <LineChart
                                                        data={
                                                            salesTrend
                                                        }
                                                        margin={{
                                                            top: 10,
                                                            right: 10,
                                                            left: 0,
                                                            bottom: 5
                                                        }}
                                                    >
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            stroke="#edf0f4"
                                                        />

                                                        <XAxis
                                                            dataKey="date"
                                                            tick={{
                                                                fontSize: 10,
                                                                fill: "#8992a3"
                                                            }}
                                                            tickFormatter={(
                                                                value
                                                            ) =>
                                                                value?.slice(
                                                                    5
                                                                )
                                                            }
                                                        />

                                                        <YAxis
                                                            tick={{
                                                                fontSize: 10,
                                                                fill: "#8992a3"
                                                            }}
                                                            tickFormatter={(
                                                                value
                                                            ) =>
                                                                `₹${(
                                                                    value /
                                                                    1000
                                                                ).toFixed(
                                                                    0
                                                                )}k`
                                                            }
                                                        />

                                                        <Tooltip
                                                            formatter={(
                                                                value
                                                            ) => [
                                                                formatCurrency(
                                                                    value
                                                                ),
                                                                "Sales"
                                                            ]}
                                                        />

                                                        <Line
                                                            type="monotone"
                                                            dataKey="sales"
                                                            stroke="#635bff"
                                                            strokeWidth={
                                                                3
                                                            }
                                                            dot={{
                                                                r: 4,
                                                                fill: "#635bff"
                                                            }}
                                                            activeDot={{
                                                                r: 6
                                                            }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="dashboard-card">
                                            <div className="card-header">
                                                <div>
                                                    <p className="card-eyebrow">
                                                        TREND
                                                    </p>

                                                    <h4>
                                                        Quantity
                                                        Performance
                                                    </h4>
                                                </div>

                                                <span className="status-badge">
                                                    {
                                                        quantityTrend.length
                                                    }{" "}
                                                    Points
                                                </span>
                                            </div>

                                            <div
                                                style={{
                                                    width:
                                                        "100%",
                                                    height:
                                                        "320px"
                                                }}
                                            >
                                                {quantityTrend.length >
                                                0 ? (
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                    >
                                                        <LineChart
                                                            data={
                                                                quantityTrend
                                                            }
                                                            margin={{
                                                                top: 10,
                                                                right: 10,
                                                                left: 0,
                                                                bottom: 5
                                                            }}
                                                        >
                                                            <CartesianGrid
                                                                strokeDasharray="3 3"
                                                                stroke="#edf0f4"
                                                            />

                                                            <XAxis
                                                                dataKey="date"
                                                                tick={{
                                                                    fontSize: 10,
                                                                    fill: "#8992a3"
                                                                }}
                                                                tickFormatter={(
                                                                    value
                                                                ) =>
                                                                    value?.slice(
                                                                        5
                                                                    )
                                                                }
                                                            />

                                                            <YAxis
                                                                allowDecimals={
                                                                    false
                                                                }
                                                                tick={{
                                                                    fontSize: 10,
                                                                    fill: "#8992a3"
                                                                }}
                                                            />

                                                            <Tooltip
                                                                formatter={(
                                                                    value
                                                                ) => [
                                                                    formatNumber(
                                                                        value
                                                                    ),
                                                                    "Quantity"
                                                                ]}
                                                            />

                                                            <Line
                                                                type="monotone"
                                                                dataKey="quantity"
                                                                stroke="#10b981"
                                                                strokeWidth={
                                                                    3
                                                                }
                                                                dot={{
                                                                    r: 4,
                                                                    fill: "#10b981"
                                                                }}
                                                                activeDot={{
                                                                    r: 6
                                                                }}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div
                                                        style={{
                                                            height:
                                                                "100%",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            color:
                                                                "#7b8495",
                                                            fontSize:
                                                                "14px"
                                                        }}
                                                    >
                                                        Quantity trend
                                                        data is not
                                                        available.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category distribution */}

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "1.4fr 1fr",
                                            gap: "20px",
                                            marginBottom:
                                                "20px"
                                        }}
                                    >
                                        <div className="dashboard-card">
                                            <div className="card-header">
                                                <div>
                                                    <p className="card-eyebrow">
                                                        BREAKDOWN
                                                    </p>

                                                    <h4>
                                                        Category
                                                        Distribution
                                                    </h4>
                                                </div>

                                                <span className="status-badge">
                                                    {
                                                        categoryDistribution.length
                                                    }{" "}
                                                    Categories
                                                </span>
                                            </div>

                                            <div
                                                style={{
                                                    width:
                                                        "100%",
                                                    height:
                                                        "320px"
                                                }}
                                            >
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <BarChart
                                                        data={
                                                            categoryDistribution
                                                        }
                                                        margin={{
                                                            top: 10,
                                                            right: 10,
                                                            left: 0,
                                                            bottom: 5
                                                        }}
                                                    >
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            stroke="#edf0f4"
                                                        />

                                                        <XAxis
                                                            dataKey="category"
                                                            tick={{
                                                                fontSize: 10,
                                                                fill: "#8992a3"
                                                            }}
                                                        />

                                                        <YAxis
                                                            allowDecimals={
                                                                false
                                                            }
                                                            tick={{
                                                                fontSize: 10,
                                                                fill: "#8992a3"
                                                            }}
                                                        />

                                                        <Tooltip
                                                            formatter={(
                                                                value
                                                            ) => [
                                                                value,
                                                                "Records"
                                                            ]}
                                                        />

                                                        <Bar
                                                            dataKey="records"
                                                            fill="#635bff"
                                                            radius={[
                                                                5,
                                                                5,
                                                                0,
                                                                0
                                                            ]}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="dashboard-card">
                                            <div className="card-header">
                                                <div>
                                                    <p className="card-eyebrow">
                                                        INSIGHTS
                                                    </p>

                                                    <h4>
                                                        Dataset
                                                        Insights
                                                    </h4>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    flexDirection:
                                                        "column",
                                                    gap:
                                                        "18px"
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        padding:
                                                            "16px",
                                                        background:
                                                            "#f7f8fc",
                                                        borderRadius:
                                                            "12px"
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display:
                                                                "block",
                                                            color:
                                                                "#7b8495",
                                                            fontSize:
                                                                "12px",
                                                            marginBottom:
                                                                "6px"
                                                        }}
                                                    >
                                                        Highest Sale
                                                    </span>

                                                    <strong
                                                        style={{
                                                            display:
                                                                "block",
                                                            fontSize:
                                                                "22px",
                                                            color:
                                                                "#172033"
                                                        }}
                                                    >
                                                        {formatCurrency(
                                                            salesSummary?.maximum
                                                        )}
                                                    </strong>

                                                    {analyticsSummary.highestSalesDay && (
                                                        <span
                                                            style={{
                                                                display:
                                                                    "block",
                                                                marginTop:
                                                                    "5px",
                                                                color:
                                                                    "#7b8495",
                                                                fontSize:
                                                                    "12px"
                                                            }}
                                                        >
                                                            Peak trend
                                                            date:{" "}
                                                            {
                                                                analyticsSummary
                                                                    .highestSalesDay
                                                                    .date
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                <div
                                                    style={{
                                                        padding:
                                                            "16px",
                                                        background:
                                                            "#f7f8fc",
                                                        borderRadius:
                                                            "12px"
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display:
                                                                "block",
                                                            color:
                                                                "#7b8495",
                                                            fontSize:
                                                                "12px",
                                                            marginBottom:
                                                                "6px"
                                                        }}
                                                    >
                                                        Most Represented
                                                        Category
                                                    </span>

                                                    <strong
                                                        style={{
                                                            display:
                                                                "block",
                                                            fontSize:
                                                                "22px",
                                                            color:
                                                                "#172033"
                                                        }}
                                                    >
                                                        {analyticsSummary
                                                            .highestCategory
                                                            ?.category ||
                                                            "..."}
                                                    </strong>

                                                    <span
                                                        style={{
                                                            display:
                                                                "block",
                                                            marginTop:
                                                                "5px",
                                                            color:
                                                                "#7b8495",
                                                            fontSize:
                                                                "12px"
                                                        }}
                                                    >
                                                        {
                                                            analyticsSummary
                                                                .highestCategory
                                                                ?.percentage
                                                        }
                                                        % of
                                                        records
                                                    </span>
                                                </div>

                                                <div
                                                    style={{
                                                        padding:
                                                            "16px",
                                                        background:
                                                            "#f7f8fc",
                                                        borderRadius:
                                                            "12px"
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display:
                                                                "block",
                                                            color:
                                                                "#7b8495",
                                                            fontSize:
                                                                "12px",
                                                            marginBottom:
                                                                "6px"
                                                        }}
                                                    >
                                                        Quantity
                                                        Range
                                                    </span>

                                                    <strong
                                                        style={{
                                                            display:
                                                                "block",
                                                            fontSize:
                                                                "22px",
                                                            color:
                                                                "#172033"
                                                        }}
                                                    >
                                                        {formatNumber(
                                                            quantitySummary?.minimum
                                                        )}{" "}
                                                        –{" "}
                                                        {formatNumber(
                                                            quantitySummary?.maximum
                                                        )}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    )}
                </main>
            </div>

            {/* =========================
                EDIT DATASET MODAL
            ========================= */}

            {showEditDatasetModal && (
                <div
                    className="import-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeEditDatasetModal();
                        }
                    }}
                >
                    <div className="import-modal">
                        <div className="import-modal-header">
                            <div>
                                <p className="card-eyebrow">
                                    DATASET
                                </p>

                                <h3>
                                    Edit dataset
                                </h3>

                                <p>
                                    Update the dataset details
                                    for your organization.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    closeEditDatasetModal
                                }
                                disabled={
                                    editDatasetLoading
                                }
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="import-modal-body">
                            <div className="import-field">
                                <label>
                                    Dataset name
                                </label>

                                <input
                                    type="text"
                                    value={editDatasetName}
                                    onChange={(event) =>
                                        setEditDatasetName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Monthly Sales"
                                    disabled={
                                        editDatasetLoading
                                    }
                                />
                            </div>

                            <div className="import-field">
                                <label>
                                    Description
                                </label>

                                <textarea
                                    value={
                                        editDatasetDescription
                                    }
                                    onChange={(event) =>
                                        setEditDatasetDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe this dataset..."
                                    rows={4}
                                    disabled={
                                        editDatasetLoading
                                    }
                                />
                            </div>

                            <div className="import-field">
                                <label>
                                    Source type
                                </label>

                                <select
                                    value={
                                        editDatasetSourceType
                                    }
                                    onChange={(event) =>
                                        setEditDatasetSourceType(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        editDatasetLoading
                                    }
                                >
                                    <option value="csv">
                                        CSV
                                    </option>

                                    <option value="json">
                                        JSON
                                    </option>

                                    <option value="api">
                                        API
                                    </option>
                                </select>
                            </div>

                            <div className="import-field">
                                <label>
                                    Status
                                </label>

                                <select
                                    value={editDatasetStatus}
                                    onChange={(event) =>
                                        setEditDatasetStatus(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        editDatasetLoading
                                    }
                                >
                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="processing">
                                        Processing
                                    </option>

                                    <option value="ready">
                                        Ready
                                    </option>

                                    <option value="failed">
                                        Failed
                                    </option>
                                </select>
                            </div>

                            {editDatasetError && (
                                <div className="import-message error">
                                    <AlertCircle
                                        size={18}
                                    />

                                    <div>
                                        <strong>
                                            Update failed
                                        </strong>

                                        <p>
                                            {
                                                editDatasetError
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {editDatasetSuccess && (
                                <div className="import-message success">
                                    <CheckCircle2
                                        size={18}
                                    />

                                    <div>
                                        <strong>
                                            Dataset updated
                                        </strong>

                                        <p>
                                            {
                                                editDatasetSuccess
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="import-modal-footer">
                            <button
                                type="button"
                                className="modal-cancel-button"
                                onClick={
                                    closeEditDatasetModal
                                }
                                disabled={
                                    editDatasetLoading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="primary-button modal-upload-button"
                                onClick={
                                    handleUpdateDataset
                                }
                                disabled={
                                    editDatasetLoading
                                }
                            >
                                {editDatasetLoading
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================
                CREATE DATASET MODAL
            ========================= */}

            {showCreateDatasetModal && (
                <div
                    className="import-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCreateDatasetModal();
                        }
                    }}
                >
                    <div className="import-modal">
                        <div className="import-modal-header">
                            <div>
                                <p className="card-eyebrow">
                                    DATASET
                                </p>

                                <h3>
                                    Create dataset
                                </h3>

                                <p>
                                    Create a new dataset
                                    for your organization.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    closeCreateDatasetModal
                                }
                                disabled={
                                    createDatasetLoading
                                }
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="import-modal-body">
                            <div className="import-field">
                                <label>
                                    Dataset name
                                </label>

                                <input
                                    type="text"
                                    value={datasetName}
                                    onChange={(event) =>
                                        setDatasetName(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="e.g. Monthly Sales"
                                    disabled={
                                        createDatasetLoading
                                    }
                                />
                            </div>

                            <div className="import-field">
                                <label>
                                    Description
                                </label>

                                <textarea
                                    value={
                                        datasetDescription
                                    }
                                    onChange={(event) =>
                                        setDatasetDescription(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Describe this dataset..."
                                    rows={4}
                                    disabled={
                                        createDatasetLoading
                                    }
                                />
                            </div>

                            <div className="import-field">
                                <label>
                                    Source type
                                </label>

                                <select
                                    value={
                                        datasetSourceType
                                    }
                                    onChange={(event) =>
                                        setDatasetSourceType(
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={
                                        createDatasetLoading
                                    }
                                >
                                    <option value="csv">
                                        CSV
                                    </option>

                                    <option value="json">
                                        JSON
                                    </option>

                                    <option value="api">
                                        API
                                    </option>
                                </select>
                            </div>

                            {createDatasetError && (
                                <div className="import-message error">
                                    <AlertCircle
                                        size={18}
                                    />

                                    <div>
                                        <strong>
                                            Creation failed
                                        </strong>

                                        <p>
                                            {
                                                createDatasetError
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {createDatasetSuccess && (
                                <div className="import-message success">
                                    <CheckCircle2
                                        size={18}
                                    />

                                    <div>
                                        <strong>
                                            Dataset created
                                        </strong>

                                        <p>
                                            {
                                                createDatasetSuccess
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="import-modal-footer">
                            <button
                                type="button"
                                className="modal-cancel-button"
                                onClick={
                                    closeCreateDatasetModal
                                }
                                disabled={
                                    createDatasetLoading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="primary-button modal-upload-button"
                                onClick={
                                    handleCreateDataset
                                }
                                disabled={
                                    createDatasetLoading
                                }
                            >
                                {createDatasetLoading
                                    ? "Creating..."
                                    : "Create Dataset"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================
                IMPORT MODAL
            ========================= */}

            {showImportModal && (
                <div
                    className="import-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeImportModal();
                        }
                    }}
                >
                    <div className="import-modal">
                        <div className="import-modal-header">
                            <div>
                                <p className="card-eyebrow">
                                    DATA IMPORT
                                </p>

                                <h3>
                                    Import dataset
                                </h3>

                                <p>
                                    Upload a CSV or JSON
                                    file to add records
                                    to an existing
                                    dataset.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    closeImportModal
                                }
                                disabled={
                                    importLoading
                                }
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="import-modal-body">
                            <div className="import-field">
                                <label>
                                    Dataset
                                </label>

                                <select
                                    value={
                                        importDatasetId
                                    }
                                    onChange={(event) =>
                                        setImportDatasetId(
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={
                                        importLoading
                                    }
                                >
                                    {datasets.length >
                                    0 ? (
                                        datasets.map(
                                            (
                                                dataset
                                            ) => (
                                                <option
                                                    key={
                                                        dataset.id
                                                    }
                                                    value={
                                                        dataset.id
                                                    }
                                                >
                                                    {
                                                        dataset.name
                                                    }
                                                </option>
                                            )
                                        )
                                    ) : (
                                        <option value="1">
                                            Monthly Sales
                                        </option>
                                    )}
                                </select>
                            </div>

                            <div className="import-field">
                                <label>
                                    File
                                </label>

                                <label
                                    className={`file-dropzone ${
                                        selectedFile
                                            ? "has-file"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="file"
                                        accept=".csv,.json"
                                        onChange={
                                            handleFileChange
                                        }
                                        disabled={
                                            importLoading
                                        }
                                    />

                                    {selectedFile ? (
                                        <>
                                            <div className="file-drop-icon success">
                                                <CheckCircle2
                                                    size={
                                                        25
                                                    }
                                                />
                                            </div>

                                            <strong>
                                                {
                                                    selectedFile.name
                                                }
                                            </strong>

                                            <span>
                                                {(
                                                    selectedFile.size /
                                                    1024
                                                ).toFixed(
                                                    1
                                                )}{" "}
                                                KB
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="file-drop-icon">
                                                <FileUp
                                                    size={
                                                        25
                                                    }
                                                />
                                            </div>

                                            <strong>
                                                Choose a
                                                file
                                            </strong>

                                            <span>
                                                CSV or
                                                JSON ·
                                                Max file
                                                size
                                                depends on
                                                server
                                                configuration
                                            </span>
                                        </>
                                    )}
                                </label>
                            </div>

                            {importError && (
                                <div className="import-message error">
                                    <AlertCircle
                                        size={18}
                                    />

                                    <div>
                                        <strong>
                                            Import failed
                                        </strong>

                                        <p>
                                            {
                                                importError
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {importSuccess && (
                                <div className="import-message success">
                                    <CheckCircle2
                                        size={18}
                                    />

                                    <div>
                                        <strong>
                                            Import
                                            successful
                                        </strong>

                                        <p>
                                            {
                                                importSuccess
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="import-modal-footer">
                            <button
                                type="button"
                                className="modal-cancel-button"
                                onClick={
                                    closeImportModal
                                }
                                disabled={
                                    importLoading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="primary-button modal-upload-button"
                                onClick={
                                    handleImport
                                }
                                disabled={
                                    importLoading ||
                                    !selectedFile
                                }
                            >
                                <Upload size={17} />

                                {importLoading
                                    ? "Importing..."
                                    : "Import File"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;