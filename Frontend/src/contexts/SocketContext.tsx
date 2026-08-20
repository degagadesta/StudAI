import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { socketService } from "../services/socketService";
import { useAuthContext } from "./AuthContext";
import { getAccessToken } from "../api/client";

interface SocketContextType {
    isConnected: boolean;
    socketId: string | undefined;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user } = useAuthContext();
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            // Disconnect socket when user logs out or is not authenticated
            socketService.disconnect();
            setIsConnected(false);
            setSocketId(undefined);
            return;
        }

        // Small delay to ensure token is properly set after authentication
        const connectTimer = setTimeout(() => {
            // Get access token from memory (not localStorage)
            const token = getAccessToken();
            if (!token) {
                console.warn("[Socket] No access token found, waiting for auth to complete");
                return;
            }

            // Connect socket with authentication token
            console.log("[Socket] Connecting with token for user:", user.id);
            socketService.connect(token);
        }, 100);

        // Monitor connection status more efficiently using events
        let statusInterval: NodeJS.Timeout;

        const updateConnectionStatus = () => {
            setIsConnected(socketService.isConnected());
            setSocketId(socketService.getSocketId());
        };

        // Listen for connection events for immediate updates
        socketService.on('connect', updateConnectionStatus);
        socketService.on('disconnect', updateConnectionStatus);

        // Fallback polling at reduced frequency
        statusInterval = setInterval(updateConnectionStatus, 5000);

        return () => {
            clearTimeout(connectTimer);
            socketService.off('connect', updateConnectionStatus);
            socketService.off('disconnect', updateConnectionStatus);
            clearInterval(statusInterval);
        };
    }, [isAuthenticated, user]); // Added user dependency to reconnect when user changes

    return (
        <SocketContext.Provider value={{ isConnected, socketId }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocketContext() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocketContext must be used within a SocketProvider");
    }
    return context;
}
