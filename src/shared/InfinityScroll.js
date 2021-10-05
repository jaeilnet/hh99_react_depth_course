import React, { useCallback, useEffect } from "react"
import _ from "lodash"
import { Spinner } from "../elements"

export const InfinityScroll = (props) => {
  const { callNext, children, is_next, loading } = props

  const _handleScorll = _.throttle(() => {
    if (loading) {
      return
    }

    const { innerHeight } = window
    const { scrollHeight } = document.body

    const scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop

    if (scrollHeight - innerHeight - scrollTop < 200) {
      callNext()
    }
  }, 300)

  const handleScorll = useCallback(_handleScorll, [loading])

  useEffect(() => {
    if (loading) {
      return
    }

    if (is_next) {
      window.addEventListener("scroll", handleScorll)
    } else {
      window.removeEventListener("scorll", handleScorll)
    }
    return () => window.removeEventListener("scroll", handleScorll)
  }, [is_next, loading])

  return (
    <>
      {props.children}
      {is_next && <Spinner />}
    </>
  )
}

InfinityScroll.defaultProps = {
  children: null,
  callNext: () => {},
  is_next: false,
  loading: false,
}
