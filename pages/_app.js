import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"

function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider
            appId="8PaeNrrCFy431ZRVHX4SN0uWz8zeFF4DHBp0JWGd"
            serverUrl="https://yll9sdqjq8dn.usemoralis.com:2053/server"
            masterKey="MRvDUd9LKpAq28lzutvSgyYJzc61kO2P3ZAJwwo4"
        >
            <NotificationProvider>
                <Component {...pageProps} />
            </NotificationProvider>
        </MoralisProvider>
    )
}

export default MyApp
