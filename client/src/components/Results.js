import React from "react";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

function Results({ result, setResult }) {
  return (
    <div>
      {result.map((value, index) => {
        return (
          <Card style={{ marginBottom: "5px" }}>
            <CardContent>
              <Typography>{value}</Typography>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default Results;
