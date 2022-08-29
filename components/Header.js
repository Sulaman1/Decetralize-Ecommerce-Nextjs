import { ConnectButton } from "web3uikit"

export default function Headers() {
    return (
        <div className="p-5 border-b-2 flex flex-row">
            <h1 className="py-4 px-4 font-blog text-3xl">Decentralize Funding</h1>
            <div className="ml-auto px-4 py-2 ">
                <ConnectButton />
            </div>
        </div>
    )
}
