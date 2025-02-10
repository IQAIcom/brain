export const ROUTER_ABI = [
	{
		inputs: [
			{
				internalType: "contract AgentFactory",
				name: "_factory",
				type: "address",
			},
		],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{ inputs: [], name: "AgentNotFound", type: "error" },
	{ inputs: [], name: "NoCurrencyToken", type: "error" },
	{
		inputs: [
			{ internalType: "address", name: "_agentToken", type: "address" },
			{ internalType: "uint256", name: "_amountIn", type: "uint256" },
			{ internalType: "uint256", name: "_minAmountOut", type: "uint256" },
		],
		name: "buy",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "_agentToken", type: "address" },
			{ internalType: "uint256", name: "_amountIn", type: "uint256" },
			{ internalType: "uint256", name: "_minAmountOut", type: "uint256" },
			{ internalType: "address", name: "_recipient", type: "address" },
		],
		name: "buy",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "currencyToken",
		outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "factory",
		outputs: [
			{ internalType: "contract AgentFactory", name: "", type: "address" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "fraxswapFactory",
		outputs: [
			{ internalType: "contract IFraxswapFactory", name: "", type: "address" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "_tokenIn", type: "address" },
			{ internalType: "address", name: "_tokenOut", type: "address" },
			{ internalType: "uint256", name: "_amountIn", type: "uint256" },
		],
		name: "getAmountOut",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "_agentToken", type: "address" },
			{ internalType: "uint256", name: "_amountIn", type: "uint256" },
			{ internalType: "uint256", name: "_minAmountOut", type: "uint256" },
			{ internalType: "address", name: "_recipient", type: "address" },
		],
		name: "sell",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "_agentToken", type: "address" },
			{ internalType: "uint256", name: "_amountIn", type: "uint256" },
			{ internalType: "uint256", name: "_minAmountOut", type: "uint256" },
		],
		name: "sell",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;
