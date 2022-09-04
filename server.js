require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const { type } = require("os");
const app = express();

const host = process.env.HOST;
const port = process.env.PORT;
const campaignId = process.env.CAMP_ID;
const apiKey = process.env.API_KEY;
let ejsLocals = {
  message: "",
  fnameValue: "",
  lnameValue: "",
  emailValue: "",
};

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("signup", ejsLocals);
  Object.keys(ejsLocals).forEach((key) => (ejsLocals[key] = ""));
});

app.post("/", (req, res) => {
  const data = JSON.stringify({
    name: req.body.fName + " " + req.body.lName,
    email: req.body.email,
    dayOfCycle: "0",
    campaign: {
      campaignId: campaignId,
    },
  });
  const url = "https://api.getresponse.com/v3/contacts/";
  const options = {
    method: "POST",
    headers: {
      "X-Auth-Token": `api-key ${apiKey}`,
      "Content-Type": "application/json",
    },
  };
  let request = https.request(url, options, (response) => {
    console.log("Status Code: " + response.statusCode);
    if (response.statusCode == 202) {
      res.sendFile(__dirname + "/succsess.html");
    } else {
      response.on("data", (dt) => {
        dt = JSON.parse(dt);
        ejsLocals.fnameValue = `value="${req.body.fName}"`;
        ejsLocals.lnameValue = `value="${req.body.lName}"`;
        ejsLocals.emailValue = `value="${req.body.email}"`;
        if (dt.code == 1002) {
          ejsLocals.message =
            "Please enter a valid email address and try again.";
        } else if (dt.code == 1008) {
          ejsLocals.message = "The email address has already been used.";
        } else {
          ejsLocals.message = "Uh Oh! There was an error. Please try again.";
        }
        console.log(ejsLocals.message);
      });
      res.redirect("/");
    }
  });
  request.write(data);
  request.end();
});

app.listen(port, host, () => console.log(`Listening at ${host}:${port}`));
