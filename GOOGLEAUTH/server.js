import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";


const app = express()


app.get("/",(req,res)=>{
    res.send("Welcome to the Google Authentication Example")
})


app.use(morgan("dev"))


app.use(passport.initialize())

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
(_, __, profile, done) => {
    return done(null, profile);
}));

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to the Google Authentication Example");
});

// ✅ FIXED
app.get("/auth/google",

    // Initiates the Google authentication process
    // The 'scope' specifies the data we want to access from the user's Google account
    // 'profile' gives us access to the user's basic profile information
    // 'email' gives us access to the user's email address
    // When the user hits this route, they will be redirected to Google's login page
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ FIXED
app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" ,
        session: false // Disable session management since we're not using sessions
    }),
    (req, res) => {
        console.log(req.user);
        res.send("Google Authentication Successful");
    }
);
    
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
