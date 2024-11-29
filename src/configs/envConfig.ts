export interface EnvironmentConfig {
  totalNodes: number;
  seedPhrase: string;
  allowedAdmins: string;
  ipAddress: string;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    totalNodes: parseInt(process.env.TOTAL_NODES || "0"),
    seedPhrase: process.env.SEED_PHRASE || "",
    allowedAdmins: process.env.ALLOWED_ADMINS || "[]",
    ipAddress: process.env.IP_ADDRESS || ""
  };
}

export function isValidConfig(seedPhrase: string, totalNodes: number): boolean {
  return seedPhrase !== "" && totalNodes > 0;
}