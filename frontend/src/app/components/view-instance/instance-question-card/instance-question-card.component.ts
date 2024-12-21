import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {Question, QuestionType} from '../../../models/question';
import {FormControl, Validators} from "@angular/forms";
import {merge} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-instance-question-card',
  templateUrl: './instance-question-card.component.html',
  styleUrl: './instance-question-card.component.css'
})
export class InstanceQuestionCardComponent {
  
  @Input() question?: Question;


  constructor() {

  }
  
  // receive value from the child (options-viewer)
  public receiveValue($event : any){
    console.log($event);    
  }


  protected readonly QuestionType = QuestionType;
}
