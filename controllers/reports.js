const { GoodModel } = require("../models/Good");
const { UserModel } = require("../models/User");
const { ReportModel } = require('../models/Report');
const fs = require('fs');
const xlsx = require('xlsx');
const { getReport, getDataForExcelAddingReport } = require("../helpers");
const axios = require('axios').default;

/**
 * @route POST /api/report/add
 * @desc Добавление отчета
 * @access Private
 */
const add = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.body;

        if (!dateFrom || !dateTo) {
            return res.status(400).json({ message: "Пожалуйста, укажите даты отчета" });
        }

        const user = req.user;

        if (user.bill <= 0) {
            return res.status(400).json({ message: "Недостаточно средств на балансе." });
        }

        const config = {
            method: 'get',
            url: `https://statistics-api.wildberries.ru/api/v1/supplier/reportDetailByPeriod?dateFrom=${dateFrom}&dateTo=${dateTo}`,
            headers: {
              'Authorization': user.tokenWB
            },
        };

        const response = await axios(config);

        if (!response.data) {
            return res.status(500).json({ message: "Загрузка отчета по API не доступна" })
        }

        const goods = await GoodModel.find();

        const getRetailAmountOfArticle = (article) => {
            let sum = 0;
            response.data.forEach(item => {
                if (item.doc_type_name == "Продажа" && item.sa_name == article) {
                    sum +=item.ppvz_for_pay
                }
            });
            return sum.toFixed(2)
        }

        const getSaleCountOfArticle = (article) => {
            let count = 0;
            response.data.forEach(item => {
                if (item.doc_type_name == "Продажа" && item.supplier_oper_name == "Продажа" && item.sa_name == article) {
                    count += 1
                }
            })
            return count
        }

        const getReturnCountOfArticle = (article) => {
            let count = 0;
            response.data.forEach(item => {
                if (item.sa_name == article && item.doc_type_name == "Возврат") {
                    count += 1
                }
            })
            return count
        }

        const getSaleSumOfArticle = (article) => {
            let sum = 0;
            response.data.forEach(item => {
                if (item.doc_type_name == "Продажа" && item.sa_name == article) {
                    sum +=item.ppvz_for_pay
                }
            });
            return sum.toFixed(2);
        }

        const getReturnSumOfArticle = (article) => {
            let sum = 0;
            response.data.forEach(item => {
                if (item.sa_name == article && item.doc_type_name == "Возврат") {
                    sum += item.ppvz_for_pay
                }
            })
            return sum.toFixed(2);
        }

        const getDeliveryOfArticle = (article) => {
            let sum = 0;
            response.data.forEach(item => {
                if (item.sa_name == article && item.supplier_oper_name == "Логистика") {
                    sum += item.delivery_rub;
                }
            });
            return sum.toFixed(2);
        }

        const getReport = (arrayFromWB) => {

            const report = {
                realizationreport_id: arrayFromWB[0].realizationreport_id,
                date_from: dateFrom,
                date_to: dateTo,
                user: user._id,
                sale_sum_before_comission: 0,
                sale_count_before_comission: 0,
                return_sum_before_comission: 0,
                return_count_before_comission: 0,
                sale_sum_after_comission: 0,
                return_sum_after_comission: 0,
                comission_sum: 0,
                comission_rate: 0,
                scrap_payment_sum: 0,
                scrap_payment_count: 0,
                lost_goods_payment_sum: 0,
                lost_goods_payment_count: 0,
                substitute_compensation_sum: 0,
                substitute_compensation_count: 0,
                freight_reimbursement_sum: 0,
                freight_reimbursement_count: 0,
                sales_reversal_sum: 0,
                sales_reversal_count: 0,
                correct_sale_sum: 0,
                correct_sale_count: 0,
                reversal_returns_sum: 0,
                reversal_returns_count: 0,
                correct_return_sum: 0,
                correct_return_count: 0,
                adjustment_amount_sum: 0,
                adjustment_amount_count: 0,
                sale: 0,
                ppvz_for_pay: 0,
                delivery_to_customer_sum: 0,
                delivery_to_customer_count: 0,
                delivery_return_sum: 0,
                delivery_return_count: 0,
                delivery_sum: 0,
                delivery_count: 0,
                penalty: 0,
                additional_payment: 0,
                storage: 0,
                taking_payment: 0,
                other_deductions: 0,
                tax_sum: 0,
                final_profit: 0,
                composition: [],
            }

            arrayFromWB.forEach(row => {
                if (row.doc_type_name == "Продажа" && row.supplier_oper_name == "Продажа") {
                    report.sale_sum_before_comission += row.retail_price_withdisc_rub; // 001
                    report.sale_count_before_comission += row.quantity; // 002
                    report.sale_sum_after_comission += row.ppvz_for_pay; // 005
                }
                if (row.doc_type_name == "Продажа" && (row.supplier_oper_name == "Продажа" || row.supplier_oper_name == "Сторно возвратов")) {
                    report.sale += row.retail_amount; // 027
                }
                if (row.doc_type_name == "Возврат" && row.supplier_oper_name == "Возврат") {
                    report.return_sum_before_comission += row.retail_price_withdisc_rub; // 003
                    report.return_count_before_comission += row.quantity; // 004
                    report.return_sum_after_comission += row.ppvz_for_pay; // 006
                }
                if (row.supplier_oper_name == "Оплата брака") {
                    report.scrap_payment_sum += row.ppvz_for_pay; // 009
                    report.scrap_payment_count += row.quantity; // 010
                }
                if (row.supplier_oper_name == "Оплата потерянного товара") {
                    report.lost_goods_payment_sum += row.ppvz_for_pay; // 011
                    report.lost_goods_payment_count += row.quantity; // 012
                }
                if (row.supplier_oper_name == "Компенсация подмененного товара") {
                    report.substitute_compensation_sum += row.ppvz_for_pay; // 013
                    report.substitute_compensation_count += row.quantity; // 014
                }
                if (row.supplier_oper_name == "Возмещение издержек по перевозке") {
                    report.freight_reimbursement_sum += row.ppvz_for_pay; // 015
                    report.freight_reimbursement_count += row.quantity; // 016
                }
                if (row.supplier_oper_name == "Сторно продаж") {
                    report.sales_reversal_sum += row.ppvz_for_pay; // 017
                    report.sales_reversal_count += row.quantity; // 018
                }
                if (row.supplier_oper_name == "Корректная продажа") {
                    report.correct_sale_sum += row.ppvz_for_pay; // 019
                    report.correct_sale_count += row.quantity; // 020
                }
                if (row.supplier_oper_name == "Сторно возвратов") {
                    report.reversal_returns_sum += row.ppvz_for_pay; // 021
                    report.reversal_returns_count += row.quantity; // 022
                }
                if (row.supplier_oper_name == "Корректный возврат") {
                    report.correct_return_sum += row.ppvz_for_pay; // 023
                    report.correct_return_count += row.quantity; // 024
                }
                if (row.delivery_amount > 0) {
                    report.delivery_to_customer_sum += row.delivery_rub; // 029
                    report.delivery_to_customer_count += row.delivery_amount; // 030
                }
                if (row.return_amount > 0) {
                    report.delivery_return_sum += row.delivery_rub; // 031
                    report.delivery_return_count += row.delivery_amount; // 032
                }
                if (row.supplier_oper_name == "Логистика") {
                    report.delivery_sum += row.delivery_rub; // 033
                }
                if (row.supplier_oper_name == "Штрафы") {
                    report.penalty += row.penalty; // 035
                }
                if (row.supplier_oper_name == "Доплаты") {
                    report.additional_payment += row.additional_payment; // 036
                }
                if (!report.composition.find(i => i.article.toLowerCase() == row.sa_name.toLowerCase()) && row.supplier_oper_name == "Продажа") {
                    const good = goods.find(i => i.article.toLowerCase() == row.sa_name.toLowerCase());

                    if (!good) {
                        async function addNewGood() {
                            const docOfNewGood = new GoodModel({
                                article: row.sa_name.toLowerCase(),
                                user: user._id
                            });
                            await docOfNewGood.save()
                        }
                        addNewGood();
                    }

                    report.composition.push({
                        article: good ? good.article : row.sa_name,
                        cost_price: good ? good.cost_price : 0,
                        retail_amount: getRetailAmountOfArticle(row.sa_name),
                        sale_count: getSaleCountOfArticle(row.sa_name),
                        return_count: getReturnCountOfArticle(row.sa_name),
                        sale_sum: getSaleSumOfArticle(row.sa_name),
                        return_sum: getReturnSumOfArticle(row.sa_name),
                        delivery: getDeliveryOfArticle(row.sa_name),
                    })
                }
            });

            report.comission_sum = (report.sale_sum_before_comission - report.return_sum_before_comission) - (report.sale_sum_after_comission - report.return_sum_after_comission); // 007
            report.adjustment_amount_sum = report.correct_sale_sum - report.sales_reversal_sum + report.reversal_returns_sum - report.correct_return_sum; // 025
            report.comission_rate = (report.comission_sum + report.adjustment_amount_sum) / report.sale_sum_before_comission; // 008
            report.adjustment_amount_count = report.sales_reversal_count + report.correct_sale_count + report.reversal_returns_count + report.correct_return_count; // 026
            report.ppvz_for_pay = report.sale_sum_after_comission - report.return_sum_after_comission + report.adjustment_amount_sum; // 028
            report.delivery_count = report.delivery_to_customer_count + report.delivery_return_count; // 034
            report.tax_sum = report.sale * 0.07; // 044

            return report
        }

        const report = getReport(response.data);

        const addedReport = await ReportModel.findOne({ realizationreport_id: report.realizationreport_id });

        if (addedReport) {
            return res.status(400).json({ message: 'Отчет с таким ID уже существует' });
        }

        const doc = new ReportModel(report);

        const reportForDB = await doc.save();

        await UserModel.findOneAndUpdate({ _id: user._id }, { $inc: { bill: -1 } });
        
        res.status(200).json(reportForDB);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};

