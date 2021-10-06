import React, { useEffect, useState } from "react"
import { Card } from "../components/Card"
import { Grid } from "../elements"
// import { Grid, Text } from "../elements"
import { realtime } from "../shared/firebase"
import { useSelector } from "react-redux"

export const Notification = (props) => {
  // console.log("noti", props)

  const user = useSelector((state) => state.user.user)

  const [noti, setNoti] = useState([])
  console.log("nit", user)

  useEffect(() => {
    if (!user) {
      return
    }

    const notiDB = realtime.ref(`noti/${user.uid}/list`)

    const _noti = notiDB.orderByChild("insert_dt")

    _noti.once("value", (snapshot) => {
      if (snapshot.exists()) {
        let _data = snapshot.val()
        console.log(_data)

        let _noti_list = Object.keys(_data)
          .reverse()
          .map((value) => {
            return _data[value]
          })
        console.log(_noti_list)

        setNoti(_noti_list)
      }
    })
    // const _noti =
  }, [user])

  return (
    <>
      <Grid padding="16px" bg="#efefef">
        {noti.map((n, i) => {
          return <Card {...n} key={`noti_${i}`}></Card>
        })}
      </Grid>
    </>
  )
}
