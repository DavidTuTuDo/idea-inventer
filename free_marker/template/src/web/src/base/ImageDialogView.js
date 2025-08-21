const edit = true;

import React from "react";

class ImageDialogView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const href = this.props.href;
        return (
            <div className={"BaseImageDialogDiv"}>
                <img className={"BaseImageDialogImg"} src={href} />
            </div>
        );
    }
}

export default ImageDialogView;
