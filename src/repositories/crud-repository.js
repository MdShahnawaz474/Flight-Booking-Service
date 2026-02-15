const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger-config");
const AppError = require("../utils/errors/appError");
class CrudRepository {
  constructor(model) {
    this.model;
  }

  async create(data) {
    const response = await this.model.create(data);
    return response;
  }

  async destroy(data) {
    const response = await this.model.destroy({
      where: {
        id: data,
      },
    });
    if (!response) {
      throw new AppError(
        "Not able to find the resources",
        StatusCodes.NOT_FOUND,
      );
    }
    return response;
  }

  async update(id, data) {
    const response = await this.model.update(data, {
      where: {
        id: id,
      },
    });
    return response;
  }

  async getAll(data) {
    const response = await this.model.findAll(data);
    return response;
  }

  async get(data) {
    const response = await this.model.findByPk(data);
    if (!response) {
      throw new AppError(
        "Not able to find the resources",
        StatusCodes.NOT_FOUND,
      );
    }
    return response;
  }
}
module.exports = CrudRepository;
