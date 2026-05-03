import {
  ShelbyClient
} from "@shelby-protocol/sdk/browser";

import {
  Aptos,
  AptosConfig,
  Network
} from "@aptos-labs/ts-sdk";

import type { ShelbyFile } from "./types";
export type { ShelbyFile };

export function createAptosClient() {
  return new Aptos(
    new AptosConfig({ network: Network.TESTNET })
  );
}

export async function createShelbyClient() {
  return new ShelbyClient({
    network: Network.TESTNET,
  });
}

export async function listAccountFiles(): Promise<ShelbyFile[]> {
  return [];
}