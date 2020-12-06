const express = require("express");
// const uuidv4 = require("uuid");
const { v4 : uuidv4 } = require('uuid');
const { User, Domain } = require("../models");

const router = express.Router();

router.get("/", (req, res, next) => {
  User.findOne({
    where: { id: (req.user && req.user.id) || null },
    include: { model: Domain },
  })
    .then((user) =>
      res.render("login", {
        user,
        loginError: req.flash("loginError"),
        domains: user && user.domains,
      })
    )
    .catch((error) => next(error));
});

// 도메인 등록 라우터
router.post("/domain", (req, res, next) => {
  Domain.create({
    userId: req.user.id,
    host: req.body.host,
    type: req.body.type,
    clientSecret: uuidv4(), // 범용 고유 식별자 => 고유 문자열 부여하여 DB 레코드 생성
  })
    .then(() => res.redirect("/"))
    .catch((error) => next(error));
});

module.exports = router;