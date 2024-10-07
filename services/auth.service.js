const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require('passport-local').Strategy

// MongoDB URI and collection name
const mongoURI = process.env.MONGO_URI; // Update this to your MongoDB URI
const dbName = process.env.MONGO_DB;  // Replace with your database name
const collectionName = process.env.MONGO_USER_COLLECTION;


// Create a Moleculer service
module.exports = {
    name: "auth",

    settings: {},

    actions: {
        // Register a new user
        async register(ctx) {
            const { email, password } = ctx.params;

            // Check if user already exists
            const existingUser = await this.usersCollection.findOne({ email });
            if (existingUser) {
                throw new Error("User already exists!");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Save user in MongoDB
            const result = await this.usersCollection.insertOne({
                email,
                password: hashedPassword,
                createdAt: new Date()
            });

            return { success: true, id: result.insertedId };
        },
        async logout(ctx) {
            const req = ctx.meta.$req;  // Get the request object
            const res = ctx.meta.$res;  // Get the response object
            passport.initialize();
            passport.session(); 
            req.session.user = null;
            delete req.session.user;            
            return {};
        },
        async login(ctx) {
            const req = ctx.meta.$req;  // Get the request object
            const res = ctx.meta.$res;  // Get the response object
    
            const { email, password } = ctx.params;

            // Find user by email
            const user = await this.usersCollection.findOne({ email });
            if (!user) {
                throw new Error("User not found!");
            }

            // Check password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                throw new Error("Invalid password!");
            }
            req.user = user;            
            passport.initialize();
            passport.session();            
           
            req.session.user = user;            
            return { success: true, message: "Login successful!" };            
        },
        async isAuthenticated(ctx) {
            return new Promise((resolve, reject) => {                
                const req = ctx.meta.$req;
                const res = ctx.meta.$res;           
                ctx.meta.user = req.session.user;
                if((typeof req.session !== 'undefined') && (typeof req.session.user !== 'undefined')) {
                    resolve({authenticated:true,email:req.session.user.email});
                } else {
                    reject({authenticated:false});
                }
            });
        },
        // Google Login redirect (for front-end flow)
        async googleAuth(ctx) {
            return new Promise((resolve, reject) => {
                // Ensure req and res are passed correctly via ctx.meta
                const req = ctx.meta.$req;
                const res = ctx.meta.$res;
        
                if (!req || !res) {
                    return reject(new Error("Missing request or response object"));
                }
        
                passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, err => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        },

        // Google callback after successful login
        async googleCallback(ctx) {
            return new Promise((resolve, reject) => {
                passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
                    if (err) return reject(err);
                    // If successful, set up the user session and send success
                    ctx.meta.$req.login(user, err => {
                        if (err) return reject(err);
                        resolve({ success: true, message: "Google login successful!", user });
                    });
                })(ctx.meta.$req, ctx.meta.$res, err => {
                    if (err) return reject(err);
                });
            });
        }
    },

    methods: {
        async findOrCreateUser(profile) {
            const googleId = profile.id;
            const email = profile.emails[0].value;

            let user = await this.usersCollection.findOne({ googleId });
            if (!user) {
                // If no user with the Google ID, check if user with the same email exists
                user = await this.usersCollection.findOne({ email });

                if (user) {
                    // If user exists with the same email, update with Google ID
                    await this.usersCollection.updateOne({ email }, { $set: { googleId } });
                } else {
                    // Otherwise, create a new user
                    const newUser = {
                        email,
                        googleId,
                        displayName: profile.displayName,
                        createdAt: new Date()
                    };
                    await this.usersCollection.insertOne(newUser);
                    user = newUser;
                }
            }

            return user;
        }
    },

    // MongoDB connection
    async started() {
        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        this.db = client.db(dbName);
        this.usersCollection = this.db.collection(collectionName);

        this.logger.info("Connected to MongoDB");        
        passport.initialize();
        passport.session();
        // Initialize Google OAuth strategy
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CLIENT_CALLBACK  // Update the callback URL
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                // Find or create the user in MongoDB
                const user = await this.findOrCreateUser(profile);
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }));
        
        passport.serializeUser((user, done) => {
            done(null, user._id);
        });

        passport.deserializeUser(async (id, done) => {
            const user = await this.usersCollection.findOne({ _id: new MongoClient.ObjectID(id) });
            done(null, user);
        });
    },

    async stopped() {
        await this.db.client.close();
        this.logger.info("Disconnected from MongoDB");
    }
};
