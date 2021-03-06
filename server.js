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
//if (process.env.NODE_ENV === "production") {
app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});
//}
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
app.post("/search", (req, res) => {
  var query = req.body.query.toLowerCase().trim();
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
  let { wordMap, paraList } = await indexDoc(req.body.data);
  req.session.wordIndex = wordMap;
  req.session.paraList = paraList;
  console.log(wordMap);
  res.send("indexed");
});
function indexDoc(data) {
  return new Promise(function(resolve, reject) {
    data = data.replace(/ \n/g, "\n");
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

    resolve({ wordMap, paraList });
  });
}
app.post("/cleardata", (req, res) => {
  req.session.wordIndex = {};
  req.session.paraList = [];
  res.send("deleted");
});
app.post("/uploadfile", (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var extension = files.data.type;
    if (extension.substring(extension.length - 3) == "pdf") {
      fs.readFile(files.data.path, function(err, doc) {
        pdf(doc).then(async function(data) {
          let { wordMap, paraList } = await indexDoc(data.text);
          req.session.wordIndex = wordMap;
          req.session.paraList = paraList;
          res.send("indexed");
        });
      });
    } else {
      res.send("error");
    }
  });
});
