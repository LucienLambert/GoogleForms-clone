import { Component, OnInit } from '@angular/core';
import { Form } from '../../models/form';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute ,Router } from '@angular/router';
import { FormService } from 'src/app/services/form.service';
import { Question } from 'src/app/models/question';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { User } from 'src/app/models/user';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

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
    isEditVisible: boolean = true;
    isAnalyseVisible: boolean = true;
    delFormButton : boolean = true;
    previousUrl: string | null = null;

    constructor(private authService: AuthenticationService, private router: Router,
        private formService: FormService, private route: ActivatedRoute, private modalDialog : MatDialog) {

        this.user = this.authService.currentUser;
        
    }
    
    ngOnInit() {
        this.getOnFormManager();
        const state = history.state;
        this.previousUrl = state?.previousUrl ?? '/home';
        console.log(this.previousUrl)
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
        });
    }

    async toggleIsPublic(event : MatSlideToggleChange) {
        const previousState = this.form!.isPublic;

        const canChange = await this.modalDialogIsPublicForm(this.form!.isPublic);

        if(canChange){
            this.formService.isPublicFormChange(this.form!.id).subscribe({
                next : () => {
                    console.log("Form status updated successfully");
                    this.form!.isPublic =  !previousState;
                },
                error : (err) => {
                    console.log("Erreur lors du changement de statut : ", err);
                    this.form!.isPublic = previousState;
                    event.source.checked = previousState;
                }
            })
        } else {
            // Si annulé, réinitialiser visuellement le toggle
            event.source.checked = previousState; // Rétablit l'état visuel
            console.log("L'utilisateur a annulé le changement");
        } 
    }

    moveDown(question: Question) {
        this.formService.moveDownQuestion(this.form!.id, question.id).subscribe({
            next : (reponse) => {
                // faire également la modification coté frontend pour éviter de recharger la page. 
                this.getOnFormManager();
            },
            error : (err) => {
                console.log("Erreur lors du déplacement : " + err);
            }
        });
    }

    moveUp(question: Question) {
        this.formService.moveUpQuestion(this.form!.id, question.id).subscribe({
            next : (reponse) => {
                this.getOnFormManager();
            },
            error : (err) => {
                console.log("Erreur lors du déplacement : " + err);
            }
        });
    }
    
    //faire un redirect vers le component Edit_question
    editQuestion(editQuestion: Question) {
        this.router.navigate(['/create-edit-question'], {
            state: { question: editQuestion, previousUrl: this.router.url}
        });
    }

    //faire un redirect vers le component create-edite-question
    addQuestion(){
        this.router.navigate(['create-edit-question'], {
            state: { form: this.form, previousUrl: this.router.url }
        });
    }
    
    editForm() {
        this.router.navigate(['create-edit-form/', this.form!.id]);
    }

    analyse() {
        this.router.navigate(['analyse/', this.form!.id]);
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

    modalDialogIsPublicForm(newValue : boolean) : Promise<boolean> {
        return new Promise<boolean>((resolve) => {

            const title = newValue ? 'Make Form Public' : 'Make Form Private';

            const message = newValue 
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

    modalDelForm () : Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const modal = this.modalDialog.open(ModalDialogComponent, {
                data : {
                    title : 'Delete Form',
                    message : "Are you sure you want to delete this form ?",
                    context : 'editForm'
                }
            })

            modal.afterClosed().subscribe( resutl => {
                resolve(resutl);
            })
        });
    }

    async delForm() {
        const idform = this.form!.id;
        const canDelForm = await this.modalDelForm();
        if(canDelForm){
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
}