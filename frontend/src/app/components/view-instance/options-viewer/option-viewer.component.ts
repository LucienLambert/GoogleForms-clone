import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {merge} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { OptionList } from 'src/app/models/optionList';
import {QuestionType} from "../../../models/question";
import {NgModel} from "@angular/forms";

@Component({
    selector: 'app-option-viewer',
    templateUrl: './option-viewer.component.html',
    styleUrl: './option-viewer.component.css'
})
export class OptionViewerComponent {
    @ViewChild('email') email!: NgModel;
    
    @Input() optionList?: OptionList;
    @Input() questionType?: QuestionType;
    @Input() isRequired?: boolean;
    
    @Output() updatedValuesEvent = new EventEmitter<any>();


    protected readonly QuestionType = QuestionType;
    protected currentValue: any;
    constructor() {
    }
    

    onInputChange(value: any) {
        if (this.email.valid)
            console.log("valid : "+ this.email.value);
        this.currentValue = value;
        this.updateValues()
    }
    
    updateValues() {
        this.updatedValuesEvent.emit(this.currentValue);
    }
}