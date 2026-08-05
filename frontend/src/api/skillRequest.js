import api from "./auth";

// GET ALL SKILL REQUESTS
export const getSkillRequests = async () => {
    const { data } = await api.get("/skill-requests");
    return data;
};


// GET SINGLE SKILL REQUEST
export const getSkillRequest = async (id) => {
    const { data } = await api.get(`/skill-requests/${id}`);
    return data;
};


// CREATE SKILL REQUEST
export const createSkillRequest = async (requestData) => {
    const { data } = await api.post(
        "/skill-requests",
        requestData
    );

    return data;
};


// SAVE DRAFT
export const saveSkillRequestDraft = async (requestData) => {
    const { data } = await api.post(
        "/skill-requests/draft",
        requestData
    );

    return data;
};


// UPDATE REQUEST
export const updateSkillRequest = async (id, requestData) => {
    const { data } = await api.put(
        `/skill-requests/${id}`,
        requestData
    );

    return data;
};


// DELETE REQUEST
export const deleteSkillRequest = async (id) => {
    const { data } = await api.delete(
        `/skill-requests/${id}`
    );

    return data;
};