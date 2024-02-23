const { GoodModel } = require("../models/Good");

/**
 * @route GET /api/good
 * @desc Все товары
 * @access Public
 */
const all = async (req, res) => {
    try {
        const goods = await GoodModel.find();

        res.status(200).json(goods);
    } catch {
        res.status(500).json({ message: "Не удалось получить информацию о товарах" });
    }
}

/**
 * @route GET /api/good/:id
 * @desc Товар
 * @access Public
 */
const good = async (req, res) => {
    try {
        const { id } = req.params;

        const good = await GoodModel.findOne({ _id: id });

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
        const { article, cost_price } = req.body;

        if (!article || !cost_price) {
            res.status(400).json({ message: 'Заполните обязательные поля' });
        }

        const doc = new GoodModel({
            article,
            cost_price
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
        const { _id, article, cost_price } = req.body;

        await GoodModel.findOneAndUpdate(
            {
                _id
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

        await GoodModel.findOneAndDelete({ _id: id });

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