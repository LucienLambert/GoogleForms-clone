import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Form } from '../../../models/form';

@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.css']
})
export class FormCardComponent {
    //objet form récupérer grâce à la vue view-form (parent)
    @Input() form!: Form;

    //renvoie le formulaire sur lequel on à clické grâce à la fonction openForm()
    @Output() openFormEvent = new EventEmitter<Form>();

    //permet à la form-card (enfant) de récupérer le formulaire sur lequel on à clické
    openForm() {
        this.openFormEvent.emit(this.form);
    }
}
