import React from "react";
import TextField from "@material-ui/core/TextField";

function Search({ query, setQuery }) {
  return (
    <TextField
      id="outlined-basic"
      label="Search"
      variant="outlined"
      style={{backgroundColor: "#FFF" }}
      onChange={event => {
        setQuery(event.target.value);
      }}
    />
  );
}
export default Search;
