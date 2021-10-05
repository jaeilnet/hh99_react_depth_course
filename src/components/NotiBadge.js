import React, { useEffect, useState } from "react"
import { Badge } from "@material-ui/core"
import NotificationsIcon from "@mui/icons-material/Notifications"
import { realtime } from "../shared/firebase"
import { useSelector } from "react-redux"

export const NotiBadge = (props) => {
  const [is_read, setIsRead] = useState(true)
  const user_id = useSelector((state) => state.user.user.uid)
  const notiCheck = () => {
    const notiDB = realtime.ref(`noti/${user_id}`)
    notiDB.update({ read: true })
    props._onClick()
  }
  console.log("user_id", user_id)

  useEffect(() => {
    const notiDB = realtime.ref(`noti/${user_id}`)

    notiDB.on("value", (snapshot) => {
      setIsRead(snapshot.val().read)
      console.log(snapshot.val())
    })

    return () => notiDB.off()
  }, [])

  return (
    <>
      <Badge
        color="secondary"
        variant="dot"
        invisible={is_read}
        onClick={notiCheck}
      >
        <NotificationsIcon />
      </Badge>
    </>
  )
}

NotiBadge.defaultProps = {
  _onClick: () => {},
}
