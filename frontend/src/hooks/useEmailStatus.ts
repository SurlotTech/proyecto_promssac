import { useEffect, useState, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface EmailStatus {
  activo: boolean;
}

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

export function useEmailStatus() {
  const [activo, setActivo] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const clientRef = useRef<Client | null>(null);
  const mountedRef = useRef(true);
  const reconnectAttempts = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxReconnectAttempts = 5;

  const cancelarReconexion = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const programarReconexion = useCallback((token: string) => {
    if (!mountedRef.current) return;
    if (!token || reconnectAttempts.current >= maxReconnectAttempts) {
      setConnectionState("error");
      return;
    }
    const delay = Math.min(
      2000 * Math.pow(2, reconnectAttempts.current),
      30_000
    );
    reconnectAttempts.current += 1;
    cancelarReconexion();
    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setConnectionState("connecting");
        clientRef.current?.deactivate();
        conectar();
      }
    }, delay);
  }, [cancelarReconexion]);

  const conectar = useCallback(() => {
    const base = import.meta.env.VITE_API_BASE ?? "";
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setConnectionState("error");
      return;
    }

    cancelarReconexion();
    setConnectionState("connecting");
    clientRef.current?.deactivate();

    const client = new Client({
      webSocketFactory: () => new SockJS(`${base}/ws?token=${encodeURIComponent(token)}`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      reconnectDelay: 0,
      onConnect: () => {
        if (!mountedRef.current) return;
        reconnectAttempts.current = 0;
        setConnectionState("connected");
        client.subscribe("/topic/email-status", (message) => {
          if (!mountedRef.current) return;
          try {
            const body: EmailStatus = JSON.parse(message.body);
            setActivo(body.activo);
          } catch {}
        });
      },
      onDisconnect: () => {
        if (!mountedRef.current) return;
        programarReconexion(token);
      },
      onStompError: (frame) => {
        if (!mountedRef.current) return;
        const msg = frame.headers?.message ?? "";
        if (msg.includes("autenticacion") || msg.includes("invalido") || msg.includes("expirado") || msg.includes("Sesion")) {
          setConnectionState("error");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          window.location.href = "/login?reason=token_expired";
          return;
        }
        programarReconexion(token);
      },
      onWebSocketError: () => {
        if (!mountedRef.current) return;
        programarReconexion(token);
      },
    });

    clientRef.current = client;
    client.activate();
  }, [programarReconexion]);

  useEffect(() => {
    mountedRef.current = true;
    conectar();
    return () => {
      mountedRef.current = false;
      cancelarReconexion();
      clientRef.current?.deactivate();
    };
  }, []);

  const conectado = connectionState === "connected";
  const error = connectionState === "error";

  return { activo, conectado, error, connectionState };
}
