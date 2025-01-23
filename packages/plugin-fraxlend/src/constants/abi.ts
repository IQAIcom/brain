export const FRAXLEND_ABI = [
	"function addAsset(uint256 amount, address recipient) external returns (uint256 shares)",
	"function removeAsset(uint256 shares, address recipient) external returns (uint256 amount)",
	"function assetContract() external view returns (address)",
	// Add other needed ABI functions
];
