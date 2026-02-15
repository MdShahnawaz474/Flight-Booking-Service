const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { ServerConfig } = require("../config");
const AppError = require("../utils/errors/appError");
const { StatusCodes } = require("http-status-codes");
const { Enums } = require("../utils/common");
const { CONFIRMED, CANCELLED } = Enums.BOOKING_STATUS;

const bookingRepository = new BookingRepository();
async function createBooking(data) {
  const transaction = await db.sequelize.transaction();

  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_BACKEND_URL}/flights/${data.flightId}`,
    );
    const flightData = flight.data.data;
    const totalSeats = flightData.totalSeat;
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

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(data.bookingId);

    if (!bookingDetails) {
      throw new AppError("Booking not found", StatusCodes.NOT_FOUND);
    }

    if (bookingDetails.status === CANCELLED) {
      await bookingRepository.update(
        data.bookingId,
        {
          status: CANCELLED,
        },
        transaction,
      );
      throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
    }
    const bookingTime = new Date(bookingDetails.createdAt); //Booking initiated time
    const currentTime = new Date(); //current time

    if (currentTime - bookingTime > 300000) {
      cancelBooking(data.bookingId);
      throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
    }

    const totalCost = parseInt(data.totalCost);
    const userId = parseInt(data.userId);

    if (bookingDetails.totalCost !== totalCost) {
      throw new AppError(
        "The amount of the payment doesn't match",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (bookingDetails.userId !== userId) {
      throw new AppError(
        "The user corresponding to the booking doesn't match",
        StatusCodes.BAD_REQUEST,
      );
    }

    // we assume here the payment is succesfull

    const updatedBooking = await bookingRepository.update(
      data.bookingId,
      {
        status: CONFIRMED,
      },
      transaction,
    );
    await transaction.commit();

    return updatedBooking;
  } catch (error) {
    await transaction.rollback();
    console.log(error); // Added logging
    throw error;
  }
}
async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction;
  try {
    const bookingDetails = await bookingRepository.get(bookingId, transaction);
    if (bookingDetails.status === CANCELLED) {
      await transaction.commit();
      return true;
    }
    await axios.patch(
      `${ServerConfig.FLIGHT_BACKEND_URL}/flights/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: 0,
      },
    );

    await bookingRepository.update(
      bookingId,
      {
        status: CANCELLED,
      },
      transaction,
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
  }
}
module.exports = {
  createBooking,
  makePayment,
};
