import { formatEther } from "viem";

export const formatWeiToNumber = (wei: unknown): string =>
  formatNumber(Number(formatEther(BigInt(wei as string))));
