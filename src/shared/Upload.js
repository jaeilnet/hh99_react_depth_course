import React, { useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../elements"
import { actionCreators as imageActions } from "../redux/modules/image"

const Upload = (props) => {
  const imgRef = useRef()
  const dispatch = useDispatch()
  const is_uploading = useSelector((state) => state.image.uploading)

  const setFiles = () => {
    const reader = new FileReader()

    const file = imgRef.current.files[0]

    reader.readAsDataURL(file)
    reader.onloadend = () => {
      console.log(reader.result)
      dispatch(imageActions.setPreview(reader.result))
    }
  }

  const upLoadFB = () => {
    let image = imgRef.current.files[0]
    dispatch(imageActions.uplaodImageFB(image))
  }
  return (
    <React.Fragment>
      <input
        type="file"
        onChange={setFiles}
        ref={imgRef}
        disabled={is_uploading}
      />
      <Button _onClick={upLoadFB}>업로드 하기</Button>
    </React.Fragment>
  )
}

export default Upload
