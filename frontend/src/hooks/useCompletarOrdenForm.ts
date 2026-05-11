import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import type { RoutePriority } from "@/domain/routes";
import {
  COMPLETAR_ORDEN_STEPS,
  customFieldKeys,
  type CustomFieldKey,
} from "@/lib/completarOrden/constants";
import { buildOrderCompletePayload } from "@/lib/completarOrden/buildOrderCompletePayload";
import { completarFormSnapshotFromOrder } from "@/lib/completarOrden/hydrateFromOrder";
import {
  canFinalizeCompletarOrdenWizard,
  firstBlockingStepAmong012,
  isCompletarStepValid,
  messageForBlockingStepAmong012,
  messageWhenCurrentStepInvalid,
  describePersonalizadosStepError,
  type CompletarStepContext,
} from "@/lib/completarOrden/stepValidation";
import { LIMA_CENTER } from "@/domain/fleet";
import { errorMessageFromUnknown } from "@/lib/utils";
import { geocodificacionApi } from "@/services/geocodificacion.api";
import {
  clearOrderDraft,
  persistOrderDraft,
  readOrderDraft,
  type OrderCompletarLocationState,
  type OrderCreationDraft,
  type OrderProductsLocationState,
} from "@/lib/orderCreationDraft";
import { consultasApi } from "@/services/consultas.api";
import { ordersApi } from "@/services/orders.api";
import { toast } from "sonner";
import { sanitizePeruNineDigitPhoneInput } from "@/lib/completarOrden/contactValidation";

function emptyCustomFields(): Record<CustomFieldKey, string> {
  return Object.fromEntries(customFieldKeys.map((k) => [k, ""])) as Record<CustomFieldKey, string>;
}

const FORM_CACHE_KEY = "completar_orden_form_cache";

type FormCache = {
  orderId: string;
  deliveryFrom: string;
  deliveryTo: string;
  mode: string;
  priority: string;
  cod: boolean;
  contactName: string;
  contactPhone: string;
  contactIdentifier: string;
  contactEmail: string;
  idType: string;
  addressLine: string;
  normalizedAddress: string;
  serviceMinutes: string;
  addressReference: string;
  lat: string;
  lng: string;
  customFields: Record<string, string>;
};

function saveFormCache(orderId: string, data: Omit<FormCache, "orderId">) {
  try {
    sessionStorage.setItem(FORM_CACHE_KEY, JSON.stringify({ orderId, ...data }));
  } catch {/* ignore */}
}

