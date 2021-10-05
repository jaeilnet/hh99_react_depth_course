import React from "react"
import { Card } from "../components/Card"
import { Grid } from "../elements"
// import { Grid, Text } from "../elements"

export const Notification = (props) => {
  // console.log("noti", props)

  let noti = [
    { user_name: "jaeilit", post_id: "post1" },
    { user_name: "jaeilit", post_id: "post1" },
    { user_name: "jaeilit", post_id: "post1" },
    { user_name: "jaeilit", post_id: "post1" },
    { user_name: "jaeilit", post_id: "post1" },
    { user_name: "jaeilit", post_id: "post1" },
  ]
  return (
    <>
      <Grid padding="16px" bg="#efefef">
        {noti.map((n) => {
          return <Card {...n} key={n.post_id}></Card>
        })}
      </Grid>
    </>
  )
}
