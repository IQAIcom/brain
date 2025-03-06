import { ChainName } from "@covalenthq/client-sdk";

/**
 * Get all valid chain names from the ChainName enum
 * @returns Array of all valid chain names
 */
export function getAllValidChainNames(): string[] {
	return Object.values(ChainName);
}

/**
 * Check if a chain name is valid
 * @param chain Chain name to check
 * @returns Boolean indicating if it's valid
 */
export function isValidChainName(chain: string): boolean {
	return Object.values(ChainName).includes(chain as ChainName);
}

/**
 * Convert a string to ChainName enum value with error handling
 * @param chainString The chain name as string
 * @returns The corresponding ChainName enum value
 * @throws Error if the chain name is invalid
 */
export function toChainName(chainString: string): ChainName {
	if (!chainString) {
		throw new Error("Chain name cannot be empty");
	}

	if (!isValidChainName(chainString)) {
		// Get a list of valid chains for error message
		const validChains = `${getAllValidChainNames().slice(0, 5).join(", ")}...`;
		throw new Error(
			`Invalid chain name: ${chainString}. Valid examples include: ${validChains}`,
		);
	}

	return chainString as ChainName;
}
