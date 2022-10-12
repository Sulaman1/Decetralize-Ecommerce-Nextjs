import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import Moralis from "moralis"
import { ethers } from "ethers"
import { useNotification, Button, Table, Input } from "web3uikit"

import { create, create as ipfsHttpClient } from "ipfs-http-client"
import { useRouter } from "next/router" //next/dist/client/router

import Header from "../components/Header"

import {
    abi,
    abiEcommerce,
    abiEcommerceMarket,
    contractAddresses,
    addressEcommerce,
    addressEcommerceMarket,
} from "../constants"

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0")

export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState(null)
    const [metaDataUrl, setMetaDataUrl] = useState("")
    const [tokenId, setTokenId] = useState()
    const [listingPrice, setListingPrice] = useState(0)
    const [formInput, setFormInput] = useState({ price: "", name: "", description: "" })
    const router = useRouter()

    const dispatch = useNotification()

    const { chainId: chainIdHex, enableWeb3, isWeb3Enabled, account } = useMoralis()
    const chainId = parseInt(chainIdHex)
    console.log("ChainId: ", chainId)
    const ecommerceAddress = chainId in addressEcommerce ? addressEcommerce[chainId][0] : null
    const ecommerceMarketAddress =
        chainId in addressEcommerceMarket ? addressEcommerceMarket[chainId][0] : null

    // const Moralis = useMoralis()
    const { authenticate, isAuthenticated, user } = useMoralis()

    useEffect(() => {
        if (metaDataUrl && listingPrice && formInput.price && tokenId) {
            async function load() {
                console.log("CreateProduct Is called")
                console.log(`
                TokenID: ${tokenId}
                Metadata URL:  ${metaDataUrl}
                formInput Price: ${formInput.price}
                ListingPrice: ${listingPrice}
            `)

                await createProduct()
            }
            load()
        }
    }, [metaDataUrl, listingPrice, formInput.price, tokenId])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        console.log("Calling product create")
        await productCreate({
            // onComplete
            onSuccess: handleCompleteSuccess,
            onError: (error) => console.log(error),
        })
    }
    const handleCompleteSuccess = async function (tx) {
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

    const { runContractFunction: productCreated } = useWeb3Contract({
        abi: abiEcommerce,
        contractAddress: ecommerceAddress,
        functionName: "productCreated",
        params: {
            tokenURI: metaDataUrl,
        },
    })

    const { runContractFunction: productCreate } = useWeb3Contract({
        abi: abiEcommerceMarket,
        contractAddress: ecommerceMarketAddress,
        functionName: "productCreate",
        params: {
            nftContract: ecommerceAddress,
            tokenId: tokenId,
            price: formInput.price,
        },
        msgValue: listingPrice,
    })

    const { runContractFunction: getListingPrice } = useWeb3Contract({
        abi: abiEcommerceMarket,
        contractAddress: ecommerceMarketAddress,
        functionName: "getListingPrice",
        params: {},
    })

    const { runContractFunction: _tokenIds } = useWeb3Contract({
        abi: abiEcommerce,
        contractAddress: ecommerceAddress,
        functionName: "_tokenIds",
        params: {},
    })

    const { runContractFunction: newId } = useWeb3Contract({
        abi: abiEcommerce,
        contractAddress: ecommerceAddress,
        functionName: "newId",
        params: {},
    })

    async function onChange(e) {
        const img = e.target.files[0]
        try {
            console.log("Image: ", img.name)
            const file = new Moralis.File("imgname", img)
            await file.saveIPFS({ useMasterKey: true })

            console.log(`
                Full Path: ${file.ipfs()}
                Hash:  ${file.hash()}
                `)
            setFileUrl(file.ipfs())
        } catch (err) {
            console.log(err)
        }
    }

    async function createItem() {
        const { name, description, price } = formInput
        if (!name || !description || !price) return
        const data = JSON.stringify({
            name,
            description,
            image: fileUrl,
        })

        console.log("Meta Data: ", data)
        let file

        try {
            file = new Moralis.File("metadata", {
                base64: btoa(JSON.stringify(data)),
            })

            await file.saveIPFS({ useMasterKey: true })
            setMetaDataUrl(file.ipfs())

            let tokenId = await _tokenIds()
            setTokenId(tokenId)

            let lp = (await getListingPrice()).toString()
            setListingPrice(lp)

            console.log(`
                tokenId: ${tokenId}
                Listing Price: ${lp}
            `)

            let url = file.ipfs()
            console.log("Metadata URL : ", url)

            console.log(`
                Full Path: ${file.ipfs()}
                Hash:  ${file.hash()}
                `)
            // createSale(url)
        } catch (err) {
            console.log(err)
        }
    }

    async function createProduct() {
        // console.log("Url to create: ", url)

        await productCreated({
            // onComplete
            onSuccess: handleSuccess,
            onError: (error) => console.log(error),
        })
    }

    async function createSale(url) {
        const price = ethers.utils.parseEther(formInput.price) //web3.utils.fromWei(formInput.price, "ether")

        console.log(`
            formInput Price: ${formInput.price}
            Price: ${price}
        `)

        // await productCreate({
        //     // onComplete
        //     onSuccess: handleSuccess,
        //     onError: (error) => console.log(error),
        // })

        // let mContract = new web3.eth.Contract(Market.abi, nftmarketaddress)
        // let listingPrice = await mContract.methods.getListingPrice().call()
        // listingPrice = listingPrice.toString()
        // let transaction = await mContract.methods
        //     .productCreate(nftaddress, tokenId, formInput.price)
        //     .send({ from: accounts[0], value: listingPrice })
        //await transaction.wait();

        // router.push("/")
    }
    return (
        <>
            <Header />
            <div className="flex justify-center">
                <div className="w-1/2 flex flex-col pb-12">
                    <input
                        placeholder="NFT name"
                        className="mt-8 border rounded p-4"
                        onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
                    />
                    <textarea
                        placeholder="NFT Description"
                        className="mt-2 border rounded p-4"
                        onChange={(e) =>
                            setFormInput({ ...formInput, description: e.target.value })
                        }
                    />
                    <input
                        placeholder="NFT Price"
                        className="mt-8 border rounded p-4"
                        onChange={(e) => setFormInput({ ...formInput, price: (e.target.value * "1000000000000000000").toString() })}
                    />
                    {/* <input
                    typr="file"
                    name="NFT"
                    className="my-4"
                    onChange={onChange}
                ></input> */}
                    <input
                        type="file"
                        onChange={onChange}
                        className="btn btn-success bg-pink-500"
                        // style={{width: '250px', margin: '0px 0px 10px 0px', backgroundColor: '#753a88'}}
                    />

                    {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
                    <button
                        onClick={createItem}
                        className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
                    >
                        Create Product
                    </button>
                </div>
            </div>
            {metaDataUrl}
        </>
    )
}
