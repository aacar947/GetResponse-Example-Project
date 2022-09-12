require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const { type } = require("os");
const { json } = require("body-parser");
const app = express();

/* const host = process.env.HOST; */
const port = process.env.PORT;
const campaignId = process.env.CAMP_ID;
const apiKey = process.env.API_KEY;
const cfCountryId = process.env.CF_COUNTRY_ID;
const cfBirthdateId = process.env.CF_BIRTHDATE_ID;
const faLink = `https://kit.fontawesome.com/${process.env.FA_KIT_CODE}.js`;
const grLink = `https://api.getresponse.com/v3/custom-fields/${cfCountryId}`;
const messages = {
  400: "Uh Oh! There was an error. Please try again later.",
  1000: "Please fill in all the required fields.",
  1002: "Please enter a valid email address and try again.",
  1008: "The email address has already been used.",
};
let ejsLocals = {
  message: "",
  fnameValue: "",
  lnameValue: "",
  emailValue: "",
  dateValue: "",
  countryValue: "",
};
//GetResponse Header
const options = {
  headers: {
    "X-Auth-Token": `api-key ${apiKey}`,
    "Content-Type": "application/json",
  },
};
let countrys = {};

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("signup", { ...ejsLocals, falink: faLink });
  Object.keys(ejsLocals).forEach((key) => (ejsLocals[key] = ""));
});

//request: get the values of requested custom field from getresponse
app.get("/countrys", (req, res) => {
  if (Object.keys(countrys).length <= 0) {
    let request = https.request(
      grLink,
      { method: "GET", ...options },
      (response) => {
        response.on("data", async (dt) => {
          countrys = await JSON.parse(await dt).values;
          res.send(countrys);
        });
      }
    );
    request.end();
  } else {
    res.send(countrys);
  }
});

app.post("/", async (req, res) => {
  let fName = formatName(req.body.fName);
  let lName = formatName(req.body.lName);
  const date = req.body.date;
  const country = req.body.country;
  let customFields = [];
  console.log(country + " ");
  //getresponse json payload
  let body = {
    name: `${fName} ${lName}`,
    email: req.body.email,
    dayOfCycle: "0",
    campaign: {
      campaignId: campaignId,
    },
    customFieldValues: [],
  };
  //push optional custom fields if it has a value
  if (date != "") {
    customFields.push({
      customFieldId: cfBirthdateId,
      value: [date],
    });
  }
  if (country != "") {
    customFields.push({
      customFieldId: cfCountryId,
      value: [country],
    });
  }
  body.customFieldValues = customFields;
  body = JSON.stringify(body);
  const url = "https://api.getresponse.com/v3/contacts/";
  try {
    let request = https.request(
      url,
      { method: "POST", ...options },
      (response) => {
        console.log("Status Code: " + response.statusCode);
        if (response.statusCode == 202) {
          res.sendFile(__dirname + "/succsess.html");
        } else {
          response.on("data", (dt) => {
            dt = JSON.parse(dt);
            ejsLocals.fnameValue = `value="${fName}"`;
            ejsLocals.lnameValue = `value="${lName}"`;
            ejsLocals.emailValue = `value="${req.body.email}"`;
            ejsLocals.dateValue = `value="${date}"`;
            ejsLocals.countryValue = `value="${country}"`;
            console.log(dt.code);
            ejsLocals.message = messages[dt.code] || messages[400];
            console.log(ejsLocals.message);
          });
          res.redirect("/");
        }
      }
    );
    request.write(body);
    request.end();
  } catch (err) {
    console.log(err);
  }
});
function formatName(name) {
  name = name.split(" ");
  if (name.length <= 0) return "";
  name = name.filter((x) => x);
  name.forEach(
    (e, i) => (name[i] = e.slice(0, 1).toUpperCase() + e.slice(1).toLowerCase())
  );
  return name.join(" ");
}
app.listen(port, () => console.log(`Listening at port ${port}`));
