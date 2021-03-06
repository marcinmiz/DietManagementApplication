import React from "react";
import UploadService from "../services/UploadFiles";
import {Button, Typography} from '@material-ui/core';
import Avatar from "@material-ui/core/Avatar";
import SpaIcon from '@material-ui/icons/Spa';
import ReceiptIcon from '@material-ui/icons/Receipt';

export default function UploadImages({currentImage, submitted, type, id}) {
    const [state, setState] = React.useState({
        currentFile: undefined,
        previewImage: undefined,

        message: "",
        isError: false,
    });

    React.useEffect(() => {

            if (currentImage !== "" && !state.currentFile) {
                setState({
                    ...state,
                    previewImage: currentImage
                });

            }

            if (submitted && currentFile) {
                upload();
            }
        }
        , [state.currentFile, state.previewImage, submitted]
    )

    function selectFile(event) {
        setState({
            currentFile: event.target.files[0],
            previewImage: URL.createObjectURL(event.target.files[0]),
            message: ""
        });
        document.getElementById("upload_container").classList.add("upload_container_image_added")
    };

    function upload() {

        UploadService.upload(state.currentFile, type, id)
            .then((response) => {
                setState({
                    message: response.data.message,
                    isError: false
                });
            })
            .catch((err) => {
                setState({
                    message: "Could not upload the image!",
                    currentFile: undefined,
                    isError: true
                });
            });
    }

    const {
        currentFile,
        previewImage,
        message,
        isError
    } = state;

    return (
        <div id="upload_container" className="upload_container">

            {type === 'product' && !previewImage ?
                <SpaIcon className="upload_image"/> :
                (
                    type === 'recipe' && !previewImage ?
                        <ReceiptIcon className="upload_image"/> :
                        (
                            <div>
                                <Avatar className="upload_image" src={previewImage} alt=""/>
                            </div>
                        )
                )}

            <div>
                {currentFile ? currentFile.name : null}
            </div>

            <label htmlFor="btn-upload">
                <input
                    id="btn-upload"
                    name="btn-upload"
                    style={{display: 'none'}}
                    type="file"
                    accept="image/*"
                    onChange={event => selectFile(event)}/>
                <Button
                    className="btn-choose"
                    variant="outlined"
                    component="span">
                    Choose Image
                </Button>
            </label>

            {message && (
                <Typography variant="subtitle2" className={`upload-message ${isError ? "error" : ""}`}>
                    {message}
                </Typography>
            )}
        </div>
    );
}