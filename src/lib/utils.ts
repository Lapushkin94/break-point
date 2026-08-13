import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year.slice(2)}`;
}
