const mongoose = require("mongoose");
const seedSkillCategories = require("./seeder");

const DATABASE = process.env.DATABASE;

mongoose
  .connect(DATABASE)
  .then(async () => {
    console.log("Connected to the database successfully!");
    // Run the seeder after successful connection
    await seedSkillCategories();
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });