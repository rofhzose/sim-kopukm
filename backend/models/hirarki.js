// models/hirarki.js
"use strict";
module.exports = (sequelize, DataTypes) => {
  const Hirarki = sequelize.define(
    "Hirarki",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // menyimpan struktur hirarki lengkap sebagai JSON
      data: {
        type: DataTypes.JSON, // gunakan JSON untuk fleksibilitas
        allowNull: false,
        defaultValue: {},
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "hirarki",
      underscored: true,
    }
  );

  Hirarki.associate = function (models) {
    // jika butuh relasi (user), bisa ditambahkan di sini
  };

  return Hirarki;
};
