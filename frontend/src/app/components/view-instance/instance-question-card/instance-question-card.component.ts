import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {Question, QuestionType} from '../../../models/question';
import {merge} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Answer} from "../../../models/answer";

@Component({
  selector: 'app-instance-question-card',
  templateUrl: './instance-question-card.component.html',
  styleUrl: './instance-question-card.component.css'
})
export class InstanceQuestionCardComponent {
  
  @Input() question?: Question;
  @Input() questionType?: QuestionType;
  @Input() answers?: Answer[];
  @Input() isCompleted: boolean=false;
  


  @Output() updatedValuesEvent = new EventEmitter<any>();

  constructor() {

  }
  
  // receive value from the child (options-viewer)
  public receiveValue($event : any){
    this.updatedValuesEvent.emit($event);
  }
  
}
