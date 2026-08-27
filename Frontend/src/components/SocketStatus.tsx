import { useSocketContext } from "../contexts/SocketContext";
import { Wifi, WifiOff } from "lucide-react";

export default function SocketStatus() {
    const { isConnected } = useSocketContext();

    if (isConnected) {
        return (
            <div className="flex items-center gap-2 text-xs text-green-600">
                <Wifi size={14} />
                <span className="hidden sm:inline">Real-time connected</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs text-orange-600">
            <WifiOff size={14} />
            <span className="hidden sm:inline">Reconnecting...</span>
        </div>
    );
}
