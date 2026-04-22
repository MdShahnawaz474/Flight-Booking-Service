const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  FLIGHT_BACKEND_URL: process.env.FLIGHT_BACKEND_URL,
};
