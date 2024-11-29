import { config } from "dotenv";
import { generateWallets } from "./generateWallets";
import {
  stopDockerServices,
  allocatePorts,
  generateNodeConfigs,
  saveNodeConfigs,
  saveDockerCompose,
  startDockerServices
} from "./configs/nodeConfig";
import { getEnvironmentConfig, isValidConfig } from "./configs/envConfig";
import { startNodeCronProcess } from "./monitoring";

config();

async function main(): Promise<void> {
  const { totalNodes, seedPhrase, allowedAdmins, ipAddress } = getEnvironmentConfig();

  if (!isValidConfig(seedPhrase, totalNodes)) {
    console.error("Invalid environment configuration.");
    return;
  }

  stopDockerServices();

  const wallets = generateWallets(seedPhrase, totalNodes);
  const allPorts = await allocatePorts(totalNodes);

  const allConfigs = generateNodeConfigs(wallets, allPorts, allowedAdmins, ipAddress);

  saveNodeConfigs(allConfigs);
  const composePath = saveDockerCompose(allConfigs);

  startDockerServices(composePath);

  startNodeCronProcess()

  while (true) {
    // Keep the process running indefinitely
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch(error => {
  console.error("An error occurred:", error);
});
