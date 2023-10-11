const router = require('express').Router();
const userControllers = require('../controllers/user');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');

router.post('/register', userControllers.register);
router.post('/login', userControllers.login);
router.get('/current', verifyAccessToken, userControllers.getCurrent);
router.put('/refreshtoken', userControllers.refreshAccessToken);
router.get('/logout', userControllers.logOut);
router.get('/forgotpassword', userControllers.forgotPassword);
router.put('/resetpassword', userControllers.resetPassword);
router.get('/', [verifyAccessToken, isAdmin], userControllers.getUsers);
router.delete('/', [verifyAccessToken, isAdmin], userControllers.deleteUser);
router.put('/current', [verifyAccessToken], userControllers.updateUser);
router.put('/address', [verifyAccessToken], userControllers.updateUserAddress);
router.put(
    '/:uid',
    [verifyAccessToken, isAdmin],
    userControllers.updateUserByAdmin,
);

module.exports = router;
