const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
async function connectToMongoDB(url) {
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

module.exports = {
  connectToMongoDB,
};
