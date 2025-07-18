import axiosClient, { usersUrl } from "./config"

// Define user types
export interface User {
    id: number;
    name: string;
    email: string;
    mobile: string;
    role: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    mobile: string;
    role: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    mobile?: string;
    role?: string;
}

// Create new user (registration)
export const createUser = async (userData: CreateUserRequest): Promise<User | null> => {
    try {
        console.log('Sending user creation request with data:', userData);
        
        const response = await axiosClient.post(`${usersUrl}users`, null, {
            params: {
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile,
                role: userData.role
            }
        });
        
        console.log('User creation response:', response.data);
        return response.data;
    } catch (err: any) {
        console.error('Error creating user:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
            console.error('Request config:', err.config);
        }
        return null;
    }
}

// Get user by ID
export const getUser = async (userId: number): Promise<User | null> => {
    try {
        const response = await axiosClient.get(`${usersUrl}/${userId}`);
        return response.data;
    } catch (err: any) {
        console.error('Error fetching user:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
        return null;
    }
}

// Get all users
export const getAllUsers = async (): Promise<User[] | null> => {
    try {
        const response = await axiosClient.get(`${usersUrl}users`);
        return response.data;
    } catch (err: any) {
        console.error('Error fetching users:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
        return null;
    }
}

// Update user profile
export const updateUser = async (userId: number, userData: UpdateUserRequest): Promise<User | null> => {
    try {
        const response = await axiosClient.put(`${usersUrl}users/${userId}`, null, {
            params: {
                ...userData
            }
        });
        return response.data;
    } catch (err: any) {
        console.error('Error updating user:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
        return null;
    }
}

export default { createUser, getUser, getAllUsers, updateUser };