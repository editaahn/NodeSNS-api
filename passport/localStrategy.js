const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { User } = require("../models");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      }, // 전략에 대한 설정. req.body의 속성명
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              done(null, exUser); // 에러 케이스가 아니므로 done 함수의 첫 번째 인자를 사용하지 않음.
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다" });
            }
          } else {
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (error) {
          console.error(error);
          done(error); // 에러 케이스이므로 done에 첫번째 인자만을 사용
        }
      }
    )
  );
};
