import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"

function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider
            initializeOnMount={false}
            // appId="X2qKufncqgFCSIDGUYvA5sKWw9jo89rcDPriPBjt"
            // serverUrl="https://ajungtl0k8i6.usemoralis.com:2053/server"
            // masterKey="gkdfygKAoLtJb98DIr2lZzcpJ62faTxNvlgcEfVv"
        >
            <NotificationProvider>
                <Component {...pageProps} />
            </NotificationProvider>
        </MoralisProvider>
    )
}

export default MyApp
