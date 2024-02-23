const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/User");

/**
 * @route POST /api/user/login
 * @desc Логин
 * @access Public
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Пожалуйста, заполните обязательные поля" });
        }

        const user = await UserModel.findOne({ email: req.body.email })
        const isPasswordCorrect =
            user && (await bcrypt.compare(password, user.password));
        const secret = process.env.JWT_SECRET;


        if (user && isPasswordCorrect && secret) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                bill: user.bill,
                token: jwt.sign({ _id: user._id }, secret, {
                    expiresIn: "30d",
                }),
            });
        } else {
            return res
                .status(400)
                .json({ message: "Неверный логин или пароль" });
        }
    } catch {
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};

/**
 * @route POST /api/user/register
 * @desc Регситрация
 * @access Public
 */
const register = async (req, res) => {
    try {
        const { name, email, password, tokenWB } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Заполните обязательные поля" });
        }

        const registeredUser = await UserModel.findOne({
            email: req.body.email,
        });

        if (registeredUser) {
            return res
                .status(400)
                .json({ message: "Пользователь с таким email уже существует" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            name,
            email,
            password: hashedPassword,
            tokenWB
        });

        const user = await doc.save();
        const secret = process.env.JWT_SECRET;

        if (user && secret) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                bill: user.bill,
                tokenWB: user.tokenWB,
                token: jwt.sign({ _id: user._id }, secret, {
                    expiresIn: "10d",
                }),
            });
        } else {
            return res
                .status(400)
                .json({ message: "Не удалось создать пользователя" });
        }
    } catch (error) {
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};

/**
 * @route PATCH /api/user/update-info/:id
 * @desc Изменение информации пользователя
 * @access Private
 */
const updateInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const user = await UserModel.findOneAndUpdate(
            {
                _id: id,
            },
            {
                $set: {
                    name,
                    email,
                },
            }
        );

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Не удалось изменить информацию о пользователе",
        });
    }
};

/**
 * @route PATCH /api/user/update-password/:id
 * @desc Изменение пароля пользователя
 * @access Private
 */
const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        const user = await UserModel.findOne({ _id: id });

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Ошибка при смене пароля" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await UserModel.findOneAndUpdate(
            {
                _id: id,
            },
            {
                $set: {
                    password: hashedPassword,
                },
            }
        );

        return res
            .status(200)
            .json({ message: "Пароль пользователя успешно изменен" });
    } catch (error) {
        res.status(500).json({ message: "Не удалось изменить пароль" });
    }
};

/**
 * @route GET /api/user/current
 * @desc Текущий пользователь
 * @access Private
 */
const current = async (req, res) => {
    const user = await UserModel.findOne({ _id: req.user._id })
    res.status(200).json(user);
};

module.exports = {
    login,
    register,
    updateInfo,
    updatePassword,
    current,
};
