const { SupplierModel } = require("../models/Supplier");
const { UserModel } = require("../models/User");

/**
 * @route POST /api/supplier/add
 * @desc Добавление поставщика
 * @access Public
 */
const add = async (req, res) => {
    try {
        const { name, tax_rate, tax_from, userId, token_stat } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Пожалуйста, заполните обязательные поля" });
        }

        const doc = new SupplierModel({
            name,
            tax_rate,
            tax_from,
            token_stat,
            user: userId,
        });

        const supplier = await doc.save();

        await UserModel.updateOne(
            {
                _id: userId,
            },
            {
                $push: {
                    suppliers: supplier._id,
                },
            }
        );

        return res.status(201).json(supplier);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};

module.exports = {
    add,
};
