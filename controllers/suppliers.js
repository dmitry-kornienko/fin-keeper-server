const { SupplierModel } = require("../models/Supplier");
const { UserModel } = require("../models/User");

/**
 * @route POST /api/supplier/:id
 * @desc Получение поставщика
 * @access Private
 */
const supplier = async (req, res) => {
    try {
        const { id } = req.params;

        const supplier = await SupplierModel.findOne({ _id: id });

        if (!supplier) {
            return res.status(404).json({ message: "Не удалось получить поставщика" });
        }

        return res.status(201).json(supplier);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};
/**
 * @route POST /api/supplier/add
 * @desc Добавление поставщика
 * @access Private
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
/**
 * @route DELETE /api/supplier/delete/:id
 * @desc Удаление поставщика
 * @access Private
 */
const deleteOne = async (req, res) => {
    try {
        const { supplierId, userId } = req.body;

        await SupplierModel.findOneAndDelete({
            _id: supplierId
        });

        const user = await UserModel.findOneAndUpdate(
            {
                _id: userId
            },
            {
                $pull: {
                    suppliers: supplierId
                }
            }
        )

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        return res.status(200).json({ message: "Данные поставщмка изменены" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};
/**
 * @route PATCH /api/supplier/edit/:id
 * @desc Изменение поставщика
 * @access Private
 */
const edit = async (req, res) => {
    try {
        const { id, name, tax_rate, tax_from, token_stat } = req.body;

        if (!id || !name || tax_rate || !tax_from || !token_stat) {
            return res.status(400).json({ message: "Заполните все поля" });
        }
        
        await SupplierModel.updateOne(
            {
                _id: id
            },
            {
                $set: {
                    name,
                    tax_rate,
                    tax_from,
                    token_stat
                }
            }
        )

        return res.status(201).json(supplier);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};

module.exports = {
    add,
    supplier,
    deleteOne,
    edit,
};
