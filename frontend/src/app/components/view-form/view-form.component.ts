import { Component, OnInit } from '@angular/core';
import { Form } from '../../models/form';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute ,Router } from '@angular/router';
import { FormService } from 'src/app/services/form.service';
import { Question } from 'src/app/models/question';

@Component({
    selector: 'app-view-form',
    templateUrl: "./view-form.component.html",
    styleUrl: "./view-form.component.css"
})
export class ViewFormComponent implements OnInit {
    form?: Form;
    listQuestion : Question [] = [];
    backButtonVisible: boolean = true;

    constructor(private authService: AuthenticationService, private router: Router,
        private formService: FormService, private route: ActivatedRoute) {

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
                console.log(this.form.listQuestion);
            }
        })
    }

    //gestion du toggle isPublic du form.
    toggleIsPublic(): void {
        if (this.form) {
          this.form.isPublic = !this.form.isPublic;
          ///console.log("form.isPublic : " + this.form.isPublic);
          //sauvegarder le changement d'état du isPublic ici
        }
    }

    moveDown(question: Question) {
        console.log("moveDown : " + question);
    }

    moveUp(question: Question) {
        console.log("moveUp : " + question);
    }
    
    //faire un redirect vers le component Edit_question
    editQuestion(question: Question) {
        console.log("edit : " + question);
    }

    //faire un redirect vers le component Add_question
    addQuestion(){
        console.log("add question")
    }

    //requête Async donc obligé d'écouter la réponse pour évité les erreurs de le refresh d'interface si erreur.
    delQuestion(question: Question) {
        if(question != null){
            //console.log("del question : " + this.form!.id + " : " + question.id);
            this.formService.DelQuestionFormById(this.form!.id, question.id).subscribe({
                next : (reponse) => {
                    console.log("suppresion réussie : " + reponse);
                    //refresh interface si pas d'erreur
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
}