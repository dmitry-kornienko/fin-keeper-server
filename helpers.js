const { GoodModel } = require("./models/Good");

const getRetailAmountOfArticle = (detalization, article) => {
    let sum = 0;
    detalization.forEach(item => {
        if (item.doc_type_name == "Продажа" && item.sa_name == article) {
            sum +=item.ppvz_for_pay
        }
    });
    return sum.toFixed(2)
}

const getSaleCountOfArticle = (detalization, article) => {
    let count = 0;
    detalization.forEach(item => {
        if (item.doc_type_name == "Продажа" && item.supplier_oper_name == "Продажа" && item.sa_name == article) {
            count += 1
        }
    })
    return count
}

const getReturnCountOfArticle = (detalization, article) => {
    let count = 0;
    detalization.forEach(item => {
        if (item.sa_name == article && item.doc_type_name == "Возврат") {
            count += 1
        }
    })
    return count
}

const getSaleSumOfArticle = (detalization, article) => {
    let sum = 0;
    detalization.forEach(item => {
        if (item.doc_type_name == "Продажа" && item.sa_name == article) {
            sum +=item.ppvz_for_pay
        }
    });
    return sum.toFixed(2);
}

const getReturnSumOfArticle = (detalization, article) => {
    let sum = 0;
    detalization.forEach(item => {
        if (item.sa_name == article && item.doc_type_name == "Возврат") {
            sum += item.ppvz_for_pay
        }
    })
    return sum.toFixed(2);
}

const getDeliveryOfArticle = (detalization, article) => {
    let sum = 0;
    detalization.forEach(item => {
        if (item.sa_name == article && item.supplier_oper_name == "Логистика") {
            sum += item.delivery_rub;
        }
    });
    return sum.toFixed(2);
}

const getReport = (arrayFromWB, dateFrom, dateTo, goods, user) => {

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
                retail_amount: getRetailAmountOfArticle(arrayFromWB, row.sa_name),
                sale_count: getSaleCountOfArticle(arrayFromWB, row.sa_name),
                return_count: getReturnCountOfArticle(arrayFromWB, row.sa_name),
                sale_sum: getSaleSumOfArticle(arrayFromWB, row.sa_name),
                return_sum: getReturnSumOfArticle(arrayFromWB, row.sa_name),
                delivery: getDeliveryOfArticle(arrayFromWB, row.sa_name),
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
    report.other_deductions = arrayFromWB.reduce((sum, el) => sum +el.deduction, 0);
    report.storage = arrayFromWB.reduce((sum, el) => sum + el.storage_fee, 0);
    report.taking_payment = arrayFromWB.reduce((sum, el) => sum + el.acceptance, 0);

    return report
}

const getDataForExcelAddingReport = (data) => {

    const detalizationArr = data.arr.map(row => ({
        realizationreport_id: data.realizationreport_id,
        date_from: data.dateFrom,
        date_to: data.dateTo,
        sa_name: row["Артикул поставщика"],
        doc_type_name: row["Тип документа"],
        quantity: row["Кол-во"],
        retail_amount: row["Вайлдберриз реализовал Товар (Пр)"],
        supplier_oper_name: row["Обоснование для оплаты"],
        retail_price_withdisc_rub: row["Цена розничная с учетом согласованной скидки"],
        delivery_amount: row["Количество доставок"],
        delivery_rub: row["Услуги по доставке товара покупателю"],
        ppvz_for_pay: row["К перечислению Продавцу за реализованный Товар"],
        penalty: row["Общая сумма штрафов"],
        additional_payment: row["Доплаты"],
        storage_fee: row["Хранение"],
        deduction: row["Удержания"],
        acceptance: row["Платная приемка"]
    }))

    return detalizationArr
}

module.exports = {
    getReport,
    getDataForExcelAddingReport
}