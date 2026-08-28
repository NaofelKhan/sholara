import api from "./auth";

// Courses API
export const getCourses = async () => {
  const { data } = await api.get("/courses");
  return data;
};

export const createCourse = async (courseData) => {
  const { data } = await api.post("/courses", courseData);
  return data;
};

export const joinCourse = async (joinCode) => {
  const { data } = await api.post("/courses/join", { joinCode });
  return data;
};

export const getCourseById = async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
};

export const removeMember = async (courseId, studentId) => {
  const { data } = await api.delete(`/courses/${courseId}/members/${studentId}`);
  return data;
};

// Learning Materials API
export const getMaterials = async (courseId) => {
  const { data } = await api.get(`/courses/${courseId}/materials`);
  return data;
};

export const createMaterial = async (courseId, materialData) => {
  const { data } = await api.post(`/courses/${courseId}/materials`, materialData);
  return data;
};

export const deleteMaterial = async (courseId, materialId) => {
  const { data } = await api.delete(`/courses/${courseId}/materials/${materialId}`);
  return data;
};

// Assignments API
export const getAssignments = async (courseId) => {
  const { data } = await api.get(`/courses/${courseId}/assignments`);
  return data;
};

export const createAssignment = async (courseId, assignmentData) => {
  const { data } = await api.post(`/courses/${courseId}/assignments`, assignmentData);
  return data;
};

export const submitAssignment = async (courseId, assignmentId, submissionData) => {
  const { data } = await api.post(
    `/courses/${courseId}/assignments/${assignmentId}/submit`,
    submissionData
  );
  return data;
};

export const gradeSubmission = async (courseId, assignmentId, gradeData) => {
  const { data } = await api.put(
    `/courses/${courseId}/assignments/${assignmentId}/grade`,
    gradeData
  );
  return data;
};

// Discussions API
export const getDiscussions = async (courseId) => {
  const { data } = await api.get(`/courses/${courseId}/discussions`);
  return data;
};

export const createDiscussion = async (courseId, discussionData) => {
  const { data } = await api.post(`/courses/${courseId}/discussions`, discussionData);
  return data;
};

export const addReply = async (courseId, discussionId, replyData) => {
  const { data } = await api.post(
    `/courses/${courseId}/discussions/${discussionId}/reply`,
    replyData
  );
  return data;
};

// Attendance API
export const getAttendance = async (courseId) => {
  const { data } = await api.get(`/courses/${courseId}/attendance`);
  return data;
};

export const markAttendance = async (courseId, attendanceData) => {
  const { data } = await api.post(`/courses/${courseId}/attendance`, attendanceData);
  return data;
};

// Grades API
export const getGrades = async (courseId) => {
  const { data } = await api.get(`/courses/${courseId}/grades`);
  return data;
};