/**
 * @route POST /api/report/add-through-excel
 * @desc Добавление отчета через Excel
 * @access Private
 */
const addThroughExcel = async (req, res) => {
    try {
        const { dateFrom, dateTo, realizationreport_id } = req.body;
        
        const file = req.file;
        
        if (!file || !dateFrom || !dateTo || !realizationreport_id) {
            return res.status(400).json({ message: "Пожалуйста, укажите все данные отчета" });
        }

        const user = req.user;
        
        if (user.bill <= 0) {
            return res.status(400).json({ message: "Недостаточно средств на балансе." });
        }

         const filePath = file.path;
         const workbook = xlsx.readFile(filePath);
 
         const firstSheetName = workbook.SheetNames[0];
         const firstSheet = workbook.Sheets[firstSheetName];
         const data = xlsx.utils.sheet_to_json(firstSheet, { header: 1 });
 
         const columns = data[0];
 
         const rows = data.slice(1);
 
         const objectsArray = rows.map(row => {
             const obj = {};
             columns.forEach((column, index) => {
                obj[column] = row[index];
             });
             return obj;
         });
         
        const detalization = getDataForExcelAddingReport({ arr: objectsArray, dateFrom: dateFrom, dateTo: dateTo, realizationreport_id: realizationreport_id });

        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error(err);
            }
        });

        const goods = await GoodModel.find();

        const report = getReport(detalization, dateFrom, dateTo, goods, user);

        const addedReport = await ReportModel.findOne({ realizationreport_id: report.realizationreport_id });

        if (addedReport) {
            return res.status(400).json({ message: 'Отчет с таким ID уже существует' });
        }

        const doc = new ReportModel(report);

        const reportForDB = await doc.save();

        await UserModel.findOneAndUpdate({ _id: user._id }, { $inc: { bill: -1 } });
        
        res.status(200).json(reportForDB);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
}

