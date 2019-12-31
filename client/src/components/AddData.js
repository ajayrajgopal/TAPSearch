import React from "react";
import TextField from "@material-ui/core/TextField";

function AddData({ data, setData }) {
  return (
    <div>
      <TextField
        id="outlined-multiline-static"
        multiline
        rows="8"
        label="Enter document content here"
        placeholder=""
        style={{ width: "100%", backgroundColor: "#FFF" }}
        variant="outlined"
        value={data}
        id="data"
        name="data"
        onChange={event => {
          setData(event.target.value);
        }}
      />
    </div>
  );
}

export default AddData;
