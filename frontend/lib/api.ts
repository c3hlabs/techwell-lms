import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Optionally redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    register: (data: { email: string; password: string; name: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    refresh: () => api.post('/auth/refresh'),
};

// User API
export const userApi = {
    getMe: () => api.get('/users/me'),
    updateMe: (data: { name?: string; phone?: string; avatar?: string }) =>
        api.put('/users/me', data),
    getAdminStats: () => api.get('/admin/stats'),
};

export const employerApi = {
    getProfile: () => api.get('/employers/profile'),
    updateProfile: (data: unknown) => api.put('/employers/profile', data),
};

export const uploadApi = {
    upload: (formData: FormData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const searchApi = {
    global: (query: string) => api.get('/search', { params: { q: query } })
};

// Course API
export const courseApi = {
    getAll: (params?: { category?: string; search?: string; page?: number }) =>
        api.get('/courses', { params }),
    getById: (id: string) => api.get(`/courses/${id}`),
    create: (data: { title: string; description: string; category: string; price?: number }) =>
        api.post('/courses', data),
    enroll: (courseId: string) => api.post(`/courses/${courseId}/enroll`),
    getMyEnrollments: () => api.get('/courses/my/enrolled'),
    generate: (data: { topic: string; difficulty: string }) => api.post('/courses/generate', data),
    updateCurriculum: (id: string, data: { modules: unknown[] }) => api.put(`/courses/${id}/curriculum`, data),
};

// Interview API
export const interviewApi = {
    getAll: (params?: { status?: string; page?: number }) =>
        api.get('/interviews', { params }),
    getById: (id: string) => api.get(`/interviews/${id}`),
    create: (data: {
        domain: string;
        role: string;
        company?: string;
        difficulty?: string;
        jobDescription?: string;
        panelCount?: number;
        scheduledAt?: string | null;
        duration?: number;
        selectedAvatars?: string[];
        technology?: string; // Added
    }) => api.post('/interviews', data),
    start: (id: string) => api.patch(`/interviews/${id}/start`),
    complete: (id: string, data?: { score?: number }) => api.patch(`/interviews/${id}/complete`, data),
    getStats: () => api.get('/interviews/stats/summary'),
    getJobInterviews: () => api.get('/interviews/job-interviews'),
    getReport: (id: string) => api.get(`/interviews/${id}/report`),
    // AI Features
    nextQuestion: (id: string) => api.post(`/interviews/${id}/next-question`),
    submitResponse: (id: string, data: { questionId: string; answer: string }) =>
        api.post(`/interviews/${id}/response`, data),
    trainAI: (data: unknown) => api.post('/interviews/train', data),
};

// Payment API
export const paymentApi = {
    createOrder: (courseId: string, type: 'COURSE_ONLY' | 'BUNDLE' | 'INTERVIEW_ONLY' = 'COURSE_ONLY') => api.post('/payments/order', { courseId, type }),
    verifyPayment: (data: unknown) => api.post('/payments/verify', data),
};

// Certificate API
export const certificateApi = {
    // Certificates
    getAll: () => api.get('/certificates'),
    getById: (id: string) => api.get(`/certificates/${id}`),
    verify: (uniqueId: string) => api.get(`/certificates/verify/${uniqueId}`),
    generate: (data: { userId: string; courseId: string; enrollmentId: string; grade?: string; score?: number }) =>
        api.post('/certificates/generate', data),
    invalidate: (id: string) => api.put(`/certificates/${id}/invalidate`),

    // Settings
    getSettings: () => api.get('/certificates/admin/settings'),
    updateSettings: (data: {
        prefix?: string;
        yearInId?: boolean;
        sequenceDigits?: number;
        defaultSignatureUrl?: string;
        defaultSignatoryName?: string;
        defaultSignatoryTitle?: string;
        defaultValidityMonths?: number | null;
        instituteName?: string;
        instituteLogoUrl?: string;
    }) => api.put('/certificates/admin/settings', data),

    // Templates
    getTemplates: () => api.get('/certificates/admin/templates'),
    createTemplate: (data: { name: string; description?: string; designUrl: string; previewUrl?: string; isDefault?: boolean }) =>
        api.post('/certificates/admin/templates', data),
    updateTemplate: (id: string, data: { name?: string; description?: string; designUrl?: string; previewUrl?: string; isDefault?: boolean; isActive?: boolean }) =>
        api.put(`/certificates/admin/templates/${id}`, data),
    deleteTemplate: (id: string) => api.delete(`/certificates/admin/templates/${id}`),
};

export default api;
