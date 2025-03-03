import { parseEther } from "viem";

export const BRIDGE_ADDRESS = "0x34c0bd5877a5ee7099d0f5688d65f4bb9158bde2";

export const IQ_ADDRESSES = {
	ethereum: "0x579CEa1889991f68aCc35Ff5c3dd0621fF29b0C9" as `0x${string}`,
	fraxtal: "0x6EFB84bda519726Fa1c65558e520B92b51712101 " as `0x${string}`,
};

export const FUNDING_AMOUNT = parseEther("0.0001");
export const MIN_IQ_THRESHOLD = parseEther("1500");

export const BRIDGE_EVENT_ABI = [
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: "l1Token", type: "address" },
			{ indexed: true, name: "l2Token", type: "address" },
			{ indexed: true, name: "from", type: "address" },
			{ indexed: false, name: "to", type: "address" },
			{ indexed: false, name: "amount", type: "uint256" },
			{ indexed: false, name: "extraData", type: "bytes" },
		],
		name: "ERC20DepositInitiated",
		type: "event",
	},
];

// Method ID for depositERC20 function depositERC20(address,address,uint256,uint32,bytes)
export const DEPOSIT_ERC20_METHOD_ID = "0x58a997f6";
