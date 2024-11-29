import * as cron from 'node-cron';
import { sendAlert } from './configs/alertConfig';
import { getContainerName, restartNode } from './configs/nodeConfig';

interface NodeLocation {
  country: string;
  city: string;
  ip: string;
  lon: number;
  id: string;
  lat: number;
}

interface IpAndDns {
  ip: string;
  dns: string | null;
  port: number;
  relay: boolean;
  relayNode: string | null;
}

interface Indexer {
  chainId: string;
  network: string;
  block: string;
}

interface Platform {
  cpus: number;
  freemem: number;
  totalmem: number;
  loadavg: [number, number, number];
  arch: string;
  machine: string;
  platform: string;
  osType: string;
  node: string;
}

interface Provider {
  chainId: string;
  network: string;
}

interface SupportedStorage {
  url: boolean;
  arwave: boolean;
  ipfs: boolean;
}

interface NodeSource {
  id: string;
  location: NodeLocation;
  ipAndDns: IpAndDns;
  eligible: boolean;
  uptime: number;
  lastCheck: number;
  address: string;
  allowedAdmins: string[];
  codeHash: string;
  http: boolean;
  p2p: boolean;
  indexer: Indexer[];
  platform: Platform;
  provider: Provider[];
  publicKey: string;
  supportedStorage: SupportedStorage;
  version: string;
}

interface FetchNodeResponse {
  _index: string;
  _id: string;
  _score: number | null;
  _source: NodeSource;
  sort: number[];
}

async function fetchNodeData(totalNodes: number, ipAddress: string): Promise<FetchNodeResponse[]> {
  const url = `https://incentive-backend.oceanprotocol.com/nodes?page=1&size=${totalNodes}&search=${ipAddress}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch node data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching node data:", error);
    throw error;
  }
}

async function monitorNodes() {
  try {
    const totalNodes = parseInt(process.env.TOTAL_NODES || '0', 10);
    const ipAddress = process.env.IP_ADDRESS || '';

    if (!(totalNodes > 0 && ipAddress)) {
      console.warn('Monitoring - TOTAL_NODES or IP_ADDRESS is not set properly in the environment variables.');
      return
    }
    const nodeData = await fetchNodeData(totalNodes, ipAddress);
    const ineligibleNodesRestarted: NodeSource[] = []
    const ineligibleNodesNotRestarted: NodeSource[] = []

    nodeData.forEach(node => {
      console.log(`Node ID: ${node._source.id}, Uptime: ${node._source.uptime}, Eligible: ${node._source.eligible}, Version: ${node._source.version}\n---`);
      if (!node._source.eligible) {
        const containerName = getContainerName(node._source.ipAndDns.port)
        if (containerName) {
          restartNode(containerName)
          ineligibleNodesRestarted.push(node._source)
        } else {
          ineligibleNodesNotRestarted.push(node._source)
        }
      }
    });

    if (ineligibleNodesRestarted.length > 0) {
      const message = ineligibleNodesRestarted.map(node =>
        `Node ID: ${node.id}, Uptime: ${node.uptime}, Version: ${node.version}, IP: ${node.ipAndDns.ip}, Port: ${node.ipAndDns.port}, Container Name: ${getContainerName(node.ipAndDns.port) || 'N/A'}`
      ).join('\n');

      await sendAlert(`🚨 Ocean Ineligible Nodes Restarted:\n${message}`);
    }

    if (ineligibleNodesNotRestarted.length > 0) {
      const message = ineligibleNodesNotRestarted.map(node =>
        `Node ID: ${node.id}, Uptime: ${node.uptime}, Version: ${node.version}, IP: ${node.ipAndDns.ip}, Port: ${node.ipAndDns.port}}`
      ).join('\n');

      console.warn(`⚠️ Ocean Ineligible Nodes Not Restarted, Please manually restart:\n${message}`);
    }

  } catch (error) {
    console.error('Error monitoring nodes:', error);
  }
}


export function startNodeCronProcess() {
  // Schedule a task to run every hour
  cron.schedule(process.env.CRON_SCHEDULE || '0 */3 * * *', async () => {
    try {
      monitorNodes()
    } catch (error) {
      console.error('Error in scheduled task:', error);
    }
  });
}
