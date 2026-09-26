import { Link } from 'react-router-dom'

const PageNotFound = () => {
    return (
        <div className='h-screen w-full flex flex-col justify-center items-center bg-gray-100 text-center px-4'>
            <h1 className='text-6xl font-bold text-red-500'>404</h1>
            <h2 className='text-2xl font-semibold mt-4'>Page Not Found</h2>
            <p className='text-gray-600 mt-2'>
                Sorry, the page you are looking for doesn’t exist or has been moved.
            </p>
            <Link
                to="/"
                className='mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
            >
                Go Back Home
            </Link>
        </div>
    )
}

export default PageNotFound