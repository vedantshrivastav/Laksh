import { Linking } from "react-native";
import type { Category } from "../storage/useExpenseStore";

export type DeepLinkOption = {
  name: string;
  scheme: string; // app URL scheme, tried first
  web: string; // web fallback if the app isn't installed
};

export const DEEP_LINKS: Partial<Record<Category, DeepLinkOption[]>> = {
  food: [
    { name: "Swiggy", scheme: "swiggy://", web: "https://www.swiggy.com" },
    { name: "Zomato", scheme: "zomato://", web: "https://www.zomato.com" },
  ],
  transport: [
    { name: "Uber", scheme: "uber://", web: "https://m.uber.com" },
    { name: "Ola", scheme: "olacabs://", web: "https://www.olacabs.com" },
  ],
  shopping: [
    { name: "Amazon", scheme: "amazon://", web: "https://www.amazon.in" },
  ],
};

/** Tries the app's URL scheme first, falls back to the website if the app isn't installed. */
export async function openDeepLink(option: DeepLinkOption) {
  try {
    const canOpen = await Linking.canOpenURL(option.scheme);
    await Linking.openURL(canOpen ? option.scheme : option.web);
  } catch {
    // Scheme checks can throw on some Android configs if the scheme isn't declared
    // in the app's queries manifest — web fallback keeps this from breaking silently.
    await Linking.openURL(option.web);
  }
}