const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/");
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET); // token을 디코딩하여 검증하는 메서드. 인자는 1.요청 헤더에 저장된 토큰 2.토큰의 비밀키
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // 유효기간 초과한 토큰
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다",
      });
    }
    return res.status(401).json({
      code: 401,
      message: "유효하지 않은 토큰입니다",
    });
  }
};

exports.apiLimiter = new rateLimit({
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

exports.deprecated = (req, res) => {
  res.status(410).json({
    code: 410,
    message: "새로운 버전이 나왔습니다. 새로운 버전을 사용하세요",
  });
};