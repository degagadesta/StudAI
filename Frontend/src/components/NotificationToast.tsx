import { useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useSocket } from "../hooks/useSocket";

interface Notification {
    id: string;
    type: "success" | "error" | "info";
    message: string;
    data?: any;
}

export default function NotificationToast() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Listen for notifications from Socket.IO
    useSocket<{ type: string; message: string; data?: any }>(
        "notification:new",
        (data) => {
            const notification: Notification = {
                id: Date.now().toString(),
                type: data.type === "error" ? "error" : data.type === "info" ? "info" : "success",
                message: data.message,
                data: data.data,
            };

            setNotifications((prev) => [...prev, notification]);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                removeNotification(notification.id);
            }, 5000);
        }
    );

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-slide-in ${notification.type === "success"
                            ? "bg-green-50 border-green-200"
                            : notification.type === "error"
                                ? "bg-red-50 border-red-200"
                                : "bg-blue-50 border-blue-200"
                        }`}
                >
                    {notification.type === "success" && (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    )}
                    {notification.type === "error" && (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    {notification.type === "info" && (
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 min-w-0">
                        <p
                            className={`text-sm font-medium ${notification.type === "success"
                                    ? "text-green-900"
                                    : notification.type === "error"
                                        ? "text-red-900"
                                        : "text-blue-900"
                                }`}
                        >
                            {notification.message}
                        </p>
                    </div>

                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
