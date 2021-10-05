// PostList.js
import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Post from "../components/Post"
import { Grid } from "../elements"
import { actionCreators as postActions } from "../redux/modules/post"
import { InfinityScroll } from "../shared/InfinityScroll"

const PostList = (props) => {
  const dispatch = useDispatch()

  const user_info = useSelector((state) => state.user.user)
  const post_list = useSelector((state) => state.post.list)
  const is_loading = useSelector((state) => state.post.is_loading)
  const paging = useSelector((state) => state.post.paging)

  const { history } = props
  // console.log("postlist", post_list)
  // console.log("userinfo", user_info)
  useEffect(() => {
    if (post_list.length < 2) {
      dispatch(postActions.getPostFB())
    }
  }, [])

  return (
    <React.Fragment>
      <Grid bg={"#EFF6FF"} padding="20px 0">
        {/* <Post /> */}
        <InfinityScroll
          callNext={() => {
            // console.log("Next")
            dispatch(postActions.getPostFB(paging.next))
          }}
          is_next={paging.next ? true : false}
          loading={is_loading}
        >
          {post_list.map((p, idx) => {
            // console.log("p", p)

            if (user_info && p.user_info.user_id === user_info?.uid) {
              return (
                <Grid
                  bg="#ffffff"
                  key={p.id}
                  _onClick={() => {
                    history.push(`/post/${p.id}`)
                  }}
                >
                  <Post key={p.id} {...p} is_me />
                </Grid>
              )
            } else {
              return (
                <Grid
                  bg="#ffffff"
                  key={p.id}
                  _onClick={() => {
                    history.push(`/post/${p.id}`)
                  }}
                >
                  <Post key={p.id} {...p} />
                </Grid>
              )
            }
          })}
        </InfinityScroll>
      </Grid>
    </React.Fragment>
  )
}

export default PostList
