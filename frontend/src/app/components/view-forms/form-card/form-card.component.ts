import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Form } from '../../../models/form';
import { User } from '../../../models/user';
import { AuthenticationService } from '../../../services/authentication.service';


@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.css']
})
export class FormCardComponent {
    //objet form récupérer grâce à la vue view-form (parent)
    @Input() form!: Form;
    user?: User;

    //renvoie le formulaire sur lequel on à clické grâce à la fonction openForm() ou manageForm()
    @Output() openFormEvent = new EventEmitter<Form>();
    @Output() manageFormEvent = new EventEmitter<Form>();

    constructor(private authService: AuthenticationService) {

    }
    
    ngOnInit(){
      this.user = this.authService.currentUser;
      //console.log(this.form.listUserFormAccess);
    }

    //permet à la form-card (enfant) de récupérer le formulaire sur lequel on à clické
    openForm() {
        this.openFormEvent.emit(this.form);
    }

    manageForm() {
      this.manageFormEvent.emit(this.form);
    }
}
