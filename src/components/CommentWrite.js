import React, { useState } from "react"

import { Grid, Input, Button } from "../elements"
import { actionCreators as commentActions } from "../redux/modules/comment"
import { useDispatch, useSelector } from "react-redux"

const CommentWrite = (props) => {
  const dispatch = useDispatch()
  const [comment_text, setCommentText] = useState()

  const onChange = (e) => {
    setCommentText(e.target.value)
  }

  const wirte = () => {
    console.log(comment_text)
    dispatch(commentActions.addCommentFB(props.post_id, comment_text))
    setCommentText("")
  }
  return (
    <React.Fragment>
      <Grid padding="16px" is_flex>
        <Input
          placeholder="댓글 내용을 입력해주세요 :)"
          _onChange={onChange}
          value={comment_text}
          onSubmit={wirte}
          is_submit
        />
        <Button width="50px" margin="0px 2px 0px 2px" _onClick={wirte}>
          작성
        </Button>
      </Grid>
    </React.Fragment>
  )
}

export default CommentWrite
