const express = require("express");
const app = express();
const mongoose = require("mongoose");

const bodyParser = require("body-parser");

const cors = require("cors");

require("dotenv").config();

const AuthRoute = require('./routes/Auth')
const VideoRoute = require('./routes/Video')
const TypeRoute = require('./routes/Type')
const CommentRoute = require('./routes/Comment')

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.hpawt.mongodb.net/dtube-server?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("MongoDB connected!");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

connectDB();
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

app.use(cors());

app.get("/", (req, res) => res.send("datisekai"));

app.use('/auth',AuthRoute)
app.use('/video',VideoRoute)
app.use('/type',TypeRoute)
app.use('/comment',CommentRoute)

const PORT = process.env.PORT || 5098;

app.listen(PORT, () => console.log(`Server start on port ${PORT}`));