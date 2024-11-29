import * as net from "net";

export async function checkPortAvailability(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const port = startPort;
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(checkPortAvailability(port + 1)));
    server.listen(port, () => {
      server.close(() => resolve(port));
    });
  });
}

export const checkPortsRecursively = async (portList: number[], initialNumber: number): Promise<number> => {
  let unusedPort = await checkPortAvailability(initialNumber);
  for (const port of portList) {
    while (portList.includes(unusedPort)) {
      unusedPort = await checkPortAvailability(unusedPort + 1);
    }
  }
  return unusedPort;
};