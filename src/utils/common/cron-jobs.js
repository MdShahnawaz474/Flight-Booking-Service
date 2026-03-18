const cron = require("node-cron");

function scheduleCrons() {
  const { BookingService } = require("../../services/index.js");

  cron.schedule("*/30 * * * *", async () => {
    console.log("bookingService:", BookingService);
    const response = await BookingService.cancelOldBookings();
    console.log(response);
  });
}

module.exports = scheduleCrons;