/**
 * @route GET /api/report
 * @desc Получение всех точетов пользователя
 * @access Private
 */
const all = async (req, res) => {
    try {
        const user = req.user;

        const reports = await ReportModel.find({ user: user._id });

        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Не удалось получить отчеты" });
    }
};

/**
 * @route GET /api/report/:id
 * @desc Получение одного отчета
 * @access Private
 */
const report = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const report = await ReportModel.findOne({ _id: id, user: user._id });

        if (!report) {
            return res.status(400).json({ message: "Отчет не найден" });
        }

        res.status(200).json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Не удалось получить отчет" });
    }
};

/**
 * @route PATCH /api/report/update-cost-price/:id
 * @desc Изменение себестоимости товара в отчете
 * @access Private
 */
const editCostPriceOfArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        data.forEach(async (i) => {
            await ReportModel.updateOne({ _id: id, 'composition.article': i.article }, { $set: { 'composition.$.cost_price': i.cost_price } });
        });

        res.status(200).json({ message: "Себестоимость товара в отчете изменена" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Не удалось изменить себестоимость" });
    }
};

/**
 * @route DELETE /api/report/remove/:id
 * @desc Удаление отчета
 * @access Private
*/
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        
        const deletedReport = await ReportModel.findOneAndDelete({ _id: id, user: user._id });
        
        if (!deletedReport) {
            return res.status(400).json({ message: "Не удалось удалить отчет" })
        }
        
        res.status(200).json({ message: "Отчет удален" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Не удалось удалить отчет" });
    }
};

/**
 * @route PATCH /api/report/update-additional-parameters/:id
 * @desc Изменение себестоимости товара в отчете
 * @access Private
 */
const editAdditionalParameters = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const { storage, taking_payment, other_deductions } = req.body;

        const editedReport = await ReportModel.findOneAndUpdate({ _id: id, user: user._id }, { $set: {
            storage,
            taking_payment,
            other_deductions
        }})

        res.status(200).json(editedReport);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Не удалось изменить отчет" });
    }
};

module.exports = {
    add,
    addThroughExcel,
    all,
    report,
    editCostPriceOfArticle,
    remove,
    editAdditionalParameters
};
