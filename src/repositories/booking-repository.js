const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger-config");
const AppError = require("../utils/errors/appError");
const {Booking}= require("../models");
const CrudRepository = require("./crud-repository")
class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking)
    }

    async createBooking(data,transaction){
        const response = await Booking.create(data,{transaction:transaction})
        return response;
    }

}

module.exports=BookingRepository
