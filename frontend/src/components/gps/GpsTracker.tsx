import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { gpsApi } from "@/services";

const INTERVAL_MS = 15000;

const GpsTracker = () => {
  const { isAuthenticated } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const eliminadoRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!navigator.geolocation) return;

    eliminadoRef.current = false;

    const eliminar = () => {
      if (!eliminadoRef.current) {
        eliminadoRef.current = true;
        gpsApi.eliminarUbicacion().catch(() => {});
      }
    };

    const enviar = () => {
      const c = lastCoordsRef.current;
      if (c) {
        gpsApi.enviarUbicacion(c.lat, c.lng).catch(() => {});
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lastCoordsRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        enviar();
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 },
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        eliminadoRef.current = false;
        lastCoordsRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        enviar();
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          eliminar();
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );

    intervalRef.current = setInterval(enviar, INTERVAL_MS);

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastCoordsRef.current = null;
    };
  }, [isAuthenticated]);

  return null;
};

export default GpsTracker;
