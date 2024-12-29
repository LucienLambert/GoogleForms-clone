import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Question } from "src/app/models/question";
import { AuthenticationService } from "src/app/services/authentication.service";

@Component({
    selector: 'app-form-question-card',
    templateUrl: './form-question-card.component.html',
    styleUrls: ['./form-question-card.component.css']
})
export class FormQuestionCardComponent {
    @Input() question!: Question;
    //stock l'index de la question de la listQuestion du form
    @Input() indexQuestion?: number;
    //stock la taille de la listQuestion - 1
    @Input() sizeListQuestion?: number;
    @Input() instanceInProgress!: boolean;
    

    @Output() moveDownEvent = new EventEmitter<Question>();
    @Output() moveUpEvent = new EventEmitter<Question>();
    @Output() editQuestionEvent = new EventEmitter<Question>();
    @Output() delQuestionEvent = new EventEmitter<Question>();


    constructor(private authService: AuthenticationService) {
        
    }

    ngOnInit(){
        console.log("IndexQuetion = "+this.indexQuestion +"\nsizeListQuestion = "+this.sizeListQuestion + "\nIdx = " +this.question?.idx);
    }

    moveDown() {
        this.moveDownEvent.emit(this.question);
    }

    moveUp() {
        this.moveUpEvent.emit(this.question);
    }

    editQuestion() {
        this.editQuestionEvent.emit(this.question);
    }

    delQuestion() {
        this.delQuestionEvent.emit(this.question);
    }
}