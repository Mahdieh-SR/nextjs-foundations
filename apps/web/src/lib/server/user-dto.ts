import "server-only";
import { getUserFromDB } from "./db";

// Return only safe, public fields
export function getUserDTO(userId: string) {
  const user = getUserFromDB(userId);

  // Only return fields that are safe to expose
  return {
    id: user.id,
    name: user.name,
    createdAt: user.createdAt,
  };
}