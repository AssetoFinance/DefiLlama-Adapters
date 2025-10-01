const sdk = require("@defillama/sdk");

async function getRwaTvl(chain, block, tokens) {
    let totalUsd = 0;
    for (let t of tokens) {
        // 1. totalSupply
        const supply = await sdk.api.erc20.totalSupply({
            target: t.tokenAddress,
            block: block,
            chain: chain,
        });

        // 2. decimals
        const decimals = (
            await sdk.api.erc20.decimals(t.tokenAddress, chain)
        ).output;

        const supplyNormalized = Number(supply.output) / (10 ** decimals);

        // 3. price from price contract
        const rawPrice = await sdk.api.abi.call({
            abi: "uint256:getLatestPrice",
            target: t.pricerAddress,
            chain,
            block,
        });

        const price = rawPrice.output / 1e8; // 根据你的合约返回精度调整

        // 4. 计算
        totalUsd += supplyNormalized * price;
    }
    return {usd: totalUsd};
}

module.exports = {
    methodology: "TVL = totalSupply of AoABT tokens × on-chain price from price contract",
    timetravel: true,
    misrepresentedTokens: true,
    hsk: {
        tvl: async (ts, _b, chainBlocks) =>
            getRwaTvl("hsk", chainBlocks.hashkey, [
                {
                    tokenAddress: "0x80C080acd48ED66a35Ae8A24BC1198672215A9bD",
                    pricerAddress: "0xD72529F8b54fcB59010F2141FC328aDa5Aa72abb"
                }, // AoABT
                {
                    tokenAddress: "0x34B842D0AcF830134D44075DCbcE43Ba04286c12",
                    pricerAddress: "0x8dB72b8F7F896569F6B254263D559902Ea2A9B35"
                }, // AoABTb
                {
                    tokenAddress: "0xf00A183Ae9DAA5ed969818E09fdd76a8e0B627E6",
                    pricerAddress: "0x9BB1a9f99070341eADf705B8B973474EF2b9790F"
                }, // AoABTa12m
            ]),
    },
    avax: {
        tvl: async (ts, _b, chainBlocks) =>
            getRwaTvl("avax", chainBlocks.ethereum, [
                {
                    tokenAddress: "0xB2EA3E7b80317c4E20D1927034162176e25834E2",
                    pricerAddress: "0xb7e8aCD88701823B68530b1467107E7196F775AE"
                },// AoABTd
            ]),
    },
};
