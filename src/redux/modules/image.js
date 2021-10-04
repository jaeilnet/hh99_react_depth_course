import { createAction, handleActions } from "redux-actions"
import { produce } from "immer"
import { storage } from "../../shared/firebase"

//  액션 타입 정의

const UPLOADING = "UPLOADING"
const UPLOAD_IMAGE = "UPLOAD_IMGAE"
const SET_PREVIEW = "SET_PREVIEW"

//  액션 생성 함수

const uploading = createAction(UPLOADING, (uploading) => ({ uploading }))
const uploadImage = createAction(UPLOAD_IMAGE, (image_url) => ({ image_url }))
const setPreview = createAction(SET_PREVIEW, (preview) => ({
  preview,
}))

const initialState = {
  image_url: "",
  uploading: false,
  preview: null,
}

const uplaodImageFB = (image) => {
  return function (dispatch, getState, { history }) {
    dispatch(uploading(true))

    const _upload = storage.ref(`images/${image.name}`).put(image)

    _upload.then((snapshot) => {
      snapshot.ref.getDownloadURL().then((url) => {
        dispatch(uploadImage(url))
      })
    })
  }
}

const setPreviewFB = (preview_img) => {
  return function (dispatch, getState, { history }) {}
}

//리듀서
export default handleActions(
  {
    [UPLOAD_IMAGE]: (state, action) =>
      produce(state, (draft) => {
        draft.image_url = action.payload.image_url
        draft.uploading = false
      }),
    [UPLOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.uploading = action.payload.uploading
      }),
    [SET_PREVIEW]: (state, action) =>
      produce(state, (draft) => {
        draft.preview = action.payload.preview
      }),
  },
  initialState
)

const actionCreators = {
  uplaodImageFB,
  setPreview,
  // setPreviewFB
}

export { actionCreators }
