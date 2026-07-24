import { type ClassValue, clsx } from "clsx";
import { twilightMerge, twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
