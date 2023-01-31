import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
// import Moralis from "moralis"
import axios from "axios"
import { ethers } from "ethers"
import { useNotification, Button, Table, Input } from "web3uikit"
import Header from "../components/Header"

var baseURL = "https://ipfs.io/ipfs/"

import {
    abi,
    abiEcommerce,
    abiEcommerceMarket,
    contractAddresses,
    addressEcommerce,
    addressEcommerceMarket,
} from "../constants"

export default function MyAssets() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState("not-loaded")

    const { chainId: chainIdHex, enableWeb3, Moralis, isWeb3Enabled, account } = useMoralis()
    const chainId = parseInt(chainIdHex)
    console.log("ChainId: ", chainId)
    const ecommerceAddress = chainId in addressEcommerce ? addressEcommerce[chainId][0] : null
    const ecommerceMarketAddress =
        chainId in addressEcommerceMarket ? addressEcommerceMarket[chainId][0] : null

    const {
        runContractFunction: fetchMyNFTs,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abiEcommerceMarket,
        contractAddress: ecommerceMarketAddress,
        functionName: "fetchMyNFTs",
        params: {},
    })

    const { runContractFunction: _tokenIds } = useWeb3Contract({
        abi: abiEcommerce,
        contractAddress: ecommerceAddress,
        functionName: "_tokenIds",
        params: {},
    })

    const { runContractFunction: unsoldItemCount } = useWeb3Contract({
        abi: abiEcommerceMarket,
        contractAddress: ecommerceMarketAddress,
        functionName: "unsoldItemCount",
        params: {},
    })

    useEffect(() => {
        async function init() {
            if (!isWeb3Enabled) {
                await enableWeb3()
            }

            if (isWeb3Enabled) {
                console.log(`
            WEB3 enable:  ${isWeb3Enabled}
            E Address: ${ecommerceAddress}
            M Address: ${ecommerceMarketAddress}
        `)
                loadData()
            }
        }
        init()
    }, [isWeb3Enabled])

    // useEffect(() => {
    //     console.log("IsWeb3Enabled: ", isWeb3Enabled)

    //     if (!isWeb3Enabled) {
    //         enableWeb3()
    //     }
    //     if (isWeb3Enabled) {
    //         async function load() {
    //             await loadData()
    //         }
    //         load()
    //     }
    // }, [isWeb3Enabled])

    async function loadData() {
        let fetchMyItems = await fetchMyNFTs({
            // onComplete
            // onSuccess: handleSuccess,
            onError: (error) => console.log(error),
        })
        console.log("Created: ", fetchMyItems)

        let totalNFTs = (await _tokenIds()).toString()
        let unsoldNfts = (await unsoldItemCount()).toString()
        console.log("Fetch Created Length: ", fetchMyItems.length)
        console.log("Total NFTs: ", totalNFTs, "UnSold NFTs : ", unsoldNfts)

        for (var i = 0; i < fetchMyItems.length; i++) {
            // let unsoldNft = await mContract.methods.idToUnsoldMarketItem(i).call();

            const options = {
                functionName: "tokenURI",
                contractAddress: ecommerceAddress,
                abi: abiEcommerce,
                params: {
                    tokenId: Number(fetchMyItems[i].tokenId),
                },
            }

            const uri = await Moralis.executeFunction(options)

            // const tokenUri1 = await nftContract.methods
            //   .tokenURI(unsoldNft.tokenId)
            //   .call();
            console.log("URI : ", uri)
            const meta = await axios.get(baseURL + uri)
            // let metaObj = JSON.parse(meta.data)
            console.log("META: ", meta)

            let price = ethers.utils.formatUnits(fetchMyItems[i].price.toString())
            console.log("Price: ", price)

            let obj = {
                price,
                tokenId: Number(fetchMyItems[i].tokenId),
                seller: fetchMyItems[i].seller,
                owner: fetchMyItems[i].owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
            }
            console.log("obj NFTs : ", obj)
            setNfts((nfts) => [...nfts, obj])
            if (obj.sold) {
                setSold((nfts) => [...nfts, obj])
            }
            setLoadingState("loaded")
        }
    }

    if (loadingState === "loaded" && !nfts.length) return <h1>No Items Available</h1>

    return (
        <>
            <Header />
            <div className="flex justify-center">
                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {nfts.map((nft, i) => {
                            return (
                                <div key={i} className="border shadow rounded-xl overflow-hidden">
                                    <img src={baseURL + nft.image} className="rounded" />
                                    <div className="p-4 bg-black">
                                        <p className="text-22xl font-bold textt-white">
                                            Price - {nft.price}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}
