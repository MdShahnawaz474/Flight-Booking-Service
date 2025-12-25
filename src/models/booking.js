"use strict";
const {Enums} = require("../utils/common");
const {CONFIRMED, CANCELLED, INTIATED, PENDING} = Enums.BOOKING_STATUS;
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Booking.init(
    {
      flightId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.ENUM,
        values: [CONFIRMED, CANCELLED, INTIATED, PENDING],
        defaultValue: INTIATED,
      },
       noOfSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      totalCost: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Booking",
    }
  );
  return Booking;
};