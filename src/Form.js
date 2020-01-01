import React from "react";
import './App.css'
import TextField from '@material-ui/core/TextField';


//Model
function TaxDataInput() {
    this.gross = 0;
    this.hsa = 0;
    this.traditional = 0;
    this.studentLoanInterest = 0;
    this.preMagi = function() {
        return this.hsa + this.traditional
    };
    this.magi = function() {
        return this.gross - this.preMagi()
    };
}


class TaxDataInputForm extends React.Component {
    constructor() {
        super();
        this.state = { formValues: {gross: null, hsa: null, traditional: null}};
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
        num = num.replace(",","");
        num = num.replace("$","")
        if (!isNaN(num)) return parseFloat(num)
        else return 0;

    }


    calculateValues(formValues) {
        let gross=this.state.formValues.gross;
        let traditional = this.state.formValues.traditional;
        let hsa = this.state.formValues.hsa;
        let magi = gross - traditional - hsa;
        formValues['magi'] = this.comma(magi);
        return formValues;
    }

    handleChange = (event) => {
        event.preventDefault();
        let formValues = this.state.formValues;
        let id = event.target.id;
        let  value = this.clean(event.target.value);
        formValues[id] = value;
        this.calculateValues(formValues)
        this.setState({formValues})
        console.log(this.state)
    };

    display ( id ) {
        if (this.state.formValues[id] == null) return "";
        else return this.comma(this.state.formValues[id])
    }

    render() {
        return (
            <div>
                <p>Tax Data Input Form</p>

                <TextField label="Gross" id="gross" value={this.display("gross")} onChange={this.handleChange.bind(this)}/><br/>
                <TextField label="401k" id="traditional" value={this.display("traditional")} onChange={this.handleChange.bind(this)}/><br/>
                <TextField label="HSA" id="hsa" value={this.display("hsa")} onChange={this.handleChange.bind(this)}/><br/>
                <TextField
                    id="magi-ready-ony"
                    helperText={"Modified Adjusted Gross Income"}

                    value={this.state.formValues["magi"]}
                    InputProps={{
                        readOnly: true,
                    }}
                /><br/>
                <TextField label="Student Loan Interest" id="student" value={this.display("student")} onChange={this.handleChange.bind(this)}/><br/>
                <TextField label="Passive Loss" id="hsa" value={this.display("hsa")} onChange={this.handleChange.bind(this)}/><br/>


            </div>

        );
    }
}

export default TaxDataInputForm;