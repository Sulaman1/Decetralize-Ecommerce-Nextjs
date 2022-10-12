import { ConnectButton, Button } from "web3uikit"
import { useRouter } from 'next/router'

export default function Headers() {
    const router = useRouter()

    return (
        <div className="p-5 border-b-2 flex flex-row">
            <h1 className="py-2 px-2 font-blog text-3xl">
                <a onClick={() => router.push('/')} >Decentralize Ecommerce</a>
            </h1>


            <h1 className="py-4 px-2 font-blog text-3xl">
            <Button
                customize={{
                    backgroundColor: '#9EC7EA',
                    fontSize: 20,
                    onHover: 'darken',
                    textColor: '#0F7FFF'
                }}
                onClick={() => router.push('/home')}
                text="Home"
                theme="custom"
            />
            </h1>

            <h1 className="py-4 px-2 font-blog text-3xl">
            <Button
                customize={{
                    backgroundColor: '#9EC7EA',
                    fontSize: 20,
                    onHover: 'darken',
                    textColor: '#0F7FFF'
                }}
                onClick={() => router.push('/create-item')}
                text="Create Item"
                theme="custom"
            />
            </h1>

            <h1 className="py-4 px-2 font-blog text-3xl">
            <Button
                customize={{
                    backgroundColor: '#9EC7EA',
                    fontSize: 20,
                    onHover: 'darken',
                    textColor: '#0F7FFF'
                }}
                onClick={() => router.push('/creator-dashboard')}
                text="Dashboard"
                theme="custom"
            />
            </h1>

            <h1 className="py-4 px-2 font-blog text-3xl">
            <Button
                customize={{
                    backgroundColor: '#9EC7EA',
                    fontSize: 20,
                    onHover: 'darken',
                    textColor: '#0F7FFF'
                }}
                onClick={() => router.push('/my-assets')}
                text="My Assets"
                theme="custom"
            />
            </h1>


            <h1 className="py-4 px-2 font-blog text-3xl">
            <Button
                customize={{
                    backgroundColor: '#9EC7EA',
                    fontSize: 20,
                    onHover: 'darken',
                    textColor: '#0F7FFF'
                }}
                onClick={() => router.push('/')}
                text="Support"
                theme="custom"
            />
            </h1>

            <div className="ml-auto px-2 py-2 ">
                <ConnectButton />
            </div>
        </div>
    )
}
