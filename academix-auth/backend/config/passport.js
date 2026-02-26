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

        // 🔥 CLEAN EMAIL PROPERLY
        const email = profile.emails[0].value.toLowerCase().trim();

        console.log("Google login attempt:", email);

        // 🔥 STRICT MATCH
        const allowedUser = await AllowedUser.findOne({
          email: email
        });

        if (!allowedUser) {
          console.log("❌ Not allowed:", email);
          return done(null, false);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: email,
            googleId: profile.id,
            role: allowedUser.role
          });
        }

        console.log("✅ Login success:", email, allowedUser.role);

        return done(null, user);

      } catch (err) {
        console.log("Passport error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
