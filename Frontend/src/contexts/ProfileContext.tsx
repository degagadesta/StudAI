import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AcademicProfile } from "../api/Coursesapi";
import type { StudentProfile } from "../api/authApi";

interface ProfileContextType {
    cachedProfile: AcademicProfile | null;
    setCachedProfile: (profile: AcademicProfile | null) => void;
    setProfileFromAuth: (authProfile: StudentProfile | null) => void;
    clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

/**
 * Converts backend auth profile structure to frontend AcademicProfile structure
 */
function convertAuthProfileToAcademicProfile(authProfile: StudentProfile): AcademicProfile {
    return {
        university: authProfile.curriculum.department.university.name,
        department: authProfile.curriculum.department.name,
        year: authProfile.currentYear,
        semester: authProfile.currentSemester,
        currentYear: authProfile.currentYear,
        currentSemester: authProfile.currentSemester,
    };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [cachedProfile, setCachedProfileState] = useState<AcademicProfile | null>(null);

    const setCachedProfile = useCallback((profile: AcademicProfile | null) => {
        console.log('[ProfileContext] Setting cached profile:', profile);
        setCachedProfileState(profile);
    }, []);

    const setProfileFromAuth = useCallback((authProfile: StudentProfile | null) => {
        if (!authProfile) {
            console.log('[ProfileContext] Clearing profile (auth profile is null)');
            setCachedProfileState(null);
            return;
        }

        console.log('[ProfileContext] Converting auth profile to academic profile:', authProfile);
        const academicProfile = convertAuthProfileToAcademicProfile(authProfile);
        console.log('[ProfileContext] Cached academic profile:', academicProfile);
        setCachedProfileState(academicProfile);
    }, []);

    const clearProfile = useCallback(() => {
        console.log('[ProfileContext] Clearing profile cache');
        setCachedProfileState(null);
    }, []);

    return (
        <ProfileContext.Provider value={{ cachedProfile, setCachedProfile, setProfileFromAuth, clearProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfileContext() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error("useProfileContext must be used within a ProfileProvider");
    }
    return context;
}
