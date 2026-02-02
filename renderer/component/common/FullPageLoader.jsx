const FullPageLoader = (props) => {
    let { show } = props
    return (
        show && <div className="loader-overlay">
            <div className="loader"></div>
        </div>
    );
};

export default FullPageLoader;
