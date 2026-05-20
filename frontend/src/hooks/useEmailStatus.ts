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
  const maxReconnectDelay = 60_000;

  const conectar = useCallback(() => {
    const base = import.meta.env.VITE_API_BASE ?? "";
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setConnectionState("error");
      return;
    }

    setConnectionState("connecting");
    reconnectAttempts.current = 0;

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
          } catch {
            /* ignore malformed messages */
          }
        });
      },
      onDisconnect: () => {
        if (!mountedRef.current) return;
        setConnectionState("disconnected");
        programarReconexion(token);
      },
      onStompError: (frame) => {
        if (!mountedRef.current) return;
        const isAuthError = frame.headers?.message?.includes?.("autenticacion")
          || frame.headers?.message?.includes?.("invalido");
        if (isAuthError) {
          setConnectionState("error");
          return;
        }
        setConnectionState("disconnected");
        programarReconexion(token);
      },
      onWebSocketError: () => {
        if (!mountedRef.current) return;
        setConnectionState("disconnected");
        programarReconexion(token);
      },
    });

    clientRef.current = client;
    client.activate();
  }, []);

  const programarReconexion = useCallback((token: string) => {
    if (!mountedRef.current) return;
    if (!token) {
      setConnectionState("error");
      return;
    }
    const delay = Math.min(
      2000 * Math.pow(2, reconnectAttempts.current),
      maxReconnectDelay
    );
    reconnectAttempts.current += 1;
    setTimeout(() => {
      if (mountedRef.current && clientRef.current) {
        setConnectionState("connecting");
        clientRef.current.activate();
      }
    }, delay);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    conectar();
    return () => {
      mountedRef.current = false;
      clientRef.current?.deactivate();
    };
  }, [conectar]);

  const conectado = connectionState === "connected";
  const error = connectionState === "error";

  return { activo, conectado, error, connectionState };
}
