import React from "react"
import _ from "lodash"

export const Search = () => {
  const debounce = _.debounce((e) => {
    console.log(e.target.value)
  }, 1000)

  return (
    <div>
      <input type="text" onChange={debounce} />
    </div>
  )
}
