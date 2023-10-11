const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const {
    generateAccessToken,
    generateRefreshToken,
} = require('../middlewares/jwt');
const jwt = require('jsonwebtoken');
const sendMail = require('../ultils/sendMail');
const crypto = require('crypto');

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
    if (!email || !password)
        return res.status(400).json({
            sucess: false,
            mes: 'Missing inputs',
        });
    // plain object
    const response = await User.findOne({ email });
    if (response && (await response.isCorrectPassword(password))) {
        // Tách password và role ra khỏi response
        const { password, role, refreshToken, ...userData } =
            response.toObject();
        // Tạo access token
        const accessToken = generateAccessToken(response._id, role);
        // Tạo refresh token
        const newRefreshToken = generateRefreshToken(response._id);
        // Lưu refresh token vào database
        await User.findByIdAndUpdate(
            response._id,
            { refreshToken: newRefreshToken },
            { new: true },
        );
        // Lưu refresh token vào cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            sucess: true,
            accessToken,
            userData,
        });
    } else {
        throw new Error('Invalid credentials!');
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
//Client check mail and click link
//client send api and token
//ckeck token is same as server send

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (!email) {
        throw new Error('Missing email');
    }
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new Error('User not found');
    }
    const resetToken = user.createPasswordChangedToken();
    await user.save();

    const html = `Xin vui lòng click vào link dưới đây 
        để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút 
        kể từ bây giờ. 
        // <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>
        <a href='https://www.youtube.com/watch?v=uXE99i2MqmI'>

        
        Click here</a>`;

    const data = {
        email,
        html,
    };
    const rs = await sendMail(data);
    return res.status(200).json({
        success: true,
        rs,
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body;
    if (!password || !token) throw new Error('Missing imputs');
    const passwordResetToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    const user = await User.findOne({
        passwordResetToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error('Invalid reset token');
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({
        success: user ? true : false,
        mes: user ? 'Updated password' : 'Something went wrong',
    });
});

const getUsers = asyncHandler(async (req, res) => {
    const response = await User.find().select('-refreshToken -password -role');
    return res.status(200).json({
        success: response ? true : false,
        users: response,
    });
});
const deleteUser = asyncHandler(async (req, res) => {
    const { _id } = req.query;
    if (!_id) throw new Error('Missing inputs');
    const response = await User.findByIdAndDelete(_id);
    return res.status(200).json({
        success: response ? true : false,
        deletedUser: response
            ? `User with email ${response.email} deleted`
            : 'No user delete',
    });
});
const updateUser = asyncHandler(async (req, res) => {
    //
    const { _id } = req.user;
    if (!_id || Object.keys(req.body).length === 0)
        throw new Error('Missing inputs');
    const response = await User.findByIdAndUpdate(_id, req.body, {
        new: true,
    }).select('-password -role -refreshToken');
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : 'Some thing went wrong',
    });
});
const updateUserByAdmin = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs');
    const response = await User.findByIdAndUpdate(uid, req.body, {
        new: true,
    }).select('-password -role -refreshToken');
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : 'Some thing went wrong',
    });
});

const updateUserAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    if (!req.body.address) throw new Error('Missing inputs');
    const response = await User.findByIdAndUpdate(
        _id,
        { address: req.body.address },
        { new: true },
    ).select('-password -role -refreshToken');
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : 'Some thing went wrong',
    });
});

module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logOut,
    forgotPassword,
    resetPassword,
    getUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    updateUserAddress,
};
