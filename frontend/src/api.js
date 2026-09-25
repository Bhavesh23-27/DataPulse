import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// =========================
// AUTH
// =========================

export async function loginUser(email, password) {
    const response = await api.post("/auth/login", {
        email,
        password
    });

    return response.data;
}

export async function login(email, password) {
    const data = await loginUser(email, password);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
}

export async function getCurrentUser() {
    const response = await api.get("/auth/me");

    return response.data;
}

export function getStoredUser() {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch (error) {
        console.error("Failed to read stored user:", error);

        localStorage.removeItem("user");

        return null;
    }
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

// =========================
// ANALYTICS
// =========================

export async function getDashboard(datasetId) {
    const response = await api.get(
        `/datasets/${datasetId}/dashboard`
    );

    return response.data;
}

export async function getDatasetDashboard(datasetId) {
    return getDashboard(datasetId);
}

// =========================
// DATASETS
// =========================

export async function getDatasets() {
    const response = await api.get("/datasets");

    return response.data;
}

export async function getDatasetById(datasetId) {
    const response = await api.get(
        `/datasets/${datasetId}`
    );

    return response.data;
}

export async function createDataset(dataset) {
    const response = await api.post(
        "/datasets",
        dataset
    );

    return response.data;
}

export async function updateDataset(datasetId, dataset) {
    const response = await api.put(
        `/datasets/${datasetId}`,
        dataset
    );

    return response.data;
}

export async function deleteDataset(datasetId) {
    const response = await api.delete(
        `/datasets/${datasetId}`
    );

    return response.data;
}

export default api;