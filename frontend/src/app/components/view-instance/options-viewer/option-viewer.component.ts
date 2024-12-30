import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionList} from 'src/app/models/optionList';
import {QuestionType} from "../../../models/question";
import {NgModel} from "@angular/forms";
import {Answer} from "../../../models/answer";
import {OptionValue} from "../../../models/optionValue";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {MatSelectChange} from "@angular/material/select";
import {MatRadioChange} from "@angular/material/radio";

@Component({
    selector: 'app-option-viewer',
    templateUrl: './option-viewer.component.html',
    styleUrl: './option-viewer.component.css'
})
export class OptionViewerComponent implements OnInit {
    
    @Input() optionList?: OptionList;


    private _answers?: Answer[]; 
    @Input() 
        set answers(value: Answer[] | undefined) { 
            this._answers = value; 
            this.onAnswersChange(value);
        } 
        get answers(): Answer[] | undefined { 
            return this._answers; 
        }

    private _questionType?: QuestionType;

    @Input()
    set questionType(value: QuestionType | undefined) {
        this._questionType = value;
        this.onQuestionTypeChange(value); 
    }
    get questionType(): QuestionType | undefined {
        return this._questionType;
    }
    
    
    @Input() isRequired: boolean = false;
    @Input() isCompleted: boolean = false;
    
    
    
    @Output() updatedValuesEvent = new EventEmitter<any>();
    protected readonly QuestionType = QuestionType;
    
    protected currentValue = this.answers ? this.answers[0].value : "";
    // Used as currentValue for multiple-answers based questions
    protected currentValueIndex : number [] = [];
    constructor() {
    }


    ngOnInit() {
    }
    
    updateValues() {
            this.updatedValuesEvent.emit(this.currentValue);
    }

    private onAnswersChange(value: Answer[] | undefined) {
        this.currentValue="";
        this.selectedValue="";
        if (value && value.length == 1) {
            this.currentValue=value[0].value;
        }

        this.currentValueIndex = [];
        this.answers?.forEach((answer: Answer) => {
            this.currentValueIndex.push(Number.parseInt(answer.value));
        });
    }
    private onQuestionTypeChange(value: QuestionType | undefined) {
        if ((this.questionType == QuestionType.Combo || this.questionType == QuestionType.Radio  ) && this.answers && this.answers.length == 1) {
            this.selectedValue=this.valueFinder(Number.parseInt(this.answers[0].value));
        }
    }
    
    // SHORT, LONG & DATE
    onFieldInput(modelInput : NgModel) {
        console.log("onFieldInput()", this.currentValue);
        
        if (!modelInput.value && this.isRequired) {
            modelInput.control.setErrors({required:true});
        } else {
            modelInput.control.setErrors(null);
        }
        
        this.updateValues();
    }
    
    //MAIL
    onEmailFieldInput(emailInput: NgModel) {
        const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        if (regexp.test(emailInput.value)) {
            emailInput.control.setErrors(null);
            this.updateValues();
        } else {
            emailInput.control.setErrors({email:true});
        }
        
        if (emailInput.value === "" && this.isRequired) {
            emailInput.control.setErrors({required:true});
        }
            
    }
    
    //INTEGER
    onIntegerFieldChange(integerInput: NgModel) {
        console.log("onIntegerFieldChange()", integerInput);
        const regexp = new RegExp(/^[0-9]*$/);

        if (!integerInput.value && this.isRequired) {
            integerInput.control.setErrors({required:true});
        } else {
            integerInput.control.setErrors({required:false});
        }
        
        if (regexp.test(integerInput.value)) {
            integerInput.control.setErrors(null);
            this.updateValues();
        } else {
            if (integerInput.value) {
                integerInput.control.setErrors({integer:true});
            }
        }
    }

    //CHECK
    preselectCheckBox(option: OptionValue, i: number): boolean {
        if (this.answers) {
            return this.answers.some(answer => Number.parseInt(answer.value) === i);
        }
        return false;
    }

    onCheckboxFieldChange(event: MatCheckboxChange, index: number) {
            
            if (event.checked) {
                this.currentValueIndex.push(index);
                this.updatedValuesEvent.emit(this.currentValueIndex);
                
            } else {
                this.currentValueIndex = this.currentValueIndex.filter((value : number) => {
                    return value !== index;
                });
                this.updatedValuesEvent.emit(this.currentValueIndex);
            }
            
    }
    
    //COMBO
    protected selectedValue = this.answers?.[0]?.value ? this.valueFinder(Number.parseInt(this.answers[0].value)) : undefined;
    onComboFieldChange($event: MatSelectChange) {
        this.currentValue = this.indexFinder($event.value).toString();
        this.updateValues();
    }
    indexFinder(value: string){
        return (this.optionList?.optionValues?.findIndex(option => option.value === value))!+1;
    }
    valueFinder(index: number){
        if (this.optionList?.optionValues) {
            return this.optionList.optionValues[index-1].value;
        }
        return undefined;
    }
    
    // RADIO
    onRadioFieldChange($event: MatRadioChange, number: number) {
        this.currentValue = this.indexFinder($event.value).toString();
        this.updateValues();
    }


}