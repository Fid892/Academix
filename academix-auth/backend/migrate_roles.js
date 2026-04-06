const mongoose = require("mongoose");
const Announcement = require("./models/Announcement");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://academixAdmin:asdfghjkl@ac-vl0bqzm-shard-00-00.ghrzy98.mongodb.net:27017,ac-vl0bqzm-shard-00-01.ghrzy98.mongodb.net:27017,ac-vl0bqzm-shard-00-02.ghrzy98.mongodb.net:27017/academix?ssl=true&replicaSet=atlas-5uk41l-shard-0&authSource=admin&appName=Cluster0");
    console.log("Connected to DB");

    const announcements = await Announcement.find({}).populate("postedBy");
    console.log(`Found ${announcements.length} announcements`);

    let updatedCount = 0;
    for (let a of announcements) {
      if (a.postedBy) {
        let actualRole = a.postedBy.role || "student";
        if (a.postedByRole !== actualRole) {
          console.log(`Updating announcement ${a.title} from ${a.postedByRole} to ${actualRole}`);
          a.postedByRole = actualRole;
          await a.save();
          updatedCount++;
        }
      }
    }

    console.log(`Updated ${updatedCount} announcements with missing roles`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
