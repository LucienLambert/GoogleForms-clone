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
    @Input() totalQuestion!: number;
    

    @Output() moveDownEvent = new EventEmitter<Question>();
    @Output() moveUpEvent = new EventEmitter<Question>();
    @Output() editQuestionEvent = new EventEmitter<Question>();
    @Output() delQuestionEvent = new EventEmitter<Question>();


    constructor(private authService: AuthenticationService) {

    }

    ngOnInit(){
        console.log("total Question = " + this.totalQuestion);
    }

    moveDown(question: Question) {
        this.moveDownEvent.emit(question);
    }

    moveUp(question: Question) {
        this.moveUpEvent.emit(question);
    }

    editQuestion(question: Question) {
        this.editQuestionEvent.emit(question);
    }

    delQuestion(question: Question) {
        this.delQuestionEvent.emit(question);
    }
}