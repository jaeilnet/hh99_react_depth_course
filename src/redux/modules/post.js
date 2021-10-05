import { createAction, handleActions } from "redux-actions"
import { produce } from "immer"
import { firestore, storage } from "../../shared/firebase"
import { actionCreators as imageActions } from "../modules/image"
import moment from "moment"

//  액션타입 정의

const SET_POST = "SET_POST"
const ADD_POST = "ADD_POST"
const EDIT_POST = "EDIT_POST"
const LOADING = "LOADING"

// 액션 만들기

const setPost = createAction(SET_POST, (post_list, paging) => ({
  post_list,
  paging,
}))
const addPost = createAction(ADD_POST, (post) => ({ post }))
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}))
const loading = createAction(LOADING, (is_loading) => ({ is_loading }))

const initialState = {
  list: [],
  paging: {
    start: null,
    next: null,
    size: 3,
  },
  is_loading: false,
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

const getPostFB = (start = null, size = 3) => {
  return function (dispatch, getState, { history }) {
    let _paging = getState().post.paging

    if (_paging.start && !_paging.next) {
      return
    }

    dispatch(loading(true))

    const postDB = firestore.collection("post")

    let query = postDB.orderBy("insert_dt", "desc")

    if (start) {
      query = query.startAt(start)
    }

    query
      .limit(size + 1)
      .get()
      .then((docs) => {
        let post_list = []

        let paging = {
          start: docs.docs[0],
          next:
            docs.docs.length === size + 1
              ? docs.docs[docs.docs.length - 1]
              : null,
          size: size,
        }

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

        post_list.pop()

        dispatch(setPost(post_list, paging))
      })
  }
}

const getOnePostFB = (id) => {
  return function (dispatch, getState, { histroy }) {
    const postDB = firestore.collection("post")

    postDB
      .doc(id)
      .get()
      .then((doc) => {
        let _post = doc.data()
        let post = Object.keys(_post).reduce(
          (acc, cur) => {
            if (cur.indexOf("user") !== -1) {
              return {
                ...acc,
                user_info: { ...acc.user_info, [cur]: _post[cur] },
              }
            }
            return { ...acc, [cur]: _post[cur] }
          },
          { id: doc.id, user_info: {} }
        )
        dispatch(setPost([post]))
      })


  }
}

// 리듀서

export default handleActions(
  {
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.push(...action.payload.post_list)

        draft.list = draft.list.reduce((acc, cur) => {
          if (acc.findIndex((a) => a.id === cur.id) === -1) {
            return [...acc, cur]
          } else {
            acc[acc.findIndex((a) => a.id === cur.id)] = cur
            return acc
          }
        }, [])

        if (action.payload.paging) {
          draft.paging = action.payload.paging
        }

        draft.is_loading = false
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
    [LOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading
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
  editPost,
  getOnePostFB,
}

export { actionCreators }
