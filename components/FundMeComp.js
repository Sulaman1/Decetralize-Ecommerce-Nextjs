import { useMoralis, useWeb3Contract } from "react-moralis"
import {
    abi,
    abiEcommerce,
    abiEcommerceMarket,
    contractAddresses,
    addressEcommerce,
    addressEcommerceMarket,
} from "../constants"
import { useNotification, Button, Table, Input } from "web3uikit"
import { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function FundMeComp() {
    const [dollar, setDollar] = useState("")
    const [size, setSize] = useState("")
    const [amount, setAmount] = useState("0")
    const [contractValue, setContractValue] = useState("0")
    const [inputValue, setInputValue] = useState("0")

    const { chainId: chainIdHex, enableWeb3, isWeb3Enabled, account } = useMoralis()
    const chainId = parseInt(chainIdHex)
    console.log("ChainId: ", chainId)
    const fundMeAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const dispatch = useNotification()

    const {
        runContractFunction: fund,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: fundMeAddress,
        functionName: "getFiatPrice",
        params: {},
        msgValue: inputValue,
    })

    const { runContractFunction: withdraw } = useWeb3Contract({
        abi: abi,
        contractAddress: fundMeAddress,
        functionName: "withdraw",
        params: {},
    })

    const { runContractFunction: funderArraySize } = useWeb3Contract({
        abi: abi,
        contractAddress: fundMeAddress,
        functionName: "funderArraySize",
        params: {},
    })

    const { runContractFunction: ethToDollar } = useWeb3Contract({
        abi: abi,
        contractAddress: fundMeAddress,
        functionName: "ethToDollar",
        params: {
            eth: 1,
        },
    })

    const { runContractFunction: getFunderToAmount } = useWeb3Contract({
        abi: abi,
        contractAddress: fundMeAddress,
        functionName: "getFunderToAmount",
        params: {
            funder: account,
        },
    })

    const { runContractFunction: getContractAmount } = useWeb3Contract({
        abi: abi,
        contractAddress: fundMeAddress,
        functionName: "getContractAmount",
        params: {},
    })

    useEffect(() => {
        console.log("IsWeb3Enabled: ", isWeb3Enabled)

        if (isWeb3Enabled) {
            async function updateUI() {
                console.log("updating UI...")
                const dol = (await ethToDollar()).toString()
                setDollar(dol)
                const size = (await funderArraySize()).toString()
                setSize(size)
                const amount = (await getFunderToAmount()).toString()
                setAmount(amount)
                const cValue = (await getContractAmount()).toString()
                setContractValue(cValue)
            }
            updateUI()
        }
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

    return (
        <div className="p-5">
            Fund Me at least 50 Dollars and 1 Eth in Dollar is {dollar} <br />
            Total Amount You have Funded is {ethers.utils.formatUnits(amount, "ether")} Eth
            <br />
            Total Number of Funders are: {size}
            <br />
            Contract Value is : {ethers.utils.formatUnits(contractValue, "ether")} Eth
            <br />
            <br />
            <br />
            <div className="flex flex-row">
                <Input
                    label="FundMe"
                    name="FundMe"
                    onChange={(e) => {
                        console.log(
                            "onChange: ",
                            (e.target.value * 1000000000000000000).toString()
                        )
                        setInputValue((e.target.value * 1000000000000000000).toString())
                    }}
                />
                <div className="ml-7">
                    <Button
                        color="blue"
                        size="large"
                        onClick={async function () {
                            await fund({
                                // onComplete
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        text={
                            isLoading || isFetching ? (
                                <div className="animate-spin spinner-border h-6 w-6 mr-2 border-b-2 rounded-full bg-blue-900" />
                            ) : (
                                <div>Fund It</div>
                            )
                        }
                        theme="colored"
                        disabled={isFetching || isLoading}
                    />
                </div>
            </div>
            <p>Input Amount: {inputValue}</p>
            {fundMeAddress ? (
                <div>
                    <br />
                    <Button
                        customize={{
                            backgroundColor: "#9ECCEA",
                            fontSize: 20,
                            onHover: "darken",
                            textColor: "#112F5C",
                        }}
                        onClick={async function () {
                            await fund({
                                // onComplete
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        text="Fund"
                        theme="custom"
                    />

                    <Button
                        customize={{
                            backgroundColor: "#9ECCEA",
                            fontSize: 20,
                            onHover: "darken",
                            textColor: "#112F5C",
                        }}
                        onClick={async function () {
                            await withdraw({
                                // onComplete
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        text="Withdraw"
                        theme="custom"
                    />
                    <Button
                        customize={{
                            backgroundColor: "#9ECCEA",
                            fontSize: 20,
                            onHover: "darken",
                            textColor: "#112F5C",
                        }}
                        onClick={async function () {
                            await getContractAmount({
                                // onComplete
                                // onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        text="Contract Value"
                        theme="custom"
                    />
                </div>
            ) : (
                <div>No Contract Address Found</div>
            )}
        </div>
    )
}

// import React, { useEffect, useState } from "react";
// import Web3 from "web3";
// import axios from "axios";
// import Web3Modal from "web3modal";
// import { nftaddress, nftmarketaddress } from "../config";
// import NFT from "../pages/build/contracts/NFT.json";
// import Market from "../pages/build/contracts/NFTMarket.json";

// require("dotenv").config();
// const Provider = require("@truffle/hdwallet-provider");
// //const fromAdd = await web3.utils.toChecksumAddress('0x3EEe74823c59E709606d89BF10f2424465Ba69F9')
// const priKey = process.env.PRI_KEY;
// const provider = new Provider(priKey, process.env.RINKEBY_URL);

// export default function Home() {
//   const [nfts, setNfts] = useState([]);
//   const [nftItems, setNftItems] = useState([]);
//   const [loadingState, setLoadingState] = useState("not-loaded");

//   async function loadData() {
//     // const web3Modal = new Web3Modal();
//     // const connection = await web3Modal.connect();
//     // const web3 = new Web3(connection);

//     const web3 = new Web3(provider);
//     const network = await web3.eth.net.getNetworkType();
//     const accounts = await web3.eth.getAccounts();
//     const networkId = await web3.eth.net.getId();

//     const marketData = await Market.networks[networkId];
//     const nftData = await NFT.networks[networkId];
//     console.log("Market : ", marketData, "   NFT : ", nftData);
//     let mContract = new web3.eth.Contract(Market.abi, nftmarketaddress);
//     let nftContract = new web3.eth.Contract(NFT.abi, nftaddress);
//     console.log(
//       "Market Contract : ",
//       mContract,
//       "    NFT Contract : ",
//       nftContract
//     );

//     let fetchNfts = await mContract.methods
//       .fetchMarketItems2()
//       .send({ from: accounts[0] });
//     let totalNFTs = await mContract.methods._itemIds().call();
//     let unsoldNfts = await mContract.methods.unsoldItemCount().call();
//     console.log("Total NFTs: ", totalNFTs, "UnSold NFTs : ", unsoldNfts);

//     for (var i = 0; i < unsoldNfts; i++) {
//       let unsoldNft = await mContract.methods.idToUnsoldMarketItem(i).call();

//       const tokenUri1 = await nftContract.methods
//         .tokenURI(unsoldNft.tokenId)
//         .call();
//       console.log("URI : ", tokenUri1);
//       const meta = await axios.get(tokenUri1);
//       let price = web3.utils.toNumber(unsoldNft.price.toString());
//       console.log("price : ", price);

//       let obj = {
//         price,
//         tokenId: Number(unsoldNft.tokenId),
//         seller: unsoldNft.seller,
//         owner: unsoldNft.owner,
//         image: meta.data.image,
//         name: meta.data.name,
//         description: meta.data.description,
//       };
//       console.log("obj NFTs : ", obj);
//       setNfts((nfts) => [...nfts, obj]);
//     }
//     setLoadingState("loaded");
//   }

//   async function buyNFTs(nft) {
//     const web3Modal = new Web3Modal();
//     const connection = await web3Modal.connect();
//     const web3 = new Web3(connection);
//     const accounts = await web3.eth.getAccounts();
//     console.log("Acc : ", accounts);

//     let mContract = new web3.eth.Contract(Market.abi, nftmarketaddress);
//     let nftContract = new web3.eth.Contract(NFT.abi, nftaddress);

//     const price = web3.utils.toNumber(nft.price.toString());
//     console.log(
//       "Price in Buy: ",
//       price,
//       " tokenId: ",
//       nft.tokenId,
//       " Acc: ",
//       accounts[0]
//     );
//     let listingPrice = await mContract.methods.getListingPrice().call();
//     listingPrice = listingPrice.toString();
//     let transaction = await mContract.methods
//       .sellMarketItem(nftaddress, nft.tokenId)
//       .send({ from: accounts[0], value: listingPrice });

//     loadData();
//   }

//   useEffect(() => {
//     loadData();
//   }, []);

//   async function load() {
//     console.log("Load");
//     await loadData();
//   }

//   if (loadingState === "loaded" && !nfts.length)
//     return <h1>Loaded No Items Available</h1>;
//   if (!nfts.length)
//     return (
//       <div>
//         <button onClick={load}>Load</button>
//         <h1>Loading Plzzzz Wait loading state: {loadingState}</h1>
//       </div>
//     );

//   return (
//     <div className="flex-justify-center">
//       <div className="px-4" style={{ maxWidth: "1600px" }}>
//         <div className="grid grid-cols-1 sx:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
//           {nfts.map((nft, key) => {
//             return (
//               <div
//                 key={key}
//                 className="border shadow rounded-xl overflow-hidden"
//               >
//                 <img src={nft.image} />
//                 <div>
//                   <p
//                     style={{ height: "64px" }}
//                     className="text-2xl font-semibold"
//                   >
//                     {nft.name}
//                   </p>
//                   <div style={{ height: "70px", overflow: "hidden" }}>
//                     <p className="text-gray-400">{nft.description}</p>
//                   </div>
//                 </div>
//                 <div className="p-4 bg-black">
//                   <p className="text-2xl mb-4 font-bold text-white">
//                     {nft.price} ETH
//                   </p>
//                   <button
//                     className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
//                     onClick={() => buyNFTs(nft)}
//                   >
//                     Buy
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }
