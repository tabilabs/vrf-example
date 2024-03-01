import {ethers} from "ethers";
import abi_VRFConsumer from "./abi_VRFConsumer.json" assert { type: "json" }
import abi_VRFCoordinator from "./abi_VRFCoordinator.json" assert { type: "json" }

const main = async () => {
    // 连接Tabi地址
    const tabiRpc = "https://rpc.testnet.tabichain.com/"
    // VRFConsumer合约地址
    const vrfConsumerAddr = "0xb484B5F803F912C074Ac204dC66114F06aBc2100"
    // 私钥
    const privateKey = 'bfe1710922959f43e7d03e0e79a84c03f342af519f26dbf6d34edd0313295d49' //YOUR_PRIVATE_KEY

    const provider = new ethers.JsonRpcProvider(tabiRpc);

    const wallet = new ethers.Wallet(privateKey, provider)

    const vrfConsumer = ethers.Contract.from(vrfConsumerAddr, abi_VRFConsumer, wallet)

    const requestId = await requestRandomWords(vrfConsumer)

    console.log("requestRandomWords requestId:", requestId)

    const randomWords = await listener(vrfConsumer, requestId)

    console.log("randomWords:", randomWords)
}

const requestRandomWords = async (vrfConsumer) => {
    const callbackGasLimit = 400000
    const numWords = 4
    const result = await (await vrfConsumer.requestRandomWords(callbackGasLimit, numWords)).wait()

    console.log("requestRandomWords hash:", result.hash)

    const RandomWordsRequested = ethers.Interface.from(abi_VRFCoordinator).parseLog(result.logs[0])

    return RandomWordsRequested.args.requestId
}


const listener = async (vrfConsumer, requestId) => {
    return new Promise((resolve) => {
         vrfConsumer.once("RequestFulfilled", (_requestId, _randomWords) => {
            if (requestId === _requestId) {
                resolve(_randomWords)
            }
        })
    })
}


main()