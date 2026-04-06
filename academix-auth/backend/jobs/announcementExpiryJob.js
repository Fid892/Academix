const cron = require("node-cron");
const Announcement = require("../models/Announcement");

const startAnnouncementExpiryJob = () => {
  // Runs every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Running Announcement Expiry Job...");
    try {
      const currentDate = new Date();

      const result = await Announcement.updateMany(
        {
          isExpired: false,
          $or: [
            { expiryDate: { $lte: currentDate } },
            { endDate: { $lte: currentDate } }
          ]
        },
        {
          $set: {
            isExpired: true,
            "visibility.showInFeed": false
          }
        }
      );

      console.log(`Announcement Expiry Job Completed: Updated ${result.modifiedCount} announcements.`);
    } catch (error) {
      console.error("Error in Announcement Expiry Job:", error);
    }
  });
};

module.exports = startAnnouncementExpiryJob;
