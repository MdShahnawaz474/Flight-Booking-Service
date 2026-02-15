const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { ServerConfig } = require("../config");
const AppError = require("../utils/errors/appError");
const { StatusCodes } = require("http-status-codes");

const bookingRepository = new BookingRepository();
async function createBooking(data) {
  const transaction = await db.sequelize.transaction();

  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_BACKEND_URL}/flights/${data.flightId}`,
    );
    // console.log(typeof flight);
    const flightData = flight.data.data;
    const totalSeats = flightData.totalSeat;
    // console.log("Seats Requested:", data.noOfSeats);
    // console.log("Total Seats Available:", totalSeats);

    if (data.noOfSeats > totalSeats) {
      throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
    }

    const totalBillingAmount = flightData.price * data.noOfSeats;
    console.log(`Total Billing amount ${totalBillingAmount}`);
    const bookingPayload = { ...data, totalCost: totalBillingAmount };
    const booking = await bookingRepository.createBooking(
      bookingPayload,
      transaction,
    );

    await axios.patch(
      `${ServerConfig.FLIGHT_BACKEND_URL}/flights/${data.flightId}/seats`,
      {
        seats: data.noOfSeats,
      },
    );

    await transaction.commit();

    return booking;
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    throw error;
  }
}

module.exports = {
  createBooking,
};
