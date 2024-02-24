const { GoodModel } = require("../models/Good");

/**
 * @route GET /api/good
 * @desc Все товары пользователя
 * @access Private
 */
const all = async (req, res) => {
    try {
        const user = req.user;

        const goods = await GoodModel.find({ user: user._id });

        res.status(200).json(goods);
    } catch {
        res.status(500).json({ message: "Не удалось получить информацию о товарах" });
    }
}

/**
 * @route GET /api/good/:id
 * @desc Товар
 * @access Private
 */
const good = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        
        const good = await GoodModel.findOne({ _id: id, user: user._id });
        
        res.status(200).json(good);
    } catch {
        res.status(500).json({ message: "Не удалось получить информацию о товаре" });
    }
}

/**
 * @route POST /api/good/add
 * @desc Добавление товара
 * @access Private
*/
const add = async (req, res) => {
    try {
        const user = req.user;
        const { article, cost_price } = req.body;

        if (!article || !cost_price) {
            res.status(400).json({ message: 'Заполните обязательные поля' });
        }

        const doc = new GoodModel({
            article,
            cost_price,
            user: user._id
        });

        const good = await doc.save();

        res.status(201).json(good);
    } catch {
        res.status(500).json({ message: "Не удалось создать товар" });
    }
}

/**
 * @route PUT /api/good/update/:id
 * @desc Редактирование товара
 * @access Private
 */
const update = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { article, cost_price } = req.body;

        await GoodModel.findOneAndUpdate(
            {
                _id: id,
                user: user._id
            },
            {
                article,
                cost_price
            }
        );

        res.status(204).json({ message: "Товар изменен" });
    } catch {
        res.status(500).json({ message: "Не удалось изменить товар" });
    }
}

/**
 * @route DELETE /api/good/remove/:id
 * @desc Удаление товара
 * @access Private
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const deletedGood = await GoodModel.findOneAndDelete({ _id: id, user: user._id });

        if (!deletedGood) {
            return res.status(400).json({ message: "Не удалось удалить товар" });
        }

        res.status(204).json({ message: "Товар удален" });
    } catch {
        res.status(500).json({ message: "Не удалось изменить товар" });
    }
}


module.exports = {
    all,
    good,
    add,
    update,
    remove
};