import { useEffect, useState } from "react"
import axios from "axios"
import { useMoralis, useWeb3Contract } from "react-moralis"
// import Moralis from "moralis"
import { ethers } from "ethers"
import { useNotification, Button, Table, Input } from "web3uikit"
import Header from "../components/Header"

var baseURL = "https://ipfs.io/ipfs/"

import {
    abi,
    abiEcommerce,
    abiEcommerceMarket,
    abiRFID,
    contractAddresses,
    addressEcommerce,
    addressEcommerceMarket,
    addressRFID,
} from "../constants"

export default function Home() {
    const [nfts, setNfts] = useState([])
    const [nftItems, setNftItems] = useState([])
    const [loadingState, setLoadingState] = useState("not-loaded")
    const [itemNo, setItemNo] = useState()
    const [rfid, setRFID] = useState()
    const [tokenId, setTokenId] = useState()
    const [listingPrice, setListingPrice] = useState()

    const dispatch = useNotification()

    const { chainId: chainIdHex, enableWeb3, Moralis, isWeb3Enabled, account } = useMoralis()
    const chainId = parseInt(chainIdHex)
    console.log("ChainId: ", chainId)
    const ecommerceAddress = chainId in addressEcommerce ? addressEcommerce[chainId][0] : null
    const rfidAddress = chainId in addressRFID ? addressRFID[chainId][0] : null
    const ecommerceMarketAddress =
        chainId in addressEcommerceMarket ? addressEcommerceMarket[chainId][0] : null

    const { runContractFunction: fetchMarketItems } = useWeb3Contract({
        abi: abiEcommerceMarket,
        contractAddress: ecommerceMarketAddress,
        functionName: "fetchMarketItems",
        params: {},
    })

    const { runContractFunction: sellMarketItem } = useWeb3Contract({
        abi: abiEcommerceMarket,
        contractAddress: ecommerceMarketAddress,
        functionName: "sellMarketItem",
        params: {
            nftContract: ecommerceAddress,
            itemId: tokenId,
        },
        msgValue: listingPrice,
    })

    const { runContractFunction: getListingPrice } = useWeb3Contract({
        abi: abiEcommerceMarket,
        contractAddress: ecommerceMarketAddress,
        functionName: "getListingPrice",
        params: {},
    })

    const { runContractFunction: fetchItemsCreated } = useWeb3Contract({
        abi: abiEcommerceMarket,
        contractAddress: ecommerceMarketAddress,
        functionName: "fetchItemsCreated",
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

    const { runContractFunction: getIdToUnsoldMarketItem } = useWeb3Contract({
        abi: abiEcommerceMarket,
        contractAddress: ecommerceMarketAddress,
        functionName: "getIdToUnsoldMarketItem",
        params: {
            item: itemNo,
        },
    })

    const { runContractFunction: idToUnsoldMarketItem } = useWeb3Contract({
        abi: abiEcommerceMarket,
        contractAddress: ecommerceMarketAddress,
        functionName: "idToUnsoldMarketItem",
        params: {},
    })

    const { runContractFunction: tokenURI } = useWeb3Contract({
        abi: abiEcommerce,
        contractAddress: ecommerceAddress,
        functionName: "tokenURI",
        params: {
            tokenId: 0,
        },
    })

    async function loadData() {
        // let fetchAll = await fetchItemsCreated({
        //     // onComplete
        //     // onSuccess: handleSuccess,
        //     onError: (error) => console.log(error),
        // })

        console.log(`
        In LoadData: 
        isWeb3Enabled: ${isWeb3Enabled}
        `)

        let fetchAll = await fetchMarketItems({
            // onComplete
            // onSuccess: handleSuccess,
            onError: (error) => console.log(error),
        })
        console.log("FetchALL: ", fetchAll)

        // console.log("NFTS: ", fetchNfts)

        let totalNFTs = (await _tokenIds()).toString()
        // let totalNFTs = await mContract.methods._itemIds().call();

        let unsoldNfts = (await unsoldItemCount()).toString()
        //let unsoldNfts = await mContract.methods.unsoldItemCount().call();
        console.log("Total NFTs: ", totalNFTs, "UnSold NFTs : ", unsoldNfts)

        let unsoldNft
        for (var i = 0; i < totalNFTs; i++) {
            console.log("PRICE: ", Number(fetchAll[i].price))
            if (fetchAll[i].sold == false) {
                const optionsUnsold = {
                    functionName: "getIdToUnsoldMarketItem",
                    contractAddress: ecommerceMarketAddress,
                    abi: abiEcommerceMarket,
                    params: {
                        item: i,
                    },
                }
                if (isWeb3Enabled) {
                    unsoldNft = await Moralis.executeFunction(optionsUnsold)
                    console.log("UNSOLD ITEM: ", unsoldNft)
                }
                // let unsoldNft = await idToUnsoldMarketItem();

                // const optionsRFID = {
                //     functionName: "requestData",
                //     contractAddress: rfidAddress,
                //     abi: abiRFID,
                //     params: {},
                // }

                // const urfid = await Moralis.executeFunction(optionsRFID)
                // console.log("RFID : ", urfid)
                // setRFID(urfid)

                const options = {
                    functionName: "tokenURI",
                    contractAddress: ecommerceAddress,
                    abi: abiEcommerce,
                    params: {
                        tokenId: Number(unsoldNft.tokenId),
                    },
                }

                const uri = await Moralis.executeFunction(options)

                // const tokenUri1 = await nftContract.methods
                //   .tokenURI(unsoldNft.tokenId)
                //   .call();
                console.log("URI : ", uri)
                const meta = await axios.get(baseURL + uri)
                // let metaObj = JSON.parse(meta.data)
                // console.log("META: ", meta.data)

                let price = ethers.utils.formatUnits(fetchAll[i].price.toString())
                // console.log("Price: ", price)

                let obj = {
                    price,
                    tokenId: Number(fetchAll[i].tokenId),
                    seller: fetchAll[i].seller,
                    owner: fetchAll[i].owner,
                    image: meta.data.image,
                    name: meta.data.name,
                    description: meta.data.description,
                }
                console.log("obj NFTs : ", obj)
                setNfts((nfts) => [...nfts, obj])

                setLoadingState("loaded")
            }
        }
    }

    async function buyNFTs(nft) {
        const price = ethers.utils.parseUnits(nft.price.toString())

        let listingPrice = ethers.utils.parseUnits((await getListingPrice()).toString(), "wei")
        listingPrice = parseFloat(price) + parseFloat(listingPrice)

        console.log(`
        Price in Buy:  ${price} 
        tokenId:  ${nft.tokenId} 
        ListingPrice: ${listingPrice}
        `)

        setTokenId(nft.tokenId)
        setListingPrice(listingPrice)

        // loadData()
    }

    useEffect(() => {
        console.log(`
        IN
        TokenId: ${tokenId}
        ListingPrice: ${listingPrice}
        `)
        if (tokenId >= 0 && listingPrice) {
            async function sell() {
                console.log("Calling Sell Item")
                await sellMarketItem()
            }
            sell()
        }
    }, [tokenId, listingPrice])

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

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
    }
    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
        // location.reload()
    }

    // async function load() {
    //     console.log("Load")
    //     await loadData()
    // }

    if (loadingState === "loaded" && !nfts.length) return <h1>Loaded No Items Available</h1>
    if (!nfts.length)
        return (
            <div>
                {/* <button onClick={load}>Load</button> */}
                <h1>Loading Plzzzz Wait loading state: {loadingState}</h1>
            </div>
        )

    return (
        <>
            <Header />

            <div className="flex-justify-center">
                <div className="px-4" style={{ maxWidth: "1600px" }}>
                    <div className="grid grid-cols-1 sx:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {nfts.map((nft, key) => {
                            return (
                                <div
                                    key={key}
                                    className="border shadow rounded-xl overflow-hidden"
                                >
                                    <img src={baseURL + nft.image} />
                                    <div>
                                        <p
                                            style={{ height: "64px" }}
                                            className="text-2xl font-semibold"
                                        >
                                            {nft.name}
                                        </p>
                                        <div style={{ height: "70px", overflow: "hidden" }}>
                                            <p className="text-gray-400">{nft.description}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black">
                                        <p className="text-2xl mb-4 font-bold text-white">
                                            {nft.price} ETH
                                        </p>
                                        {/* <p className="text-2xl mb-4 font-bold text-white">
                                            RFID: {rfid.data}
                                        </p> */}
                                        <button
                                            className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                                            onClick={() => buyNFTs(nft)}
                                        >
                                            Buy
                                        </button>
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
