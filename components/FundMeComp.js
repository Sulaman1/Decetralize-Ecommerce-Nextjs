import { useMoralis, useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
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
        functionName: "fund",
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
