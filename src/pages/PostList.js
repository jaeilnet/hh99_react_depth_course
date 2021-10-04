// PostList.js
import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Post from "../components/Post"
import { actionCreators as postActions } from "../redux/modules/post"

const PostList = (props) => {
  const dispatch = useDispatch()

  const user_info = useSelector((state) => state.user.user)
  const post_list = useSelector((state) => state.post.list)
  console.log("postlist", post_list)
  console.log("userinfo", user_info)

  useEffect(() => {
    if (post_list.length === 0) {
      dispatch(postActions.getPostFB())
    }
  }, [])

  return (
    <React.Fragment>
      {/* <Post /> */}
      {post_list.map((p, idx) => {
        console.log("p", p)

        if (user_info && p.user_info.user_id === user_info.uid) {
          return <Post key={p.id} {...p} is_me />
        }
        return <Post key={p.id} {...p} />
      })}
    </React.Fragment>
  )
}

export default PostList
