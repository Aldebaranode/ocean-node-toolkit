import { ethers } from "ethers";

export function generateWallets(seedPhrase: string, totalNodes: number) {
  const wallets = [];
  const hdNode = ethers.utils.HDNode.fromMnemonic(seedPhrase);

  for (let i = 0; i < totalNodes; i++) {
    const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${i}`);
    wallets.push(wallet.privateKey);
  }

  return wallets;
}
