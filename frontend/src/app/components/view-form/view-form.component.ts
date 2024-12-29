import { Component, OnInit } from '@angular/core';
import { Form } from '../../models/form';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute ,Router } from '@angular/router';
import { FormService } from 'src/app/services/form.service';
import { Question } from 'src/app/models/question';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-view-form',
    templateUrl: "./view-form.component.html",
    styleUrl: "./view-form.component.css"
})
export class ViewFormComponent implements OnInit {
    form?: Form;
    listQuestion : Question [] = [];
    user?: User;
    instanceInProgress : boolean = false;
    backButtonVisible: boolean = true;
    delFormButton : boolean = true;

    constructor(private authService: AuthenticationService, private router: Router,
        private formService: FormService, private route: ActivatedRoute, private modalDialog : MatDialog) {

        this.user = this.authService.currentUser;

    }
    
    ngOnInit() {
        this.getOnFormManager();
    }

    getOnFormManager(){
        const formId = Number(this.route.snapshot.paramMap.get('id'));
        this.formService.GetOneFormManager(formId).subscribe({
            next : (data ) => {
                this.form = data;
                this.listQuestion = data.listQuestion;
                if (this.form?.listInstance[0] != null) {
                    this.modalDialogIntanceStatus();
                    this.instanceInProgress = true;
                } else {
                    this.instanceInProgress = false;
                }
            }
        })
    }

    //gestion du toggle isPublic du form.
    async toggleIsPublic() {
        const canEditIsPublic = await this.modalDialogIsPublicForm();
        if (canEditIsPublic) {
          this.form!.isPublic = !this.form?.isPublic;
        }
    }

    moveDown(question: Question) {
        console.log("moveDown : " + question);

    }

    moveUp(question: Question) {
        console.log("moveUp : " + question);
        this.formService.moveUpQuestion(this.form!.id, question.id).subscribe({
            next : (reponse) => {
                console.log("déplacement Up réussie : " + reponse);
                this.getOnFormManager();
            },
            error : (err) => {
                console.log("Erreur lors du déplacement : " + err);
            }
        });
    }
    
    //faire un redirect vers le component Edit_question
    editQuestion(question: Question) {
        console.log("edit : " + question);
    }

    //faire un redirect vers le component Add_question
    addQuestion(){
        console.log("add question")
    }

    //requête Async donc obligé d'écouter la réponse pour éviter les erreurs et attendre la réponse de la requête 
    //pour faire le  refresh d'interface si pas d'erreur.
    async delQuestion(question: Question) {
        const canDel = await this.modalDialogDelQuestion(question);
        if(canDel){
            this.formService.DelQuestionFormById(this.form!.id, question.id).subscribe({
                next : (reponse) => {
                    console.log("suppresion réussie : " + reponse);
                    this.getOnFormManager();
                },
                error : (err) => {
                    console.log("Erreur lors de la suppression : " + err);
                }
            });
        }else {
            console.log("No Question To del");
        }
    }

    modalDialogIntanceStatus() : void {
        this.modalDialog.open(ModalDialogComponent, {
            disableClose: true,
            data : {
                title: 'Information',
                message: 'There are already answers for this form. You can only delete this form or manage sharing.',
                context : 'instanceInProgress'
            }, 
        });
    }

    modalDialogDelQuestion(question: Question) : Promise<boolean>  {
        return new Promise<boolean>((resolve) => {

            const modal = this.modalDialog.open(ModalDialogComponent, {
                disableClose: true,
                data : {
                    title: 'Delete Question',
                    message: "Are you sure you want to delete this question: " + question.title,
                    context : 'editForm'
                }, 
            });

            modal.afterClosed().subscribe(result => {
                resolve(result);
            });
        }); 
    }
    //TODO
    modalDialogIsPublicForm() : Promise<boolean> {
        return new Promise<boolean>((resolve) => {

            const title = this.form?.isPublic ? 'Make Form Public' : 'Make Form Private';

            const message = this.form?.isPublic 
            ? "Are you sure you want to make this form private? You will need to shared this form again to allow 'User' access to other users."
            : "Are you sure you want to make this form public? This will delete all existing shared with 'User' access to this form.";

            const modal = this.modalDialog.open(ModalDialogComponent, {
                disableClose: true,
                data : {
                    title: title,
                    message: message,
                    context : 'editForm'
                }, 
            });

            modal.afterClosed().subscribe(result => {
                resolve(result);
            });
        }); 
    }

    delForm() {
        const idform = this.form!.id;
        this.formService.delFormById(idform).subscribe({
            next : (data) => {
                console.log("del form : " +data);
                this.router.navigate(['/home']);
            },
            error : (err) => {
                console.log("Erreur lors de la suppression : " + err);
            }
        });
    }
}