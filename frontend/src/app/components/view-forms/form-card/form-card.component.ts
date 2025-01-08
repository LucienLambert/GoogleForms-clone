import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Form} from '../../../models/form';
import {Role, User} from '../../../models/user';
import {AuthenticationService} from '../../../services/authentication.service';
import {MatDialog} from "@angular/material/dialog";
import {ModalDialogComponent} from "../../modal-dialog/modal-dialog.component";


@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.css']
})
export class FormCardComponent {
    //objet form récupérer grâce à la vue view-form (parent)
    @Input() form!: Form;
    @Input() isManageButtonVisible: boolean = false;
    user?: User;

    //renvoie le formulaire sur lequel on à clické grâce à la fonction openForm() ou manageForm()
    @Output() openFormEvent = new EventEmitter<Form>();
    @Output() manageFormEvent = new EventEmitter<Form>();


    constructor(private authService: AuthenticationService, private modalDialog: MatDialog) {

    }
    
    ngOnInit(){
      this.user = this.authService.currentUser;
    }

    //permet à la form-card (enfant) de récupérer le formulaire sur lequel on à clické
    async openForm() {

        if (this.user?.role != Role.Guest && this.form.listInstance.length > 0) {
            if (this.form.listInstance[0].completed) {
                const openResponse = await this.modalDialogOpenInstance();
                switch(openResponse){
                    case 0 :
                        break;
                    case 1 :
                        this.openFormEvent.emit(this.form);
                        break;
                    case 2 :
                        // Removing the list of instances to imply we want a fresh one
                        this.form.listInstance.length = 0;
                        this.openFormEvent.emit(this.form);
                }
            } else {
                this.openFormEvent.emit(this.form);    
            }
        } else {
            this.openFormEvent.emit(this.form);
        }
    }

    private async modalDialogOpenInstance() {
        return new Promise<number>((resolve) => {
            const modal =  this.modalDialog.open(ModalDialogComponent, {
                disableClose: true,
                data : {
                    title: 'Open Form',
                    message: "You have already answered this form. What do you want to do?",
                    context : 'openInstance'
                },
            });
            modal.afterClosed().subscribe(result => {
                resolve(result);
            });
        });
    }
    manageForm() {
      this.manageFormEvent.emit(this.form);
    }
}
