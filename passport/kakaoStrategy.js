const KakaoStrategy = require("passport-kakao").Strategy; // passport-kakao에서 Stragtegy 생성자를 import한다.

const { User } = require("../models"); // User를 모델에서 가져온다.

module.exports = (passport) => {
  passport.use(
    // KakaoStrategy의 instance를 만든다.
    new KakaoStrategy(
      // 첫 인자에 로그인 설정을 정의한다.
      {
        clientID: process.env.KAKAO_ID, // 카카오 ID는 보안이 필요한 값이므로 process.env에서 관리
        callbackURL: "/auth/kakao/callback", // 카카오에서 보내주는 인증 결과를 받을 url
      },
      async (accessToken, refreshToken, profile, done) => {
        //callbackURL으로 해당 데이터들이 전달됨
        try {
          // 사용자가 로그인을 한 적이 있는지 확인
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" }, // profile 인자에 사용자 정보가 담김
          });
          if (exUser) {
            // 기존에 로그인하여 User에 등록된 적이 있는 경우
            done(null, exUser);
          } else {
            // 처음 로그인을 시도하는 경우
            const newUser = await User.create({
              // User table에 레코드를 생성하는 메서드 (=insert)
              email: profile._json && profile._json.kaccount_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, newUser); // user 정보를 passport.authenticate로 보냄.
          }
        } catch (error) {
          console.log(error);
          done(error);
        }
      }
    )
  );
};
