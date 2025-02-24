// import type { Plugin } from "@elizaos/core";
// import { ContractService } from "./services/contract";
// import { MetadataService } from "./services/metadataGenerator";
// import { InputParserService } from "./services/input-parser";
// import { WalletService } from "./services/wallet";
// import { createContractAction } from "./actions/create-action";
// import type { ContractPluginOptions } from "./types";
// import { ContractPluginOptionsSchema } from "./lib/schema";

// export async function createContractPlugin(
//   options: ContractPluginOptions
// ): Promise<Plugin> {
//   const validatedOptions = ContractPluginOptionsSchema.parse(options);

//   const walletService = new WalletService(validatedOptions.privateKey, validatedOptions.chain);
//   const contractService = new ContractService(walletService, validatedOptions.abi, validatedOptions.address);
//   const metadataService = new MetadataService(validatedOptions.name, validatedOptions.description);
//   const inputParserService = new InputParserService();

//   const functions = validatedOptions.abi.filter(
//     (item) => item.type === "function"
//   )
// }

// export default createContractPlugin;
