const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");

const { default: mongoose } = require("mongoose");

const app = express();
const PORT = 3000;

dotenv.config();

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "waleed",
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

//connect to mongodb
const url = process.env.MONGODB_URI;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDb connection error"));
db.once("open", () => {
  console.log("Connected to MongoDb");
});



app.use("/users", userRoutes);

// Define routes to render HTML pages
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/", (req, res) => {
  res.status(200);
  res.send("Welcome to root url of the ");
});


const authenticateSession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Access denied. User not logged in.' });
  }
  next();
};


app.get("/load_categories",authenticateSession, async (req, res) => {
  try {
    const { page = 0 } = req.body;// set default to 0

    console.log("page: is", page);

    const apiUrl = "https://demo2.meals4u.net/fe/api.test.php";
    const requestData = new URLSearchParams();
    requestData.append("page", page);

    const response = await axios.post(apiUrl, requestData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log(response.data);

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, (error) => {
  if (!error) console.log("Server is Started..." + PORT);
  else console.log("Error occurred...", error);
});
