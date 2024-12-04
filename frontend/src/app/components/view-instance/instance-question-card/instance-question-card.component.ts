import {Component, EventEmitter, Input, input, Output, signal} from '@angular/core';
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
    merge(this.email.statusChanges, this.email.valueChanges)
        .pipe(takeUntilDestroyed())
        .subscribe(() => this.updateErrorMessage());
  }
  
  

  readonly email = new FormControl('', [Validators.required, Validators.email]);

  errorMessage = signal('');
  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (this.email.hasError('email')) {
      this.errorMessage.set('Not a valid email');
    } else {
      this.errorMessage.set('');
    }
  }
  protected readonly QuestionType = QuestionType;
}
