import { useEffect, useRef } from "react";
import { socketService } from "../services/socketService";

/**
 * React hook for subscribing to Socket.IO events
 * Automatically handles cleanup on unmount
 * 
 * @param event - Socket event name to listen to
 * @param callback - Function to call when event is received
 * @param deps - Dependencies array (like useEffect)
 */
export function useSocket<T = any>(
    event: string,
    callback: (data: T) => void,
    deps: React.DependencyList = []
): { isConnected: boolean } {
    const callbackRef = useRef(callback);

    // Update callback ref when it changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        // Wrap callback to use latest version
        const eventHandler = (...args: unknown[]) => {
            callbackRef.current(args[0] as T);
        };

        // Subscribe to event
        socketService.on(event, eventHandler);

        // Cleanup: unsubscribe on unmount
        return () => {
            socketService.off(event, eventHandler);
        };
    }, [event, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        isConnected: socketService.isConnected(),
    };
}

/**
 * Hook to get socket connection status and event subscription functions
 */
export function useSocketStatus(): {
    isConnected: boolean;
    socketId: string | undefined;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback: (...args: any[]) => void) => void;
    emit: (event: string, ...args: any[]) => void;
} {
    return {
        isConnected: socketService.isConnected(),
        socketId: socketService.getSocketId(),
        on: socketService.on.bind(socketService),
        off: socketService.off.bind(socketService),
        emit: socketService.emit.bind(socketService),
    };
}
