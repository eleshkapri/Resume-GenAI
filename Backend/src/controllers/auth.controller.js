const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

/**
 * @name registerUserController
 * @desc Register a new user, expects username, email, and password in the request body.
 * @access Public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please provide username, email, and password."   
        });
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "User with this username or email already exists." 
        });
    }
    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash
    });
    
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
        message: "User registered successfully.",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },  
    })      
}


/**
 * @name loginUserController
 * @desc Login a user, expects email and password in the request body.
 * @access Public
 */
async function loginUserController(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password." 
        });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password." 
        });
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, cookieOptions);
    res.status(200).json({
        message: "User logged in successfully.",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
    })
}


/**
 * @name logoutUserController
 * @desc Logout a user, clears the token cookie and blacklists the token
 * @access Public
 */
async function logoutUserController(req, res) {
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
        await tokenBlacklistModel.create({ token })
    }
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
        message: "User logged out successfully."
    })

}

/**
 * @name getMeController
 * @desc Get the currently logged-in user's information.
 * @access Private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message: "User information retrieved successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
    })
}


module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}