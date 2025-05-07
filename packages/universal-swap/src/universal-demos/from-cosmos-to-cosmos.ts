import "dotenv/config";
import { CosmosWalletImpl } from "./offline-wallet";
import { UniversalSwapHandler } from "../handler";
import {
    generateError,
    toAmount,
    OraidexCommon
} from "@oraichain/oraidex-common";

const cosmosToCosmos = async (chainId: "Neutaro-1") => {
    const wallet = new CosmosWalletImpl(process.env.MNEMONIC);
    const sender = await wallet.getKeplrAddr("Oraichain");
    const oraidexCommon = await OraidexCommon.load();
    const flattenTokens = oraidexCommon.flattenTokens;
    const fromAmount = 10;

    let originalFromToken = flattenTokens.find((t) => t.chainId === "Oraichain" && t.coinGeckoId === "neutaro");
    let originalToToken = flattenTokens.find((t) => t.chainId === chainId && t.coinGeckoId === "neutaro");
    if (!originalFromToken) throw generateError("Could not find original from token");
    if (!originalToToken) throw generateError("Could not find original to token");
    console.log("Test1");

    const universalHandler = new UniversalSwapHandler(
        {
            originalFromToken,
            originalToToken,
            sender: { cosmos: sender },
            relayerFee: {
                relayerAmount: "1000000",
                relayerDecimals: 6
            },
            fromAmount,
            fee: 2,
            simulateAmount: toAmount(fromAmount, originalToToken.decimals).toString(),
        },
        {
            cosmosWallet: wallet,
            swapOptions: {
                isIbcWasm: true,
            }
        },
        oraidexCommon
    );

    try {
        const result = await universalHandler.processUniversalSwap();
        console.log("result: ", result);
    } catch (error) {
        console.log("error: ", error);
    }
};

(() => {
    return cosmosToCosmos("Neutaro-1");
})();
