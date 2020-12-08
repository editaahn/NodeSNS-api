const rateLimit = require("express-rate-limit");
const { Domain } = require("../models");

const apiLimiterFree = new rateLimit({
  windowMs: 60 * 1000, // 기준 시간 내에 (1분)
  max: 5, // 1회
  delayMs: 0, // 호출 간격
  handler(req, res) {
    //제한 초과 시 콜백 함수
    res.status(this.statusCode).json({
      code: this.statusCode, // 기본값 429
      message: "1분에 한 번만 요청 가능",
    });
  },
});

const apiLimiterPremium = new rateLimit({
  windowMs: 60 * 1000 * 10, // 기준 시간 내에 (10분)
  max: 10, // 10회
  delayMs: 0, // 호출 간격
  handler(req, res) {
    //제한 초과 시 콜백 함수
    res.status(this.statusCode).json({
      code: this.statusCode, // 기본값 429
      message: "10분에 한 번만 요청 가능",
    });
  },
});

exports.apiLimiter = (req, res, next) => {
  const isFree = req.user.type === "free";
  apiLimiter = isFree ? apiLimiterFree : apiLimiterPremium;
  next();
};