function readFormCache(orderId: string): FormCache | null {
  try {
    const raw = sessionStorage.getItem(FORM_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FormCache;
    return parsed.orderId === orderId ? parsed : null;
  } catch {
    return null;
  }
}

function clearFormCache() {
  try { sessionStorage.removeItem(FORM_CACHE_KEY); } catch {/* ignore */}
}

export function useCompletarOrdenForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [draft, setDraft] = useState<OrderCreationDraft | null>(null);

  const [deliveryFrom, setDeliveryFrom] = useState("");
  const [deliveryTo, setDeliveryTo] = useState("");
  const [mode, setMode] = useState("default");
  const [priority, setPriority] = useState<RoutePriority>("medium");
  const [cod, setCod] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactIdentifier, setContactIdentifier] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [addressLine, setAddressLine] = useState("");
  const [normalizedAddress, setNormalizedAddress] = useState("");
  const [serviceMinutes, setServiceMinutes] = useState("15");
  const [addressReference, setAddressReference] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [customFields, setCustomFields] = useState<Record<CustomFieldKey, string>>(emptyCustomFields);

  const [idType, setIdType] = useState("dni");
  const [consultandoDocumento, setConsultandoDocumento] = useState(false);
  const [geocodificandoMapa, setGeocodificandoMapa] = useState(false);
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const [hydratingOrder, setHydratingOrder] = useState(false);

  useEffect(() => {
    const state = location.state as OrderCompletarLocationState | null;
    const fromNav = state?.orderDraft;
    const fromStorage = readOrderDraft();
    const d = fromNav ?? fromStorage;
    if (!d?.displayOrderId) {
      toast.error("No hay datos de orden. Crea una orden primero.");
      navigate("/ordenes", { replace: true });
      return;
    }
    setDraft(d);
    if (fromNav) persistOrderDraft(fromNav);
  }, [location, navigate]);

  /** Vuelta desde Productos u otra ruta: posicionar el paso solicitado una sola vez. */
  useEffect(() => {
    const state = location.state as OrderCompletarLocationState | null;
    const raw = state?.resumeStep;
    if (typeof raw !== "number" || Number.isNaN(raw)) return;

    const max = COMPLETAR_ORDEN_STEPS.length - 1;
    const step = Math.max(0, Math.min(max, raw));
    setCurrentStep(step);
    setCompletedSteps(() => Array.from({ length: step }, (_, i) => i));
  }, [location.key, location.pathname, location.state]);

  useEffect(() => {
    const id = draft?.displayOrderId?.trim();
    if (!id) return;

    // Si hay datos en caché (p.ej. al volver de OrdenProductos), restaurar sin llamar al API
    const cached = readFormCache(id);
    if (cached) {
      setDeliveryFrom(cached.deliveryFrom);
      setDeliveryTo(cached.deliveryTo);
      setMode(cached.mode);
      setPriority(cached.priority as RoutePriority);
      setCod(cached.cod);
      setContactName(cached.contactName);
      setContactPhone(cached.contactPhone);
      setContactIdentifier(cached.contactIdentifier);
      setContactEmail(cached.contactEmail);
      setIdType(cached.idType);
      setAddressLine(cached.addressLine);
      setNormalizedAddress(cached.normalizedAddress);
      setServiceMinutes(cached.serviceMinutes);
      setAddressReference(cached.addressReference);
      const cachedCf = cached.customFields as Record<CustomFieldKey, string>;
      setCustomFields({
        ...emptyCustomFields(),
        ...cachedCf,
        telefono_director: sanitizePeruNineDigitPhoneInput(cachedCf.telefono_director ?? ""),
      });
      if (cached.lat.trim() && cached.lng.trim()) {
        setLat(cached.lat);
        setLng(cached.lng);
      }
      return; // No llamar al API
    }

    let cancelled = false;
    setHydratingOrder(true);
    ordersApi
      .getByNumero(id)
      .then((order) => {
        if (cancelled) return;
        const snap = completarFormSnapshotFromOrder(order);
        setDeliveryFrom(snap.deliveryFrom);
        setDeliveryTo(snap.deliveryTo);
        setMode(snap.mode);
        setPriority(snap.priority);
        setCod(snap.cod);
        setContactName(snap.contactName);
        setContactPhone(snap.contactPhone);
        setContactIdentifier(snap.contactIdentifier);
        setContactEmail(snap.contactEmail);
        setIdType(snap.idType);
        setAddressLine(snap.addressLine);
        setNormalizedAddress(snap.normalizedAddress);
        setServiceMinutes(snap.serviceMinutes);
        setAddressReference(snap.addressReference);
        setCustomFields(snap.customFields);
        if (snap.lat.trim() && snap.lng.trim()) {
          setLat(snap.lat);
          setLng(snap.lng);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          toast.error(errorMessageFromUnknown(e, "No se pudieron cargar los datos guardados de la orden."));
        }
      })
      .finally(() => {
        if (!cancelled) setHydratingOrder(false);
      });
    return () => {
      cancelled = true;
    };
  }, [draft?.displayOrderId]);

  const lowAddressConfidence = useMemo(() => {
    const t = addressLine.trim();
    return t.length > 0 && t.length < 12;
  }, [addressLine]);

  const stepCtx: CompletarStepContext = useMemo(
    () => ({
      draft,
      deliveryFrom,
      deliveryTo,
      mode,
      contactName,
      contactIdentifier,
      contactPhone,
      contactEmail,
      idType,
      addressLine,
      lat,
      lng,
      customFields,
    }),
    [
      draft,
      deliveryFrom,
      deliveryTo,
      mode,
      contactName,
      contactIdentifier,
      contactPhone,
      contactEmail,
      idType,
      addressLine,
      lat,
      lng,
      customFields,
    ],
  );

  useEffect(() => {
    if (currentStep !== 1) return;
    if (idType !== "dni" && idType !== "ruc") return;
    const num = contactIdentifier.trim();
    if (idType === "dni" && num.length !== 8) return;
    if (idType === "ruc" && num.length !== 11) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setConsultandoDocumento(true);
      try {
        const res = idType === "dni" ? await consultasApi.dni(num) : await consultasApi.ruc(num);
        if (cancelled) return;
        if (!res.exito) {
          toast.error(res.mensaje ?? "No se encontró el documento.");
          return;
        }
        if (res.nombreMostrar?.trim()) {
          setContactName(res.nombreMostrar.trim());
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(errorMessageFromUnknown(e, "Error al consultar el documento."));
        }
      } finally {
        if (!cancelled) setConsultandoDocumento(false);
      }
    }, 550);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [contactIdentifier, currentStep, idType]);

  /** Dirección y coords desde el mapa (inversa Nominatim); no usa datos del DNI/RUC. */
  const aplicarUbicacionEnMapa = useCallback(async (lat: number, lng: number) => {
    setGeocodificandoMapa(true);
    try {
      const r = await geocodificacionApi.reversa(lat, lng);
      setLat(r.lat.toFixed(6));
      setLng(r.lon.toFixed(6));
      setAddressLine(r.displayName);
      setNormalizedAddress(r.displayName);
    } catch (e) {
      toast.error(errorMessageFromUnknown(e, "No se pudo obtener la dirección en ese punto."));
      setLat(lat.toFixed(6));
      setLng(lng.toFixed(6));
      setAddressLine(`Ubicación ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setNormalizedAddress("");
    } finally {
      setGeocodificandoMapa(false);
    }
  }, []);

  /** Primera vez en el paso Dirección: punto inicial en Lima y texto desde geocodificación inversa. */
  useEffect(() => {
    if (currentStep !== 2) return;
    if (lat.trim() && lng.trim()) return;
    void aplicarUbicacionEnMapa(LIMA_CENTER[0], LIMA_CENTER[1]);
  }, [currentStep, lat, lng, aplicarUbicacionEnMapa]);

  const buscarDireccionPorTexto = useCallback(async () => {
    const t = addressLine.trim();
    if (t.length < 4) {
      toast.message("Escribe al menos 4 caracteres para buscar en el mapa.");
      return;
    }
    setGeocodificandoMapa(true);
    try {
      const r = await geocodificacionApi.buscar(t);
      setLat(r.lat.toFixed(6));
      setLng(r.lon.toFixed(6));
      setAddressLine(r.displayName);
      setNormalizedAddress(r.displayName);
    } catch (e) {
      toast.error(errorMessageFromUnknown(e, "No se encontró esa dirección."));
    } finally {
      setGeocodificandoMapa(false);
    }
  }, [addressLine]);

  const handleBackToList = useCallback(() => {
    navigate("/ordenes");
  }, [navigate]);

  const validateStep = useCallback(
    (step: number): boolean => isCompletarStepValid(step, stepCtx),
    [stepCtx],
  );

  const handleNext = useCallback(() => {
    if (!validateStep(currentStep)) {
      toast.error(messageWhenCurrentStepInvalid(currentStep, stepCtx));
      return;
    }
    setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
    if (currentStep < COMPLETAR_ORDEN_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, stepCtx, validateStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSave = useCallback(async () => {
    const blocked = firstBlockingStepAmong012(stepCtx);
    if (blocked !== null) {
      toast.error(messageForBlockingStepAmong012(blocked, stepCtx));
      return;
    }
    const pfErr = describePersonalizadosStepError(customFields);
    if (pfErr) {
      toast.error(pfErr);
      return;
    }
    if (!draft) return;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      toast.error("Ubicación incompleta: usa el mapa o la búsqueda por dirección.");
      return;
    }

    setGuardandoOrden(true);
    try {
      await ordersApi.completarDatos(
        buildOrderCompletePayload({
          draft,
          contactName,
          contactIdentifier,
          contactPhone,
          contactEmail,
          addressLine,
          normalizedAddress,
          serviceMinutes,
          addressReference,
          latNum,
          lngNum,
          deliveryFrom,
          deliveryTo,
          mode,
          priority,
          cod,
          customFields,
        }),
      );
      await queryClient.invalidateQueries({ queryKey: ["ordenes"] });
      clearOrderDraft();
      clearFormCache();
      toast.success(`Orden ${draft.displayOrderId} guardada correctamente.`);
      navigate("/ordenes", { replace: true });
    } catch (e) {
      toast.error(errorMessageFromUnknown(e, "No se pudo guardar la orden."));
    } finally {
      setGuardandoOrden(false);
    }
  }, [
    addressLine,
    addressReference,
    contactEmail,
    contactIdentifier,
    contactName,
    contactPhone,
    customFields,
    deliveryFrom,
    deliveryTo,
    draft,
    lat,
    lng,
    mode,
    navigate,
    normalizedAddress,
    priority,
    cod,
    queryClient,
    serviceMinutes,
    stepCtx,
  ]);

  const goToProductos = useCallback(() => {
    if (!draft) return;
    // Guardar el estado actual en caché antes de navegar a productos
    saveFormCache(draft.displayOrderId, {
      deliveryFrom, deliveryTo, mode, priority, cod,
      contactName, contactPhone, contactIdentifier, contactEmail, idType,
      addressLine, normalizedAddress, serviceMinutes, addressReference,
      lat, lng, customFields,
    });
    const state: OrderProductsLocationState = { displayOrderId: draft.displayOrderId };
    navigate("/ordenes/productos", { state });
  }, [draft, navigate, deliveryFrom, deliveryTo, mode, priority, cod, contactName, contactPhone, contactIdentifier, contactEmail, idType, addressLine, normalizedAddress, serviceMinutes, addressReference, lat, lng, customFields]);

  const onDeliveryRangeChange = useCallback((from: string, to: string) => {
    setDeliveryFrom(from);
    setDeliveryTo(to);
  }, []);

  const canSave = canFinalizeCompletarOrdenWizard(stepCtx);

  return {
    draft,
    steps: COMPLETAR_ORDEN_STEPS,
    currentStep,
    setCurrentStep,
    completedSteps,
    deliveryFrom,
    deliveryTo,
    onDeliveryRangeChange,
    mode,
    setMode,
    priority,
    setPriority,
    cod,
    setCod,
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,
    contactIdentifier,
    setContactIdentifier,
    contactEmail,
    setContactEmail,
    addressLine,
    setAddressLine,
    normalizedAddress,
    setNormalizedAddress,
    serviceMinutes,
    setServiceMinutes,
    addressReference,
    setAddressReference,
    lat,
    setLat,
    lng,
    setLng,
    customFields,
    setCustomFields,
    idType,
    setIdType,
    consultandoDocumento,
    geocodificandoMapa,
    guardandoOrden,
    hydratingOrder,
    lowAddressConfidence,
    handleBackToList,
    aplicarUbicacionEnMapa,
    buscarDireccionPorTexto,
    validateStep,
    handleNext,
    handlePrevious,
    handleSave,
    goToProductos,
    canSave,
  };
}
