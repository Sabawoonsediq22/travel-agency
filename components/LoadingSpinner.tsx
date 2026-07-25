const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => {
    return (
        <div className="loading-spinner">
            <div />
            <span className="sr-only">{message}</span>
        </div>
    )
}
export default LoadingSpinner
