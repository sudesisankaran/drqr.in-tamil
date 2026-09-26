import { useLayoutEffect } from 'react'

type Props = {
    children: React.ReactNode
}

const Scroll = ({ children }: Props) => {

    useLayoutEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <>{children}</>
    )
}

export default Scroll