import {
  AMM_V3_CONTRACT,
  KWT_CONTRACT,
  MULTICALL_CONTRACT,
  oraichainTokens,
  ORAIX_CONTRACT,
  OSMO,
  OSMOSIS_ORAICHAIN_DENOM,
  TokenItemType,
  USDT_CONTRACT
} from "@oraichain/oraidex-common";
import { ZapConsumer } from "./zap-consumer";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { extractAddress, parsePoolKey } from "./helpers";
import { getTickAtSqrtPrice } from "./wasm/oraiswap_v3_wasm";

async function main() {
  const zapper = new ZapConsumer({
    routerApi: "https://osor.oraidex.io/smart-router/alpha-router",
    client: await CosmWasmClient.connect("https://rpc.orai.io"),
    dexV3Address: AMM_V3_CONTRACT,
    multiCallAddress: MULTICALL_CONTRACT,
    deviation: 0,
    smartRouteConfig: {
      swapOptions: {
        protocols: ["OraidexV3"]
      }
    }
  });

  const tokenIn = oraichainTokens.find((t) => t.name === "USDT") as TokenItemType;
  const pool = `orai-orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh-3000000000-100`;
  const poolKey = parsePoolKey(pool);

  // for (let i = 0; i < 10; i++) {
    // const poolInfo = await zapper.handler.getPool(poolKey);
    // console.log("poolInfo", poolInfo);
  // }

  const tickSpacing = poolKey.fee_tier.tick_spacing;
  const currentTick = (await zapper.handler.getPool(poolKey)).pool.current_tick_index;

  // console.log(getTickAtSqrtPrice(314557996917228655710133n, 10));

  console.time("processZapInPositionLiquidity");
  const res = await zapper.processZapInPositionLiquidity({
    poolKey: poolKey,
    tokenIn: tokenIn as TokenItemType,
    amountIn: "1000000",
    lowerTick: currentTick,
    upperTick: currentTick + tickSpacing,
    tokenX: oraichainTokens.find((t) => extractAddress(t) === poolKey.token_x) as TokenItemType,
    tokenY: oraichainTokens.find((t) => extractAddress(t) === poolKey.token_y) as TokenItemType,
  });
  console.log(res);
  console.timeEnd("processZapInPositionLiquidity");

  // const res = await zapper.processZapOutPositionLiquidity({
  //   owner: "orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2",
  //   tokenId: 4275,
  //   tokenOut: tokenIn,
  //   zapFee: 0,
  // });
  // console.dir(res, { depth: null });
  // console.dir(res, { depth: null });
}

main().catch(console.error);
