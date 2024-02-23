const { GoodModel } = require("../models/Good");
const { ReportModel } = require('../models/Report');
const { SupplierModel } = require("../models/Supplier");
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

        const user = req.user
        const activeSupplier = await SupplierModel.findOne({ user: user._id, is_active: true })

        const config = {
            method: 'get',
            url: `https://statistics-api.wildberries.ru/api/v1/supplier/reportDetailByPeriod?dateFrom=${dateFrom}&dateTo=${dateTo}`,
            headers: {
              'Authorization': activeSupplier.token_stat
            },
        };

        const response = await axios(config);
        const goods = await GoodModel.find();

        const arrayReportsID = [...new Set(response.data.map(i => i.realizationreport_id))];

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

        const getCostPriceSumOfReport = (reportComposition) => {
            let sum = 0
            reportComposition.forEach(async el => {
                const complect = goods.find(i => i.article == el.article);
                if (complect) {
                    sum += Number(complect.cost_price) * Number(el.sale_count)
                }
                 else {
                    const doc = new GoodModel({
                        article: el.article,
                        cost_price: 0
                    });

                    const newGood = await doc.save();
                }
            })
            return sum
        }

        const getReport = (arrayFromWB) => {

            const report = {
                realizationreport_id: arrayFromWB[0].realizationreport_id,
                date_from: dateFrom,
                date_to: dateTo,
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
                total_payment: 0,
                // cost_price_sum: 0,
                // cost_price_precent: 0,
                // gross_profit: 0,
                // tax_sum: 0,
                // tax_precent: 0,
                final_profit: 0,
                // investment_return: 0,
                business_costs: 0,
                // net_profit: 0,
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
                    console.log('Оплата брака')
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
                if (!report.composition.find(i => i.article == row.sa_name) && row.supplier_oper_name == "Продажа") {
                    const complect = goods.find(i => i.article == row.sa_name);
                    
                    report.composition.push({
                        article: complect ? complect.article : row.sa_name,
                        cost_price: complect ? complect.cost_price : 0,
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
            report.total_payment = report.ppvz_for_pay - report.delivery_sum - report.penalty - report.additional_payment - report.storage - report.taking_payment - report.other_deductions; // 040
            // report.cost_price_sum = getCostPriceSumOfReport(report.composition); // 041
            // report.cost_price_precent = report.cost_price_sum / (report.sale_sum_before_comission - report.return_sum_before_comission); // 042
            // report.gross_profit = report.total_payment - report.cost_price_sum; // 043
            // report.tax_sum = report.sale * 0.07; // 044
            // report.final_profit = report.gross_profit - report.tax_sum; // 046
            // report.investment_return = report.final_profit / report.cost_price_sum * 100; // 047
            // report.net_profit = report.final_profit - report.business_costs; // 049

            return report
        }

        arrayReportsID.forEach( async id => {
            const dataOfOneReport = response.data.filter(row => row.realizationreport_id == id);

            const report = getReport(dataOfOneReport);

            const addedReport = await ReportModel.findOne({ realizationreport_id: report.realizationreport_id });

            if (addedReport) {
                return res.status(400).json({ message: 'Отчет с таким ID уже существует' });
            }

            // if (report.composition.some(good => good.cost_price == 0)) {
            //     return res.status(500).json({ message: "В отчете есть товары, которые не добавлены в систему. Перейдите к комплектам и отредактируйте новые товары. Затем повторите запрос отчета" })
            // }

            const doc = new ReportModel(report);

            const reportForDB = await doc.save();
        
            res.status(200).json(reportForDB);
        });        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};

module.exports = {
    add,
};
