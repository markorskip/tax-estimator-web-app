import React from "react";
import './App.css'
import TextField from '@material-ui/core/TextField';
import TaxDataInput from "./model/model";
import util from "./model/helperFunctions"

class TaxDataInputForm extends React.Component {
    constructor(props) {
        super(props);
        let input = new TaxDataInput();
        this.state = {formValues: { input }};
        console.log(this.state)
    }

    handleChange = (event) => {
        event.preventDefault();
        let formValues = this.state.formValues;
        let id = event.target.id;
        let  value = util.clean(event.target.value);
        formValues.input[id] = value;
        this.setState({formValues})
        console.log(this.state)
    };

    display (id) {
        if (this.state.formValues.input[id] == null) return util.comma(0);
        else return util.comma(this.state.formValues.input[id])
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