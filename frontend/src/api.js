import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api"
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("datapulse_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export async function login(email, password) {
    const response = await api.post("/auth/login", {
        email,
        password
    });

    localStorage.setItem("datapulse_token", response.data.token);
    localStorage.setItem(
        "datapulse_user",
        JSON.stringify(response.data.user)
    );

    return response.data;
}

export function logout() {
    localStorage.removeItem("datapulse_token");
    localStorage.removeItem("datapulse_user");
}

export function getStoredUser() {
    const user = localStorage.getItem("datapulse_user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}

export async function getDatasetDashboard(datasetId) {
    const response = await api.get(
        `/datasets/${datasetId}/dashboard`
    );

    return response.data;
}

export default api;