import {isNotNull, isNull} from "../../../helper/null";

export async function isDeployedSafe(address: string, rpc: string | undefined): Promise<boolean> {
    if (isNull(rpc)) {
        throw new Error('isDeployedSafe error, rpc url not has in rpcMap')
    }
    const { createPublicClient, http, getAddress } = await import('viem')
    const client = createPublicClient({
        transport: http(rpc)
    })
    const code = await client.getCode({ address: getAddress(address) })
    return isNotNull(code) && code.length > 2
}
