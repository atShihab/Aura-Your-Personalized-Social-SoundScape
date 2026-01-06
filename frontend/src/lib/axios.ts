import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" 
		? "http://localhost:5000/api" 
		: `${import.meta.env.VITE_API_BASE_URL}/api`,
	withCredentials: true,
});

// Add request interceptor to include authentication token
axiosInstance.interceptors.request.use(
	async (config) => {
		try {
			// Get the token from Clerk
			const token = await (window as any).Clerk?.session?.getToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
				console.log('🔐 Added auth token to request:', config.url, 'Token:', token.substring(0, 20) + '...');
			} else {
				console.log('⚠️ No auth token available for request:', config.url);
			}
		} catch (error) {
			console.error('❌ Error getting auth token:', error);
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add response interceptor to log errors
axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		console.error('❌ API Error:', {
			url: error.config?.url,
			method: error.config?.method,
			status: error.response?.status,
			message: error.response?.data?.message || error.message
		});
		return Promise.reject(error);
	}
);
