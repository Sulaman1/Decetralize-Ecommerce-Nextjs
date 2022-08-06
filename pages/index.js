import Head from "next/head"
import Header from "../components/Header"
import FundMeComp from "../components/FundMeComp"

export default function Home() {
    return (
        <div>
            <Head>
                <title>Smart Contract Lottery</title>
                <meta name="description" content="Our Smart Contract Lottery" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <FundMeComp />
        </div>
    )
}
