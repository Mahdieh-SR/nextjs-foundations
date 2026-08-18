import "server-only";

// Simulate a database call that uses server secrets
export function getUserFromDB(userId: string) {
  // In real code, this would use process.env.DATABASE_URL
  // The INTERNAL_CONFIG demonstrates server-only variable access
  const config = process.env.INTERNAL_CONFIG ?? "default";

  // Simulated database response with sensitive fields
  return {
    id: userId,
    email: "user@example.com",
    passwordHash: "bcrypt$2b$10$...", // NEVER expose this
    internalNotes: `VIP customer (config: ${config})`, // NEVER expose this
    name: "Jane Developer",
    createdAt: new Date().toISOString(),
  };
}