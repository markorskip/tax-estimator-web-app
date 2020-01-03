import React from "react";
import './App.css'
import TextField from '@material-ui/core/TextField';

const FILING_STATUS = {
    SINGLE: 'single',
    MARRIED_FILING_JOINTLY: 'married',
    HEAD_OF_HOUSEHOLD: 'head'
};

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

//Model
function TaxDataInput() {
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

class TaxDataInputForm extends React.Component {
    constructor(props) {
        super(props);
        let input = new TaxDataInput();
        this.state = {formValues: { input }};
        console.log(this.state)
    }

    comma( num ) {
        var str = num.toString().split('.');
        if (str[0].length >= 4) {
            str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        }
        if (str[1] && str[1].length >= 4) {
            str[1] = str[1].replace(/(\d{3})/g, '$1 ');
        }
        return "$" + str.join('.');
    }

    clean( num ) {
        if ( typeof num == "string") {
            num = num.replace(",","");
            num = num.replace("$","")
        }
        if (!isNaN(num)) return parseFloat(num)
        else return 0;

    }

    handleChange = (event) => {
        event.preventDefault();
        let formValues = this.state.formValues;
        let id = event.target.id;
        let  value = this.clean(event.target.value);
        formValues.input[id] = value;
        this.setState({formValues})
        console.log(this.state)
    };

    display ( id ) {
        if (this.state.formValues.input[id] == null) return "";
        else return this.comma(this.state.formValues.input[id])
    }

    createCopy ( input ) {
        let clone = new TaxDataInput();
        clone.gross1 = input.gross1;
        clone.gross2 = input.gross2;
        clone.traditional = input.traditional;
        clone.hsa = input.hsa;
        clone.passiveLoss = input.passiveLoss;
        clone.studentLoanInterest = input.studentLoanInterest;
        return clone
    }

    insights ( taxData, amount ) {
        amount = amount * 1000;
        let fedTax1 = taxData.taxTotal();
        const copy = this.createCopy(taxData);
        console.log(copy);
        copy.gross2 += amount;
        let fedTax2 = copy.taxTotal();
        let realRate = (fedTax2 - fedTax1) / amount;
        return realRate.toFixed(2);;
    }




    render() {
        return (
            <div>
            <div id="parent">
                <div id="wide">
                <p>Tax Data Input Form</p>
                <TextField label="Gross Income 1" id="gross1" value={this.display("gross1")} onChange={this.handleChange.bind(this)}/><br/>
                <TextField label="Gross Income 2" id="gross2" value={this.display("gross2")} onChange={this.handleChange.bind(this)}/><br/>
                <TextField label="401k" id="traditional" value={this.display("traditional")} onChange={this.handleChange.bind(this)}/><br/>
                <TextField label="HSA" id="hsa" defaultValue={1500} value={this.display("hsa")} onChange={this.handleChange.bind(this)}/><br/>
                <TextField label="Student Loan Interest" id="studentLoanInterest" value={this.display("studentLoanInterest")} onChange={this.handleChange.bind(this)}/><br/>
                <TextField label="Passive Loss" id="passiveLoss" value={this.display("passiveLoss")} onChange={this.handleChange.bind(this)}/><br/>
                </div>
                <div id="narrow">
                <p>Tax Data Output</p>
                <TextField label="Gross Income" value={this.state.formValues.input.gross()}/><br/>
                <TextField label="MAGI" value={this.state.formValues.input.magi()}/><br/>
                <TextField label="Allowed Student Interest" value={this.state.formValues.input.allowedStudentInterest()}/><br/>
                <TextField label="Allowed Passive Losses" value={this.state.formValues.input.allowedPassiveLoss()}/><br/>
                <TextField label="AGI" value={this.state.formValues.input.agi()}/><br/>
                <TextField label="Taxable Income" value={this.state.formValues.input.taxableIncome()}/><br/>
                <TextField label="Federal Taxes" value={this.state.formValues.input.federalTaxes()}/><br/>
                <TextField label="Fica Person 1" value={this.state.formValues.input.fica1()}/><br/>
                <TextField label="Fica Person 2" value={this.state.formValues.input.fica2()}/><br/>
                <TextField label="Fica Total" value={this.state.formValues.input.ficaTotal()}/><br/>
                    <TextField label="Tax Total" value={this.state.formValues.input.taxTotal()}/><br/>
                </div>
            </div>
                <div>
                    <p>Insights</p>
                    Your next 10000 is taxed at this REAL rate:
                    { this.insights(this.state.formValues.input, 10)}

                    <br/>
                    Your next 50000 is taxed at this REAL rate:
                    { this.insights(this.state.formValues.input, 50)}

                </div>
            </div>
        );
    }
}

export default TaxDataInputForm;