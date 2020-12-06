const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { User } = require("../models");

const router = express.Router();

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      req.flash("joinError", "이미 가입된 이메일입니다");
      return res.redirect("/join");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    // 로그인 전략 수행 미들웨어
    if (authError) {
      // authError
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      // 인자가 없는 경우
      req.flash("loginError", info.message);
      return res.redirect("/");
    }
    return req.login(user, (loginError) => {
      // 성공 시 req.login 메서드 호출 -> passport.serializeUser 호출
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/"); // 성공 시 redirect
    });
  })(req, res, next);
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.logout(); // req.user 제거
  req.session.destroy();
  res.redirect("/");
});

// GET /auth/kakao 접근 시 카카오 로그인 창으로 리다이렉트
router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback", // 카카오 로그인 전략 실행
  passport.authenticate("kakao", {
    // 카카오 passport인 경우에 내부적으로 req.login을 호출하므로 여기서 콜백으로 호출하지 않아도됨
    failureRedirect: "/" // 로그인 실패 시 이동 경로를 정의함
  }),
  (req, res) => {
    res.redirect("/"); // 성공 시 redirect
  }
);

module.exports = router;
