const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const {
    generateAccessToken,
    generateRefreshToken,
} = require('../middlewares/jwt');
const jwt = require('jsonwebtoken');

const register = asyncHandler(async (req, res) => {
    const { email, password, firstname, lastname } = req.body;
    if (!email || !password || !firstname || !lastname) {
        return res.status(400).json({
            success: false,
            message: 'Please fill all the fields',
        });
    }

    const user = await User.findOne({ email: email });

    if (user) {
        throw new Error(`User <${user.email}> already exists`);
    } else {
        const newUser = await User.create(req.body);
        return res.status(200).json({
            success: newUser ? true : false,
            message: newUser
                ? 'User created successfully'
                : 'Somrthings went wrong',
        });
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please fill all the fields',
        });
    }

    const response = await User.findOne({ email });

    if (response && (await response.isCorrectPassword(password))) {
        const { password, role, ...userData } = response.toObject();
        const accesccToken = generateAccessToken(response._id, role);
        const refreshToken = generateRefreshToken(response._id);
        //Save refreshtoken to database
        await User.findByIdAndUpdate(
            response._id,
            { refreshToken },
            { new: true },
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            success: true,
            accesccToken,
            userData,
        });
    } else {
        throw new Error('Invalid');
    }
});

const getCurrent = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const user = await User.findById({ _id }).select(
        '-refreshToken -password -role',
    );

    return res.status(200).json({
        success: true,
        //result
        rs: user ? user : 'User not found',
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get token from cookie
    const cookie = req.cookies;
    //Check token
    if (!cookie && !cookie.refreshToken) {
        throw new Error('No refresh token');
    }

    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
    const response = await User.findOne({
        _id: decode._id,
        refreshToken: cookie.refreshToken,
    });
    return res.status(200).json({
        success: response ? true : false,
        newAcccessToken: response
            ? generateAccessToken(response._id, response.role)
            : 'Refresh token not matched',
    });
});

const logOut = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie && !cookie.refreshToken) {
        throw new Error('No refresh token');
    }
    //delete cookie in db
    await User.findOneAndUpdate(
        { refreshToken: cookie.refreshToken },
        { refreshToken: '' },
        { new: true },
    );
    res.clearCookie('refreshToken', { httpOnly: true, secure: true });
    res.status(200).json({
        success: true,
        mes: 'Logout is done successfully',
    });
});

//Client send mail
//Server check valid mail => send mail + Link (password change token)
//


module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logOut,
};
