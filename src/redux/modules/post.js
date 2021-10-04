import { createAction, handleActions } from "redux-actions"
import { produce } from "immer"
import { firestore, storage } from "../../shared/firebase"
import { actionCreators as imageActions } from "../modules/image"
import moment from "moment"

//  액션타입 정의

const SET_POST = "SET_POST"
const ADD_POST = "ADD_POST"
const EDIT_POST = "EDIT_POST"

// 액션 만들기

const setPost = createAction(SET_POST, (post_list) => ({ post_list }))
const addPost = createAction(ADD_POST, (post) => ({ post }))
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}))

const initialState = {
  list: [],
}

const initialPost = {
  // id: 0,
  // user_info: {
  //   user_name: "mean0",
  //   user_profile:
  //     "https://dimg.donga.com/wps/NEWS/IMAGE/2019/04/25/95215551.1.jpg",
  // },
  image_url: "https://dimg.donga.com/wps/NEWS/IMAGE/2019/04/25/95215551.1.jpg",
  contents: "고양이네요!",
  comment_cnt: 0,
  insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
}

const editPostFB = (post_id = null, post = {}) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) {
      console.log("게시물 정보가 없어요")
      return
    }

    const _image = getState().image.preview

    const _post_idx = getState().post_list.findIndex((p) => p.id === post.id)
    const _post = getState().post_list[_post_idx]

    console.log(_post)

    const postDB = firestore.collection("post")

    if (_image === _post.image_url) {
      postDB
        .doc(post_id)
        .update(post)
        .then((doc) => {
          dispatch(editPost(post_id, { ...post }))
          history.replace("/")
        })
    } else {
      const user_id = getState().user.user.uid
      const _upload = storage
        .ref(`images/${user_id}_${new Date().getTime()}`)
        .putString(_image, "data_url")

      _upload
        .then((snapshot) => {
          snapshot.ref
            .getDownloadURL()
            .then((url) => {
              console.log(url)

              return url
            })
            .then((url) => {
              postDB
                .doc(post_id)
                .update({ ...post, image_url: url })
                .then((doc) => {
                  dispatch(editPost(post_id, { ...post, image_url: url }))
                  history.replace("/")
                })
            })
        })
        .catch((err) => {
          window.alert("에러입니다.")
          console.log("에러입니다.", err)
        })
    }
  }
}

const addPostFB = (contents = "") => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post")
    const _user = getState().user.user

    // 유저 정보는 fb에서 불러오기
    const user_info = {
      user_name: _user.user_name,
      user_id: _user.uid,
      user_profile: _user.user_profile,
    }

    const _post = {
      ...initialPost,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    }
    console.log({ ...user_info, ..._post })

    const _image = getState().img.preview

    const _upload = storage
      .ref(`images/${user_info.user_id}_${new Date().getTime()}`)
      .putString(_image, "data_url")

    _upload.then((snapshot) => {
      snapshot.ref
        .getDownloadURL()
        .then((url) => {
          console.log(url)
          return url
        })
        .then((url) => {
          postDB
            .add({ ...user_info, ..._post, image_url: url })
            .then((doc) => {
              let post = { user_info, ..._post, id: doc.id, image_url: url }
              dispatch(addPost(post))
              history.replace("/")

              dispatch(imageActions.setPreview(null))
            })
            .catch((err) => {
              window.alert("포스트 작성 실패")
              console.log("포스트 작성 실패 에러", err)
            })
        })
        .catch((err) => {
          window.alert("이미지업로드 문제")
          console.log("이미지 업로드 문제", err)
        })
    })
  }
}

const getPostFB = () => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post")

    postDB.get().then((docs) => {
      let post_list = []
      docs.forEach((doc) => {
        let _post = doc.data()

        let post = Object.keys(_post).reduce(
          (acc, cur) => {
            if (cur.indexOf("user_") !== -1) {
              return {
                ...acc,
                user_info: { ...acc.user_info, [cur]: _post[cur] },
              }
            }
            return {
              ...acc,
              [cur]: _post[cur],
            }
          },
          { id: doc.id, user_info: {} }
        )

        post_list.push(post)
      })
      dispatch(setPost(post_list))
    })
    // console.log("pd", postDB)
  }
}

// 리듀서

export default handleActions(
  {
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list = action.payload.post_list
      }),
    [ADD_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.post)
      }),
    [EDIT_POST]: (state, action) =>
      produce(state, (draft) => {
        let idx = draft.list.findIndex((p) => p.id === action.payload.post_id)

        draft.list[idx] = { ...draft.list[idx], ...action.payload.post }
      }),
  },
  initialState
)

const actionCreators = {
  setPost,
  addPost,
  getPostFB,
  addPostFB,
  editPostFB,
}

export { actionCreators }
