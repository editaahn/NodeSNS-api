const express = require("express");
const jwt = require("jsonwebtoken");

const { verifyToken, deprecated } = require("./middlewares"); // 토큰 디코딩
const { Domain, User, Post, Hashtag } = require("../models");

const router = express.Router();

router.use(deprecated); // 버전이 deprecated되었다고 알려줌

router.post("/token", async (req, res) => {
  const { clientSecret } = req.body; // body에 담긴 clientSecret
  try {
    const domain = await Domain.findOne({
      // 도메인 테이블에서 clientSecret이 일치하는 것을 찾음. 도메인이 있는지 확인.
      where: { clientSecret },
      include: { model: User, attribute: ["nick", "id"] },
    });
    if (!domain) {
      // 도메인이 존재하지 않으면
      return res.status(401).json({
        code: 401,
        message: "등록되지 않은 도메인입니다.",
      });
    }
    const token = jwt.sign(
      // 1.토큰의 내용
      {
        id: domain.user.id,
        nick: domain.user.nick,
      },
      process.env.JWT_SECRET, // 2.토큰의 비밀키
      // 3.토큰의 설정
      {
        expiresIn: "1m", // 토큰 유효기간
        issuer: "nodesns", // 토큰 발급자명
      }
    );
    return res.json({
      code: 200,
      message: '토큰이 발급되었습니다',
      token,
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
});

// 발급한 토큰 테스트
router.get("/test", verifyToken, (req, res) => {
  res.json(req.decoded);
});

router.get('/posts/my', verifyToken, (req, res) => {
  Post.findAll({ where: { userId: req.decoded.id }}) // 디코드된 id값과 일치하는 user의 posts를 전부 가져옴
  .then(posts => {
    console.log(posts);
    res.json({
      code: 200,
      payload: posts, //payload에 posts를 담아서 반환
    })
  })
  .catch(error => {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버 에러'
    })
  })
})

router.get('/posts/hashtag/:title', verifyToken, async (req, res) => {
  try {
    const hashtag = await Hashtag.findOne({
      where: {
        title: req.params.title
      }
    });
    if (!hashtag) {
      return res.status(404).status.json({
        code: 404,
        message: '검색 결과가 없습니다.'
      });
    }
    const posts = await hashtag.getPosts(); // 시퀄라이즈가 생성한 메서드 getPosts를 사용
    return res.json({
      code: 200,
      payload: posts,
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버 에러'
    })
  }
})

module.exports = router;