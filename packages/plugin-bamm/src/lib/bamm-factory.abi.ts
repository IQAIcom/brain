export const BAMM_FACTORY_ABI = [{"inputs":[{"internalType":"address","name":"_fraxswapFactory","type":"address"},{"internalType":"address","name":"_routerMultihop","type":"address"},{"internalType":"address","name":"_fraxswapOracle","type":"address"},{"internalType":"address","name":"_variableInterestRate","type":"address"},{"internalType":"address","name":"_feeTo","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"BammAlreadyCreated","type":"error"},{"inputs":[],"name":"Create2Failed","type":"error"},{"inputs":[],"name":"NotBAMM","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"PairNotFromFraxswapFactory","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"address","name":"bamm","type":"address"}],"name":"BammCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"bamms","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"bammsArray","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"bammsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_pair","type":"address"}],"name":"createBamm","outputs":[{"internalType":"address","name":"bamm","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fraxswapOracle","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"iFraxswapFactory","outputs":[{"internalType":"contract IFraxswapFactory","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"bamm","type":"address"}],"name":"isBamm","outputs":[{"internalType":"bool","name":"exists","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"pair","type":"address"}],"name":"pairToBamm","outputs":[{"internalType":"address","name":"bamm","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"routerMultihop","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"bamm","type":"address"},{"internalType":"address","name":"newVariableInterestRate","type":"address"}],"name":"setBAMMVariableInterestRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"bamm","type":"address"},{"internalType":"uint256","name":"newMaxOracleDiff","type":"uint256"}],"name":"setBammMaxOracleDiff","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"_creationCode","type":"bytes"}],"name":"setCreationCode","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newVariableInterestRate","type":"address"}],"name":"setVariableInterestRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"variableInterestRate","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint256","name":"_major","type":"uint256"},{"internalType":"uint256","name":"_minor","type":"uint256"},{"internalType":"uint256","name":"_patch","type":"uint256"}],"stateMutability":"pure","type":"function"}] as const;
