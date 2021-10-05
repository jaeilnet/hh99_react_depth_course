import { createAction, handleActions } from "redux-actions"
import produce from "immer"
import "moment"
import { firestore, realtime } from "../../shared/firebase"
import moment from "moment"
import firebase from "@firebase/app-compat"
import { actionCreators as postActions } from "./post"

const SET_COMMENT = "SET_COMMENT"
const ADD_COMMENT = "ADD_COMMENT"

const LOADING = "LOADING"

const setComment = createAction(SET_COMMENT, (post_id, comment_list) => ({
  post_id,
  comment_list,
}))
const addComment = createAction(ADD_COMMENT, (post_id, comment) => ({
  post_id,
  comment,
}))

const loading = createAction(LOADING, (is_loading) => ({ is_loading }))

const initialState = {
  list: [],
  is_loading: false,
}

const addCommentFB = (post_id, contents) => {
  return function (dispatch, getState, { history }) {
    const commentDB = firestore.collection("comment")

    const post = getState().post.list.find((l) => l.id === post_id)

    console.log("post_id", post)

    const user_info = getState().user.user
    console.log("info", user_info)

    let comment = {
      post_id: post_id,
      user_id: user_info.uid,
      user_name: user_info.user_name,
      user_profile: user_info.user_profile,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    }

    commentDB.add(comment).then((doc) => {
      const postDB = firestore.collection("post")

      const increment = firebase.firestore.FieldValue.increment(1)
      console.log("i", increment)
      comment = { ...comment, id: doc.id }
      postDB
        .doc(post_id)
        .update({ comment_cnt: increment })
        .then((_post) => {
          dispatch(addComment(post_id, comment))

          if (post) {
            dispatch(
              postActions.editPost(post_id, {
                comment_cnt: parseInt(post.comment_cnt) + 1,
              })
            )
          }

          const notiDB = realtime.ref(`noti/${post.user_info.user_id}`)
          notiDB.update({ read: false })
        })
    })
  }
}

const getCommentFB = (post_id = null) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) {
      return
    }
    // firestore 에서 db 가져오기
    const commentDB = firestore.collection("comment")

    // 쿼리 날리기 // 작성일자를 역순으로 정렬
    commentDB
      .where("post_id", "==", post_id)
      .orderBy("insert_dt", "desc")
      .get()
      .then((docs) => {
        let list = []

        //  데이터 넣어주기
        docs.forEach((doc) => {
          list.push({ ...doc.data(), id: doc.id })
        })
        console.log("dd", list, post_id)
        dispatch(setComment(post_id, list))
      })
      .catch((err) => {
        console.log(err, "댓글정보 가져오기 에러입니다.")
      })
  }
}

export default handleActions(
  {
    [SET_COMMENT]: (state, action) =>
      produce(state, (draft) => {
        console.log("aaa", state, draft.list, action.payload.post_id)
        // draft.list[action.payload.post_id] = action.payload.list
      }),
    [ADD_COMMENT]: (state, action) =>
      produce(state, (draft) => {
        // draft.list[action.payload.post_id].unshift(action.payload.comment)
      }),
    [LOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading
      }),
  },
  initialState
)

const actionCreators = {
  getCommentFB,
  addCommentFB,
  setComment,
  addComment,
}

export { actionCreators }
