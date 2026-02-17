const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AllowedUser = require("../models/AllowedUser");
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // 🔐 Check if email is allowed
        const allowedUser = await AllowedUser.findOne({ email });

        if (!allowedUser) {
          return done(null, false);
        }

        // If allowed, check if already exists in Users
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            role: allowedUser.role
          });
        }

        return done(null, user);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
