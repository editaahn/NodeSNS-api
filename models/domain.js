module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "domain",
    {
      host: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      type: {
        // free OR premium
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      clientSecret: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
    },
    {
      validate: {
        // 데이터를 검증하는 속성
        unknownType() {
          console.log(this.type, this.type !== "free", this.type !== "premium");
          if (this.type !== "free" && this.type !== "premium") {
            throw new Error("type 컬럼은 free나 premium 이어야 합니다");
          }
        },
      },
      timestamps: true,
      paranoid: true,
    }
  );
