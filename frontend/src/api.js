import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
    baseURL: `${BASE_URL}/api`,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    const activeWorkspaceId = localStorage.getItem("activeWorkspaceId");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (activeWorkspaceId) {
        config.headers["X-Tenant-ID"] = activeWorkspaceId;
    }

    return config;
});

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refresh = localStorage.getItem("refresh");

            if (!refresh) return Promise.reject(error);

            try {
                const res = await axios.post(
                    `${BASE_URL}/api/token/refresh/`,
                    { refresh }
                );

                const newAccess = res.data.access;
                localStorage.setItem("access", newAccess);

                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return API(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default API;