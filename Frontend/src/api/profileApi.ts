import { api } from "./client";

/**
 * Full profile response structure
 */
export interface FullProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    subscriptionPlan: string;
    isGoogleUser: boolean;
    profile: {
        id: string;
        currentYear: number;
        currentSemester: number;
        curriculum: {
            id: string;
            label: string;
        };
        department: {
            id: string;
            name: string;
        };
        university: {
            id: string;
            name: string;
            city: string;
        };
    };
}

/**
 * Basic update payload (name only)
 */
export interface UpdateBasicProfilePayload {
    firstName: string;
    lastName: string;
}

/**
 * Basic update response
 */
export interface UpdateBasicProfileResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

/**
 * Academic update payload (year/semester)
 */
export interface UpdateAcademicProfilePayload {
    currentYear: number;
    currentSemester: number;
}

/**
 * Academic update response
 */
export interface UpdateAcademicProfileResponse {
    success: boolean;
    message: string;
    data: {
        currentYear: number;
        currentSemester: number;
        coursesAvailable: number;
        courseSelectionsCleared: boolean;
        curriculum: string;
        department: string;
        university: string;
    };
    warning?: string;
}

/**
 * Delete account payload
 */
export interface DeleteAccountPayload {
    password: string;
    confirmDelete: string;
}

/**
 * Get full profile including basic and academic information
 */
export async function getFullProfile(): Promise<FullProfile> {
    const res = await api.get<{ success: boolean; data: FullProfile }>(
        "/academic-profile/full"
    );
    return res.data.data;
}

/**
 * Update basic profile information (name)
 */
export async function updateBasicProfile(
    payload: UpdateBasicProfilePayload
): Promise<UpdateBasicProfileResponse> {
    const res = await api.patch<UpdateBasicProfileResponse>(
        "/academic-profile/basic",
        payload
    );
    return res.data;
}

/**
 * Update academic information (year/semester)
 * Warning: This will clear all course selections if year or semester changes
 */
export async function updateAcademicProfile(
    payload: UpdateAcademicProfilePayload
): Promise<UpdateAcademicProfileResponse> {
    const res = await api.patch<UpdateAcademicProfileResponse>(
        "/academic-profile/academic",
        payload
    );
    return res.data;
}

/**
 * Delete user account permanently
 * This action cannot be undone
 */
export async function deleteAccount(
    payload: DeleteAccountPayload
): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<{ success: boolean; message: string }>(
        "/auth/account",
        { data: payload }
    );
    return res.data;
}
