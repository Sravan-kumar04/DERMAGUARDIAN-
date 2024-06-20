const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = require("./index");
const port = process.env.PORT;

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then((conn) => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log(err);
    console.log("DB not connected successfully");
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
