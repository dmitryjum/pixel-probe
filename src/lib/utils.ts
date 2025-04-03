import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidUrl(input: string): boolean {
  try {
    const url = new URL(input)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

// Sanitize a URL by removing fragments
export function sanitizeUrl(input: string): string {
  const url = new URL(input)
  url.hash = "" // Remove fragments
  return url.toString()
}