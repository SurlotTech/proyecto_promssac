import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Mensaje legible para errores de API o `throw` genérico. */
export function errorMessageFromUnknown(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
