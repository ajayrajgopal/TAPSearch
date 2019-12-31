const bodyParser = require("body-parser");
const express = require("express");
const app = express();
var session = require("express-session");
var http = require("http");
var url = require("url");
var formidable = require("formidable");
const httpServer = http.createServer(app);
const pdf = require("pdf-parse");
var cors = require("cors");
var util = require("util");
var path = require("path");

fs = require("fs");
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
const PORT = process.env.PORT || 80;
httpServer.listen(PORT, () => {
  console.log("HTTP Server running on port " + PORT);
});
app.use(
  cors({
    credentials: true,
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "jdfgndwu3484u32uw",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 9
    }
  })
);
app.get("/sea", (req, res) => {
  res.send("hello");
});
app.get("/search", (req, res) => {
  var query = decodeURIComponent(req.query.query)
    .toLowerCase()
    .trim();
  if (
    typeof req.session.wordIndex === "undefined" ||
    typeof req.session.wordIndex[query] === "undefined" ||
    req.session.wordIndex[query].length === 0
  ) {
    res.send("not found");
  } else {
    var matches = [];
    var paraList = req.session.paraList;
    for (var i = 0; i < paraList.length; i++) {
      if (req.session.wordIndex[query].includes(i)) matches.push(paraList[i]);
    }
    res.send(matches);
  }
});

app.post("/indexdata", async (req, res) => {
  const data = req.body.data.replace(/ \n/g, "\n");
  const paraList = data.split("\n\n");
  const wordList = paraList.map(function(para) {
    return Array.from(new Set(para.split(/\.|,|\s/)));
  });
  var wordMap = {};
  for (var i = 0; i < wordList.length; i++) {
    for (var j = 0; j < wordList[i].length; j++) {
      var word = wordList[i][j].toLowerCase();
      if (typeof wordMap[word] === "undefined") wordMap[word] = [];
      if (wordMap[word].length <= 10) wordMap[word].push(i);
    }
  }
  req.session.wordIndex = wordMap;
  req.session.paraList = paraList;
  res.send("indexed");
});

app.get("/cleardata", (req, res) => {
  req.session.wordIndex = {};
  res.send("deleted");
});
