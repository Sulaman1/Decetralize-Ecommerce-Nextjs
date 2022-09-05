import Head from "next/head"
import Header from "../components/Header"
import FundMeComp from "../components/FundMeComp"

export default function Home() {
    return (
        <div>
            <Head>
                <title>Smart Ecommrerce</title>
                <meta name="description" content="Our Decentralize Ecommrerce" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <FundMeComp />
        </div>
    )
}
