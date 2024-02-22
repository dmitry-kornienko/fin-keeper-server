const { SupplierModel } = require("../models/Supplier");
const { UserModel } = require("../models/User");

/**
 * @route GET /api/supplier/:id
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
 * @route GET /api/supplier
 * @desc Получение пвсех поставщиков пользователя
 * @access Private
 */
const suppliersCurrentUser = async (req, res) => {
    try {
        const user = req.user
        const suppliers = await SupplierModel.find({ user: user._id });

        if (!suppliers) {
            return res.status(404).json({ message: "Не удалось получить поставщиков" });
        }

        return res.status(200).json(suppliers);
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
            is_active: true,
        });

        const supplier = await doc.save();

        await SupplierModel.updateMany(
            {
                user: userId,
                _id: {
                    $ne: supplier._id
                },
            },
            {
                $set: {
                    is_active: false
                }
            }
        )

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
        const { _id, name, tax_rate, tax_from, token_stat } = req.body;
        console.log(req.body)

        if (!_id || !name || !tax_rate || !tax_from || !token_stat) {
            return res.status(400).json({ message: "Заполните все поля" });
        }
        
        await SupplierModel.updateOne(
            {
                _id: _id
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

/**
 * @route PATCH /api/supplier/change-active-supplier/:id
 * @desc Изменение активного поставщика
 * @access Private
 */
const changeActiveSupplier = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Не удалось распознать id поставщика" });
        }

        await SupplierModel.updateMany({}, {
            $set: {
                is_active: false
            }
        })
        
        await SupplierModel.updateOne(
            {
                _id: id
            },
            {
                $set: {
                    is_active: true
                }
            }
        )

        return res.status(201).json({ message: "Активный поставщик изменен" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
}

module.exports = {
    add,
    supplier,
    suppliersCurrentUser,
    deleteOne,
    edit,
    changeActiveSupplier,
};
