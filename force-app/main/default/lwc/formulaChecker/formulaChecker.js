import { LightningElement } from 'lwc';
import CheckFormula from '@salesforce/apex/FormulaCheckerController.CheckFormula';
import { reduceErrors } from 'c/ldsUtils';

export default class FormulaChecker extends LightningElement {
    type='Account';
    error;
    returnType='BOOLEAN';
    formula;
    formulaIsTemplate=false;
    formulaOutput;
    recordId;
    typeOptions=[{label: 'Account', value: 'Account'},
            {label: 'Opportunity', value: 'Opportunity'},
            {label: 'Contact', value: 'Contact'}
        ];
    timeout=null;

    returnTypeOptions=[{label: 'BOOLEAN', value: 'BOOLEAN'},
        {label: 'DATE', value: 'DATE'},
        {label: 'DATETIME', value: 'DATETIME'},
        {label: 'DECIMAL', value: 'DECIMAL'},
        {label: 'DOUBLE', value: 'DOUBLE'},
        {label: 'ID', value: 'ID'},
        {label: 'INTEGER', value: 'INTEGER'},
        {label: 'LONG', value: 'LONG'},
        {label: 'STRING', value: 'STRING'},
        {label: 'TIME', value: 'TIME'}
    ];

    handleSObjectType(ev)
    {
        let newType=ev.detail.value;
        if (newType!==this.type)
        {
            this.type = ev.detail.value;
            this.formula='';
            this.refs.formula.value = '';
            this.recordId=undefined;
            this.refs.record.clearSelection();
        }
    }

    handleReturnType(ev)
    {
        this.returnType=ev.detail.value;
    }

    handleTemplateToggled(ev)
    {
        this.formulaIsTemplate=!this.formulaIsTemplate;
    }

    handleRecord(ev)
    {
        this.recordId=ev.detail.recordId;
    }

    handleFormula(ev) {
        const eventValue=ev.detail.value;
        clearTimeout(this.timeout);
        this.timeout = setTimeout((value) => {
            if (-1!=value.indexOf('{!')) {
                this.formulaIsTemplate=true;
            }
            else{
                this.formulaIsTemplate=false;
            }
            this.refs.formulaIsTemplate.checked=this.formulaIsTemplate;
          }, 1000, eventValue);
    }

    async checkFormula() {
        try {
            this.formulaOutput = undefined;
            this.formula=this.refs.formula.value;
            // eslint-disable-next-line no-alert
            let params={formulaStr: this.formula,
                sobjectType: this.type,
                returnTypeStr: this.returnType,
                recordId: this.recordId,
                formulaIsTemplate: this.formulaIsTemplate
               };

            // Call the Apex Method from the controller);
            this.formulaOutput = await CheckFormula(params);
            this.error = undefined;
        } catch (error) {
            let errors=reduceErrors(error).reduce((accumulator, currentValue) => accumulator.concat(', ', currentValue), '');
            
            this.error = errors.substring(2);
        }
    }
}