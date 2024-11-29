import { NodeConfig } from "./configs/nodeConfig";

export const TYPESENSE_PORT = process.env.TYPESENSE_PORT || 8108;
export const TYPESENSE_CONTAINER_NAME = `typesense-${TYPESENSE_PORT}`;

export function generateDockerCompose(allConfigs: NodeConfig[]) {
  const oceanNodeServices = allConfigs.map((conf, index) => {
    return `
  ${conf.node_name}:
    image: oceanprotocol/ocean-node:latest
    pull_policy: always
    container_name: ${conf.container_name}
    restart: on-failure
    ports:
      - '${conf.ports[0]}:8000'
      - '${conf.ports[1]}:9000'
      - '${conf.ports[2]}:9001'
      - '${conf.ports[3]}:9002'
      - '${conf.ports[4]}:9003'
    environment:
      PRIVATE_KEY: '${conf.environment.PRIVATE_KEY}'
      ALLOWED_ADMINS: '${JSON.stringify(conf.environment.ALLOWED_ADMINS)}'
      RPCS: '{"1":{"rpc":"https://ethereum-rpc.publicnode.com","fallbackRPCs":["https://rpc.ankr.com/eth","https://1rpc.io/eth","https://eth.api.onfinality.io/public"],"chainId":1,"network":"mainnet","chunkSize":100},"10":{"rpc":"https://mainnet.optimism.io","fallbackRPCs":["https://optimism-mainnet.public.blastapi.io","https://rpc.ankr.com/optimism","https://optimism-rpc.publicnode.com"],"chainId":10,"network":"optimism","chunkSize":100},"137":{"rpc":"https://polygon-rpc.com/","fallbackRPCs":["https://polygon-mainnet.public.blastapi.io","https://1rpc.io/matic","https://rpc.ankr.com/polygon"],"chainId":137,"network":"polygon","chunkSize":100},"23294":{"rpc":"https://sapphire.oasis.io","fallbackRPCs":["https://1rpc.io/oasis/sapphire"],"chainId":23294,"network":"sapphire","chunkSize":100},"23295":{"rpc":"https://testnet.sapphire.oasis.io","chainId":23295,"network":"sapphire-testnet","chunkSize":100},"11155111":{"rpc":"https://eth-sepolia.public.blastapi.io","fallbackRPCs":["https://1rpc.io/sepolia","https://eth-sepolia.g.alchemy.com/v2/demo"],"chainId":11155111,"network":"sepolia","chunkSize":100},"11155420":{"rpc":"https://sepolia.optimism.io","fallbackRPCs":["https://endpoints.omniatech.io/v1/op/sepolia/public","https://optimism-sepolia.blockpi.network/v1/rpc/public"],"chainId":11155420,"network":"optimism-sepolia","chunkSize":100}}'
      DB_URL: 'http://${TYPESENSE_CONTAINER_NAME}:${TYPESENSE_PORT}/?apiKey=xyz'
      IPFS_GATEWAY: 'https://ipfs.io/'
      ARWEAVE_GATEWAY: 'https://arweave.net/'
      INTERFACES: '["HTTP","P2P"]'
      DASHBOARD: 'true'
      HTTP_API_PORT: '8000'
      P2P_ENABLE_IPV4: 'true'
      P2P_ENABLE_IPV6: 'false'
      P2P_ipV4BindAddress: '0.0.0.0'
      P2P_ipV4BindTcpPort: '9000'
      P2P_ipV4BindWsPort: '9001'
      P2P_ipV6BindAddress: '::'
      P2P_ipV6BindTcpPort: '9002'
      P2P_ipV6BindWsPort: '9003'
      P2P_ANNOUNCE_ADDRESSES: '["/ip4/${conf.environment.IP_ADDRESS}/tcp/${conf.ports[1]}", "/ip4/${conf.environment.IP_ADDRESS}/ws/tcp/${conf.ports[2]}"]'
    networks:
      - ocean_network
    depends_on:
      - ${TYPESENSE_CONTAINER_NAME}
`;
  });

  return `
version: "3.8"
services:
${oceanNodeServices.join("\n")}
  ${TYPESENSE_CONTAINER_NAME}:
    image: typesense/typesense:26.0
    container_name: ${TYPESENSE_CONTAINER_NAME}
    ports:
      - '${TYPESENSE_PORT}:8108'
    networks:
      - ocean_network
    volumes:
      - ${TYPESENSE_CONTAINER_NAME}-data:/data
    command: '--data-dir /data --api-key=xyz'

volumes:
  ${TYPESENSE_CONTAINER_NAME}-data:
    driver: local

networks:
  ocean_network:
    driver: bridge
`;
}
