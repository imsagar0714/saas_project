import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
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

            if (!refresh) {
                return Promise.reject(error);
            }

            try {
                const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
                    refresh: refresh,
                });

                const newAccess = res.data.access;
                localStorage.setItem("access", newAccess);

                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return API(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("activeWorkspaceId");
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default API;