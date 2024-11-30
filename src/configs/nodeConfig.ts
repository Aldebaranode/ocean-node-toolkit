import { checkPortsRecursively } from "../checkPortAvailability";
import { generateDockerCompose } from "../generateDockerCompose";
import { join } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const outputDir: string = "output";
const prefix: string = "ocean-node-generated"

export function stopDockerServices(): void {
  try {
    console.log("Stopping any running Docker Compose services in the output directory...");
    execSync(`docker-compose -f ${join(outputDir, "docker-compose.yml")} down`, { stdio: 'inherit' });
    console.log("Docker Compose services stopped successfully.");
  } catch (error) {
    console.error("Failed to stop Docker Compose services:", error);
  }
}

export async function allocatePorts(totalNodes: number): Promise<number[][]> {
  const basePort = 3000;
  const allPorts: number[][] = [];
  for (let i = 0; i < totalNodes; i++) {
    const nodePorts: number[] = [];
    for (let j = 0; j < 5; j++) {
      const lastPort = basePort + (j * 1000);
      nodePorts.push(await checkPortsRecursively(allPorts.flat(), lastPort + i));
    }
    allPorts.push(nodePorts);
  }
  return allPorts;
}

export interface NodeConfig {
  node_name: string;
  container_name: string;
  image: string;
  ports: number[];
  environment: {
    PRIVATE_KEY: string;
    ALLOWED_ADMINS: string[];
    IP_ADDRESS: string;
  };
}

export function generateNodeConfigs(wallets: string[], allPorts: number[][], allowedAdmins: string, ipAddress: string): NodeConfig[] {
  return wallets.map((privateKey, index) => ({
    node_name: `${prefix}-${index}`,
    container_name: `${prefix}-${index}`,
    image: "oceanprotocol/ocean-node:latest",
    ports: allPorts[index],
    environment: {
      PRIVATE_KEY: privateKey,
      ALLOWED_ADMINS: JSON.parse(allowedAdmins),
      IP_ADDRESS: ipAddress,
    },
  }));
}

export function saveNodeConfigs(allConfigs: NodeConfig[]): void {
  mkdirSync(outputDir, { recursive: true });
  const configPath = join(outputDir, "node_configs.json");
  writeFileSync(configPath, JSON.stringify(allConfigs, null, 4), "utf-8");
  console.log(`All node configurations have been written to: ${configPath}`);
}

export function saveDockerCompose(allConfigs: NodeConfig[]): string {
  const dockerCompose = generateDockerCompose(allConfigs);
  const composePath = join(outputDir, "docker-compose.yml");
  writeFileSync(composePath, dockerCompose);
  console.log("Docker Compose file has been generated and saved to: " + composePath);
  return composePath;
}

export function startDockerServices(composePath: string): void {
  try {
    console.log("Starting Docker Compose services...");
    execSync(`docker-compose -f ${composePath} up -d`, { stdio: 'inherit' });
    console.log("Docker Compose services started successfully.");
  } catch (error) {
    console.error("Failed to start Docker Compose services:", error);
  }
}

export function restartNode(containerName: string): void {
  try {
    console.log(`Restarting node with container name: ${containerName}...`);
    execSync(`docker restart ${containerName}`, { stdio: 'inherit' });
    console.log(`Node with container name ${containerName} restarted successfully.`);
  } catch (error) {
    console.error(`Failed to restart node with container name ${containerName}:`, error);
  }
}

export function getContainerName(port: number): string | null {
  try {
    const command = `docker container ls --filter "publish=${port}" --format "{{.Names}}"`;
    const containerName = execSync(command, { encoding: 'utf-8' }).trim();
    return containerName || null;
  } catch (error) {
    console.error(`Failed to get container name for port ${port}:`, error);
    return null;
  }
}
