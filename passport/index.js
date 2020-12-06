const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const { User } = require("../models");

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    // 세션에 user 정보를 저장함
    done(null, user.id); // done 함수 첫 째 인자: 에러 발생 시 사용, 둘 째 인자: req.session 객체에 저장하는 정보
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      include: [{ 
        model: User, // User table 조인하여,
        attributes: ["id", "nick"], // id, nick 데이터를 가져온다. (= SELECT)
        as: 'Followers' // Followers라는 alias로 정해진 것을 가져온다.
      }, { 
        model: User, 
        attributes: ["id", "nick"],
        as: 'Followings'
      }],
    }) // serializeUser에서 세션에 저장한 정보를 가지고 DB 사용자정보 조회
      .then((user) => done(null, user)) // req.user에 저장
      .catch((err) => done(err));
  });

  local(passport);
  kakao(passport);
};
