import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

// LOGIN
export const login = async (email, password) => {
    const { data } = await api.post("/auth/login", {
        email,
        password,
    });

    return data;
};

// SIGNUP (We'll modify this later)
export const signup = async (userData) => {
    const { data } = await api.post("/auth/register", userData);

    return data;
};

// GET LOGGED IN USER
export const getMe = async () => {
    const { data } = await api.get("/auth/profile");

    return data;
};

// UPDATE PROFILE PICTURE
export const updateProfilePicture = async (file) => {

    const formData = new FormData();

    formData.append("profilePicture", file);


    const { data } = await api.put(
        "/auth/profile-picture",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );


    return data;
};