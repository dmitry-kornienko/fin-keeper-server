const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/User");

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserModel.findOne({ _id: decoded._id });

        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({ message: "Не авторизован" });
    }
};

module.exports = {
    auth,
};
