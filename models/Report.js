const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    realizationreport_id: {
        type: Number,
        unique: true,
    },
    date_from: String, 
    date_to: String,

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    sale_sum_before_comission: Number, // Продажа до вычета комиссии (1)
    sale_count_before_comission: Number, // Кол-во продаж до вычета комиссии (2)

    return_sum_before_comission: Number, // Сумма возвратов до комиссии (3)
    return_count_before_comission: Number, // Кол-во возвратов до комиссии (4)
    
    sale_sum_after_comission: Number, // Продажа после вычета комиссии (5)
    return_sum_after_comission: Number, // Сумма возвратов после вычета комиссии (6)

    comission_sum: Number, // Сумма комиссии (7)
    comission_rate: Number, // Процент комиссии (8)

    scrap_payment_sum: Number, // Оплата брака (9)
    scrap_payment_count: Number, // Кол-во оплат брака (10)

    lost_goods_payment_sum: Number, // Оплата потерянного товара (11)
    lost_goods_payment_count: Number, // Кол-во оплат потерянного товара (12)

    substitute_compensation_sum: Number, // Компенсация подмененного товара (13)
    substitute_compensation_count: Number, // Кол-во компенсаций подмененного товара (14)

    freight_reimbursement_sum: Number, // Возмещение издержек по перевозке (15)
    freight_reimbursement_count: Number, // Кол-во возмещений издержек по перевозке (16)

    sales_reversal_sum: Number, // Сторно продаж (17)
    sales_reversal_count: Number, // Кол-во сторно продаж (18)

    correct_sale_sum: Number, // Корректная продажа (19)
    correct_sale_count: Number, // Кол-во корректных продажа (20)

    reversal_returns_sum: Number, // Сторно возвратов (21)
    reversal_returns_count: Number, // Кол-во сторно возвратов (22)

    correct_return_sum: Number, // Корректный возврат (23)
    correct_return_count: Number, // Кол-во корректных возвратов (24)

    adjustment_amount_sum: Number, // Сумма корректировок (25)
    adjustment_amount_count: Number, // Кол-во корректировок (26)

    sale: Number, // Продано ВБ (27)
    ppvz_for_pay: Number, // К перечислению за товар (28)

    delivery_to_customer_sum: Number, // Заказы (доставки) (29)
    delivery_to_customer_count: Number, // Кол-во доставок до покупателя (30)

    delivery_return_sum: Number, // Возвраты (обратная логистика) (31)
    delivery_return_count: Number, // Кол-во оплат возвратов (32)

    delivery_sum: Number, // Логистика (33)
    delivery_count: Number, // Кол-во доставок (34)

    penalty: Number, // Штрафы (35)

    additional_payment: Number, // Доплаты (36)

    storage: Number, // Хранение (37)
    taking_payment: Number, // Стоимость платной приемки (38)
    other_deductions: Number, // Прочие удержания (39)

    tax_sum: Number, // Налоги (44)

    // Состав отчета по артикулам
    composition: [{
        article: String,
        cost_price: Number, // Себестоимость единицы
        retail_amount: Number, // Продано ВБ
        sale_count: Number, // Кол-во продаж
        return_count: Number, // Кол-во возвратов
        sale_sum: Number, // Сумма продаж (ppvz_for_pay)
        return_sum: Number, // Сумма возвратов
        delivery: Number, // Логистика
    }]
})

const ReportModel = mongoose.model('Report', ReportSchema);

module.exports = {
    ReportModel
}