const { Domain } = require("../models");

exports.findType = async (req, res, next) => {
  req.user = await Domain.findOne({
    attributes: ["type"],
    where: { userId: req.decoded.id },
  });
  next();
};
