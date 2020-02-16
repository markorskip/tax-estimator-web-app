const FILING_STATUS = {
    SINGLE: 'single',
    MARRIED_FILING_JOINTLY: 'married',
    HEAD_OF_HOUSEHOLD: 'head'
};

function rateCalculator(rates, amount) {
    let taxOwed = 0;

    for (let i = 0; i < rates.length; i++) {
        let bracket = rates[i][0];
        let rate = rates[i][1];
        if (amount > bracket) {
            let thisPortionIsTaxedAtThisRate = amount - (bracket);
            taxOwed += (thisPortionIsTaxedAtThisRate * rate);
            amount -= thisPortionIsTaxedAtThisRate;
        }
    } return taxOwed
}

const NM_MARRIED_RATES_2019 = [
    [0, .017],
    [5500, .032],
    [11000, .047],
    [16000, .049]
];

const MARRIED_RATES_2019 = [
    [612350,.37],
    [408200,.35],
    [321450, .32],
    [168400, .24],
    [78950, .22],
    [19400, .12],
    [0, .10]
];

function fedTaxes(taxableIncome, filingStatus) {
    let amountToBeTaxed = taxableIncome;
    let taxOwed = 0;
    if (filingStatus === FILING_STATUS.MARRIED_FILING_JOINTLY) {
        taxOwed = rateCalculator(MARRIED_RATES_2019, amountToBeTaxed)
    }
    return taxOwed;
}

function stateTaxes(taxableIncome, filingStatus, state) {
    let amountToBeTaxed = taxableIncome;
    let taxOwed = 0;
    if (filingStatus === FILING_STATUS.MARRIED_FILING_JOINTLY) {
        taxOwed = rateCalculator(NM_MARRIED_RATES_2019, amountToBeTaxed)
    }
    return taxOwed;

}

function taxableIncomeCalculator(agi, deduction) {
    if (agi - deduction < 0) return 0;
    return agi - deduction
}

function grossIncomeCalculator(gross1, gross2) {
    if (gross1 + gross2 < 0) return 0;
    return gross1 + gross2;
}

function calculateFica(income) {
    let medicare = income * .0145;
    let wageLimit = 129000;
    if (income > wageLimit) income = wageLimit;
    let ss = income * .062;
    return ss + medicare;
}

function studentInterestCalculator(magi, incurredInterest) {
    let allowedInterest = incurredInterest;
    if (allowedInterest > 2500) allowedInterest = 2500;
    if (magi > 170000) return 0;
    if (magi < 140000) return allowedInterest;
    let maxInterest = ((170000 - magi) / 30000) * 2500;
    return Math.round(Math.min(maxInterest, incurredInterest))
}

function passiveLossCalculator(magi, passiveLoss) {
    if (passiveLoss > 25000) passiveLoss = 25000;
    if (magi > 150000) return 0;
    if (magi < 100000) return passiveLoss;
    let maxPassiveLoss = (150000 - magi) / 2;
    if (passiveLoss > maxPassiveLoss) return maxPassiveLoss;
    return passiveLoss;
}

function deductionCalculator(status) {
    if (status === FILING_STATUS.MARRIED_FILING_JOINTLY) return 24400;
    if (status === FILING_STATUS.SINGLE) return 12200;
    if (status === FILING_STATUS.HEAD_OF_HOUSEHOLD) return 18350;
}

export default function TaxDataInput() {
    this.status = FILING_STATUS.MARRIED_FILING_JOINTLY;
    this.gross1 = 0;
    this.gross2 = 0;
    this.hsa = 0;
    this.traditional = 0;
    this.studentLoanInterest = 0;
    this.passiveLoss = 0;
    this.state = "NM"; // TODO make an enum of all state codes
    this.gross = function() {
        return grossIncomeCalculator(this.gross1, this.gross2)
    };
    this.magi = function() {
        return this.gross() - this.traditional - this.hsa
    };
    this.allowedStudentInterest = function() {
        return studentInterestCalculator(this.magi(), this.studentLoanInterest)
    };
    this.allowedPassiveLoss = function() {
        return passiveLossCalculator(this.magi(), this.passiveLoss);
    };
    this.agi = function() {
        return this.magi() - this.allowedPassiveLoss() - this.allowedStudentInterest();
    };
    this.deduction = function() {
        return deductionCalculator(this.status);
    };
    this.taxableIncome = function() {
        return taxableIncomeCalculator(this.agi(),this.deduction());
    };
    this.federalTaxes = function() {
        return fedTaxes(this.taxableIncome(), this.status);
    };
    this.stateTaxes = function() {
        return stateTaxes(this.taxableIncome(), this.status, this.state);
    };
    this.fica1 = function() {
        return calculateFica(this.gross1);
    };
    this.fica2 = function() {
        return calculateFica(this.gross2)
    };
    this.ficaTotal = function() {
        return this.fica1() + this.fica2();
    };
    this.taxTotal = function() {
        return this.ficaTotal() + this.federalTaxes() + this.stateTaxes()
    };

}
