const { MongoClient } = require("mongodb");

const MONGODB_URI = "mongodb://localhost:27017/wedding";

async function seed() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  // Clear existing data
  await db.collection("wedding").deleteMany({});
  await db.collection("rsvps").deleteMany({});
  await db.collection("wishes").deleteMany({});

  // Insert sample wedding document
  await db.collection("wedding").insertOne({
    couple: {
      bride: {
        firstName: "Quỳnh Anh",
        lastName: "Nguyễn Ngọc",
        christianName: "Catarina",
        photo: "/images/bride.jpg",
        bio: "",
        father: { firstName: "Ngọc Quýnh", lastName: "Nguyễn", christianName: "Phero" },
        mother: { firstName: "Kim Liên", lastName: "Nguyễn Thị", christianName: "Anna" },
      },
      groom: {
        firstName: "Công Trung",
        lastName: "Nguyễn",
        christianName: "Simon",
        photo: "/images/groom.jpg",
        bio: "",
        father: { firstName: "Công Trị (T)", lastName: "Nguyễn", christianName: "Giuse" },
        mother: { firstName: "Ngọc Huyên", lastName: "Hoàng Thị", christianName: "Phanxica" },
      },
      loveStory: "Chúng tôi gặp nhau vào mùa thu năm 2020 tại một quán cà phê nhỏ ở Sài Gòn. Từ cuộc trò chuyện đầu tiên, chúng tôi đã biết rằng đây là người mình muốn đi cùng suốt cuộc đời.",
    },
    heroPhoto: "/images/hero.jpg",
    heroPhotoMobile: "/images/hero-mobile.jpg",
    weddingDate: new Date("2026-06-05T10:00:00Z"),
    events: [
      {
        title: "Thánh Lễ Hôn Phối",
        date: new Date("2026-06-05T00:00:00Z"),
        time: "19:00",
        venueName: "Nhà Thờ Hạnh Trí",
        venueAddress: "Hạnh Trí 1, Ninh Sơn, Khánh Hòa",
      },
      {
        title: "Tiệc Cưới Nhà Gái",
        date: new Date("2026-06-06T00:00:00Z"),
        time: "17:00",
        venueName: "Tư Gia",
        venueAddress: "Hạnh Trí 1, Ninh Sơn, Khánh Hòa",
      },
      {
        title: "Tiệc Cưới Nhà Trai",
        date: new Date("2026-06-07T00:00:00Z"),
        time: "17:00",
        venueName: "Tư Gia",
        venueAddress: "Triệu Phong 1, Ninh Sơn, Khánh Hòa",
      },      
    ],
    gallery: [
      { url: "/images/gallery-1.jpg", thumbnailUrl: "/images/gallery-1.jpg", order: 1 },
      { url: "/images/gallery-2.jpg", thumbnailUrl: "/images/gallery-2.jpg", order: 2 },
      { url: "/images/gallery-3.jpg", thumbnailUrl: "/images/gallery-3.jpg", order: 3 },
      { url: "/images/gallery-4.jpg", thumbnailUrl: "/images/gallery-4.jpg", order: 4 },
      { url: "/images/gallery-5.jpg", thumbnailUrl: "/images/gallery-5.jpg", order: 5 },
      { url: "/images/gallery-6.jpg", thumbnailUrl: "/images/gallery-6.jpg", order: 6 },
      { url: "/images/gallery-7.jpg", thumbnailUrl: "/images/gallery-7.jpg", order: 7 },
      { url: "/images/gallery-8.jpg", thumbnailUrl: "/images/gallery-8.jpg", order: 8 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insert sample wishes
  await db.collection("wishes").insertMany([
    { name: "Nguyễn Văn A", message: "Chúc hai bạn trăm năm hạnh phúc!", approved: true, createdAt: new Date("2024-12-01T10:00:00Z") },
    { name: "Trần Thị B", message: "Chúc mừng hạnh phúc! Mong hai bạn luôn yêu thương nhau.", approved: true, createdAt: new Date("2024-12-02T14:00:00Z") },
    { name: "Lê Văn C", message: "Hạnh phúc mãi mãi nhé!", approved: true, createdAt: new Date("2024-12-03T09:00:00Z") },
    { name: "Phạm Thị D", message: "Chúc hai bạn sớm có em bé!", approved: true, createdAt: new Date("2024-12-04T11:00:00Z") },
    { name: "Hoàng Văn E", message: "Trăm năm hạnh phúc, vạn sự như ý!", approved: true, createdAt: new Date("2024-12-05T08:00:00Z") },
    { name: "Ngô Thị F", message: "Chúc mừng đám cưới! Hạnh phúc bên nhau.", approved: true, createdAt: new Date("2024-12-06T15:00:00Z") },
    { name: "Đỗ Văn G", message: "Mong hai bạn luôn hạnh phúc và bình an.", approved: true, createdAt: new Date("2024-12-07T10:30:00Z") },
    { name: "Vũ Thị H", message: "Chúc mừng ngày vui! Yêu thương mãi nhé.", approved: true, createdAt: new Date("2024-12-08T12:00:00Z") },
    { name: "Bùi Văn I", message: "Hạnh phúc viên mãn!", approved: true, createdAt: new Date("2024-12-09T16:00:00Z") },
    { name: "Đặng Thị K", message: "Chúc hai bạn trọn đời bên nhau.", approved: true, createdAt: new Date("2024-12-10T09:30:00Z") },
  ]);

  console.log("Database seeded successfully!");
  await client.close();
}

seed().catch(console.error);
