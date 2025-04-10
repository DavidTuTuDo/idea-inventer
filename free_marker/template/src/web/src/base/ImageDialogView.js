import React from "react";


class ImageDialogView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const href = this.props.href
        console.log(`href ===> ${href}`)
        return (
            <div
                className={"BaseImageDialogDiv"}>

                <img
                    className={"BaseImageDialogImg"}
                    src={href}/>

            </div>
        )
    }


}

export default ImageDialogView

