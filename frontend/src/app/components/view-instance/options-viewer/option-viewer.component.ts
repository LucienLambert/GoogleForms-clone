import {Component, OnInit, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {merge} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { OptionList } from 'src/app/models/optionList';
import {QuestionType} from "../../../models/question";
import {NgModel} from "@angular/forms";
import {Answer} from "../../../models/answer";
import {OptionValue} from "../../../models/optionValue";

@Component({
    selector: 'app-option-viewer',
    templateUrl: './option-viewer.component.html',
    styleUrl: './option-viewer.component.css'
})
export class OptionViewerComponent implements OnInit {
    @ViewChild('email') email!: NgModel;
    
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
    
    @Input() questionType?: QuestionType;
    //TODO
    @Input() isRequired: boolean = false;
    @Input() isCompleted: boolean = false;
    
    
    
    @Output() updatedValuesEvent = new EventEmitter<any>();


    protected readonly QuestionType = QuestionType;
    protected currentAnswer?: Answer;
    protected _currentValue?: any = "";
        set currentValue(value: any) {
            this._currentValue = value;
            // this.onCurrentValueChange(value);
        }
        get currentValue(): any {
            return this._currentValue;
        }
    constructor() {

    }


    ngOnInit() {
    }
    
    updateValues() {
            this.updatedValuesEvent.emit(this.currentValue);
    }

    private onAnswersChange(value: Answer[] | undefined) {
        this.currentAnswer = undefined;
        this.currentValue = "";
        if (this.answers && this.answers.length == 1) {
            this.currentValue=this.answers[0].value;
        } else if (this.answers && this.answers.length > 1) {
            //TODO
        }
    }
    
    onFieldInput() {
            console.log("onFieldInput()", this.currentValue);
        switch (this.questionType) {
            case QuestionType.Short:
            case QuestionType.Long:
            case QuestionType.Email:
            case QuestionType.Date:
                this.updateValues();
                break;
            default:
            
        }
    }
    
    

    // RADIO
    preselectRadioButton(option: OptionValue, i: number) {
        return Number.parseInt(this.currentValue) === i;
    }

    //CHECK
    preselectCheckBox(option: OptionValue, i: number): boolean {
        if (this.answers) {
            return this.answers.some(answer => Number.parseInt(answer.value) === i);
        }
        return false;
    }
    
    //COMBO
    preselectCombo(option: OptionValue, i: number) {
        return Number.parseInt(this.currentValue) === i+1;
    }
    
}