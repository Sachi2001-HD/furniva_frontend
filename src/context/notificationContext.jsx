import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./authContext";
import { apiRequest } from "../utils/api";

const NotificationContext = createContext(null);

const POLL_MS = 45000; 

export function NotificationProvider({ children }) {
  const { token, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState("idle"); 

  const latest = useRef({});
  latest.current = { token, logout, notifications, unreadCount };

  const pending = useRef(0);

  const refresh = useCallback(async () => {
    const current = latest.current.token;
    if (!current) return;

    try {
      const data = await apiRequest("/notifications", { token: current });

      if (latest.current.token !== current || pending.current > 0) return;

      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
      setStatus("ready");
    } catch (error) {
      if (error.status === 401) {
        latest.current.logout();
        return;
      }
      setStatus((previous) => (previous === "ready" ? previous : "error"));
    }
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    refresh();
  }, [refresh]);

  useEffect(() => {
    setNotifications([]);
    setUnreadCount(0);

    if (!token) {
      setStatus("idle");
      return undefined;
    }

    setStatus("loading");
    refresh();

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token, refresh]);

  const send = useCallback(
    async (path, method) => {
      let outcome = "ok";
      pending.current += 1;

      try {
        await apiRequest(path, { method, token: latest.current.token });
      } catch (error) {
        outcome = error.status === 401 ? "signedOut" : "failed";
      } finally {
        pending.current -= 1;
      }

      if (outcome === "signedOut") latest.current.logout();
      else if (outcome === "failed") refresh(); 
    },
    [refresh]
  );

  const markRead = useCallback(
    (id) => {
      const target = latest.current.notifications.find((item) => item._id === id);
      if (!target || target.isRead) return;

      setNotifications((previous) =>
        previous.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      send(`/notifications/${id}/read`, "PATCH");
    },
    [send]
  );

  const markAllRead = useCallback(() => {
    if (latest.current.unreadCount === 0) return;

    setNotifications((previous) => previous.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    send("/notifications/read-all", "PATCH");
  }, [send]);

  const remove = useCallback(
    (id) => {
      const target = latest.current.notifications.find((item) => item._id === id);
      if (!target) return;

      setNotifications((previous) => previous.filter((item) => item._id !== id));
      if (!target.isRead) setUnreadCount((count) => Math.max(0, count - 1));
      send(`/notifications/${id}`, "DELETE");
    },
    [send]
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    send("/notifications", "DELETE");
  }, [send]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      status,
      refresh,
      retry,
      markRead,
      markAllRead,
      remove,
      clearAll,
    }),
    [notifications, unreadCount, status, refresh, retry, markRead, markAllRead, remove, clearAll]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside <NotificationProvider>");
  }

  return context;
}