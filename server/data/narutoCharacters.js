const questions = {
  easy: {
    // =========================
    // KATEGORI YANG DIGUNAKAN
    // =========================
    categories: ["characters", "animals", "jutsu", "weapons"],

    // =========================
    // KARAKTER MUDAH
    // =========================
    characters: [
      { name: "Asuma" },
      { name: "Bee" },
      { name: "Choji" },
      { name: "Chiyo" },
      { name: "Deidara" },
      { name: "Gaara" },
      { name: "Hinata" },
      { name: "Haku" },
      { name: "Hashirama" },
      { name: "Hiruzen" },
      { name: "Ino" },
      { name: "Iruka" },
      { name: "Itachi" },
      { name: "Jiraiya" },
      { name: "Kabuto" },
      { name: "Kakashi" },
      { name: "Kankuro" },
      { name: "Kiba" },
      { name: "Konohamaru" },
      { name: "Lee" },
      { name: "Madara" },
      { name: "Guy" },
      { name: "Minato" },
      { name: "Naruto" },
      { name: "Neji" },
      { name: "Orochimaru" },
      { name: "Pain" },
      { name: "Sai" },
      { name: "Sakura" },
      { name: "Sasuke" },
      { name: "Shikamaru" },
      { name: "Shino" },
      { name: "Temari" },
      { name: "Tenten" },
      { name: "Tsunade" },
      { name: "Yamato" },
      { name: "Zabuza" },
    ],

    // =========================
    // HEWAN MUDAH
    // =========================
    animals: [
      { name: "Akamaru" },
      { name: "Gamabunta" },
      { name: "Gamakichi" },
      { name: "Pakkun" },
      { name: "Shukaku" },
      { name: "Kurama" },
      { name: "Tonton" },
    ],

    // =========================
    // JUTSU MUDAH
    // =========================
    jutsu: [
      { name: "Kagebunshin" },
      { name: "Rasengan" },
      { name: "Chidori" },
      { name: "Raikiri" },
      { name: "Susanoo" },
      { name: "Byakugan" },
      { name: "Kuchiyose" },
    ],

    // =========================
    // SENJATA MUDAH
    // =========================
    weapons: [{ name: "Kunai" }, { name: "Shuriken" }],
  },

  medium: {
    // =========================
    // KATEGORI YANG DIGUNAKAN
    // =========================
    categories: ["characters", "animals", "jutsu", "weapons"],

    // =========================
    // KARAKTER MEDIUM
    // =========================
    characters: [
      { name: "Anko" },
      { name: "Asura" },
      { name: "Danzo" },
      { name: "Ebisu" },
      { name: "Hagoromo" },
      { name: "Hamura" },
      { name: "Han" },
      { name: "Hanabi" },
      { name: "Hanzo" },
      { name: "Hayate" },
      { name: "Hidan" },
      { name: "Ibiki" },
      { name: "Indra" },
      { name: "Inoichi" },
      { name: "Jirobo" },
      { name: "Jugo" },
      { name: "Kaguya" },
      { name: "Kakuzu" },
      { name: "Karin" },
      { name: "Kidomaru" },
      { name: "Kimimaro" },
      { name: "Kisame" },
      { name: "Konan" },
      { name: "Kushina" },
      { name: "Kurenai" },
      { name: "Mei" },
      { name: "Mizuki" },
      { name: "Nagato" },
      { name: "Obito" },
      { name: "Rin" },
      { name: "Sakon" },
      { name: "Sasori" },
      { name: "Shisui" },
      { name: "Shizune" },
      { name: "Suigetsu" },
      { name: "Tayuya" },
      { name: "Tobirama" },
      { name: "Zetsu" },
    ],

    // =========================
    // HEWAN MEDIUM
    // =========================
    animals: [
      { name: "Enma" },
      { name: "Gamatatsu" },
      { name: "Katsuyu" },
      { name: "Manda" },
    ],

    // =========================
    // JUTSU MEDIUM
    // =========================
    jutsu: [{ name: "Tsukuyomi" }, { name: "Amaterasu" }, { name: "Genjutsu" }],

    // =========================
    // SENJATA MEDIUM
    // =========================
    weapons: [{ name: "Samehada" }],
  },

  hard: {
    // =========================
    // KATEGORI YANG DIGUNAKAN
    // =========================
    categories: ["characters", "animals", "jutsu", "weapons"],

    // =========================
    // KARAKTER HARD
    // =========================
    characters: [
      { name: "Ao" },
      { name: "Aoi" },
      { name: "Ayame" },
      { name: "Chojuro" },
      { name: "Choza" },
      { name: "Darui" },
      { name: "Dosu" },
      { name: "Fugaku" },
      { name: "Fuguki" },
      { name: "Fu" },
      { name: "Ginkaku" },
      { name: "Hiashi" },
      { name: "Kinkaku" },
      { name: "Kotetsu" },
      { name: "Mu" },
      { name: "Yagura" },
      { name: "Roshi" },
      { name: "Nawaki" },
      { name: "Omoi" },
      { name: "Onoki" },
      { name: "Sakumo" },
      { name: "Teuchi" },
      { name: "Udon" },
      { name: "Ukon" },
      { name: "Utakata" },
      { name: "Yahiko" },
      { name: "Yota" },
      { name: "Yugito" },
      { name: "Zaku" },
    ],

    // =========================
    // HEWAN HARD
    // =========================
    animals: [
      { name: "Aoda" },
      { name: "Fukasaku" },
      { name: "Matatabi" },
      { name: "Isobu" },
      { name: "Son Goku" },
      { name: "Kokuo" },
      { name: "Saiken" },
      { name: "Chomei" },
      { name: "Gyuuki" },
    ],

    // =========================
    // JUTSU HARD
    // =========================
    jutsu: [
      { name: "Katon" },
      { name: "Suiton" },
      { name: "Doton" },
      { name: "Raiton" },
      { name: "Futon" },
      { name: "Konohasenpu" },
      { name: "Kamui" },
      { name: "Gatsuga" },
      { name: "Shinra Tensei" },
      { name: "Chibaku Tensei" },
    ],

    // =========================
    // SENJATA HARD
    // =========================
    weapons: [
      { name: "Senbon" },
    ],
  },
};

module.exports = questions;
