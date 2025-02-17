import { formatEther } from "viem";

export default function formatNumber(value: number): string {
	// For numbers less than 1, use 5 decimals
	if (value < 1) {
		if (value === 0.0) {
			return "0";
		}
		return value.toFixed(5);
	}

	// For numbers less than 100, use 2 decimals
	if (value < 100) {
		return value.toFixed(2);
	}

	// For larger numbers, use compact notation with 2 decimal places
	return new Intl.NumberFormat("en-US", {
		notation: "compact",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

export const formatWeiToNumber = (wei: unknown): string =>
	formatNumber(Number(formatEther(BigInt(wei as string))));
