import {
	arbitrum,
	avalanche,
	base,
	bsc,
	linea,
	mainnet,
	optimism,
	polygon,
	scroll,
} from "viem/chains";

export const CHAIN_IDS: Record<string, number> = {
	Ethereum: mainnet.id,
	Optimism: optimism.id,
	"BNB Chain": bsc.id,
	Polygon: polygon.id,
	Sonic: 64165,
	Fantom: 250,
	Fraxtal: 252,
	"zkSync Era": 324,
	Mantle: 5000,
	Base: base.id,
	Mode: 34443,
	Arbitrum: arbitrum.id,
	Avalanche: avalanche.id,
	Linea: linea.id,
	Scroll: scroll.id,
};
