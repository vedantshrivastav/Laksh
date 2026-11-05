import { Alert } from "react-native";

/**
 * Returns a handler for a failed store action, to use with .catch():
 *   addGoal({...}).catch(alertError("Couldn't create goal"));
 */
export const alertError = (title: string) => (e: unknown) =>
  Alert.alert(title, e instanceof Error ? e.message : "Please try again.");