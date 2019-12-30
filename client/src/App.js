import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import AddData from "./components/AddData";
import Search from "./components/Search";
import Results from "./components/Results";

axios.defaults.withCredentials = true;
const qs = require("query-string");
const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    height: "100vh",
    backgroundColor: "#fafafa"
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    }
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  },
  resetContainer: {
    padding: theme.spacing(3)
  }
}));
function getSteps() {
  return ["Add new document", "Enter search term", "Results"];
}
function getStepContent(step, prop, setProp) {
  switch (step) {
    case 0:
      return <AddData data={prop} setData={setProp} />;
    case 1:
      return <Search query={prop} setQuery={setProp} />;
    case 2:
      if (prop.length > 0) return <Results result={prop} setResult={setProp} />;
      else return "No Matches Found";
    default:
      return "Unknown step";
  }
}
function App() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [prop, setProp] = React.useState("");
  const [result, setResult] = React.useState([]);
  const isEnabled = prop.length > 0;
  const steps = getSteps();

  const handleNext = () => {
    if (activeStep === 0) {
      var formData = { data: prop };
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };
      axios
        .post("/indexdata", qs.stringify(formData), config)
        .then(result => {
          if (result.data === "indexed")
            setActiveStep(prevActiveStep => prevActiveStep + 1);
          setProp("");
        })
        .catch(err => {
          console.log("Some Error Occurred");
        });
    } else if (activeStep === 1) {
      axios
        .get("/search?query=" + prop)
        .then(result => {
          setActiveStep(prevActiveStep => prevActiveStep + 1);
          console.log(result.data);
          if (result.data !== "not found") setResult(result.data);
        })
        .catch(err => {});
    } else if (activeStep === 2) {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setResult([]);
    setProp("");
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    axios
      .get("/cleardata")
      .then(result => {
        setResult([]);
        setProp("");
        setActiveStep(0);
      })
      .catch(err => {});
  };
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            TAPSearch
          </Typography>
        </Toolbar>
      </AppBar>
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        style={{ backgroundColor: "#fafafa" }}
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <Typography>
                {index !== 2
                  ? getStepContent(index, prop, setProp)
                  : getStepContent(index, result, setResult)}
              </Typography>
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                    disabled={!isEnabled}
                  >
                    {activeStep === steps.length - 1 ? "Finish" : "Next"}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper
          square
          elevation={0}
          className={classes.resetContainer}
          style={{ backgroundColor: "#fafafa" }}
        >
          <Typography>All Done!</Typography>
          <Button
            onClick={handleReset}
            variant="contained"
            className={classes.button}
            color="primary"
          >
            Reset
          </Button>
        </Paper>
      )}
    </div>
  );
}

export default App;
