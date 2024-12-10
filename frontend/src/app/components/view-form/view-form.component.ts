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
    listQuestion? : Question [];
    backButtonVisible: boolean = true;

    constructor(private authService: AuthenticationService, private router: Router,
        private formService: FormService, private route: ActivatedRoute) {

    }
    
    ngOnInit() {
        const formId = Number(this.route.snapshot.paramMap.get('id'));

        this.formService.getFormWithQuestions(formId).subscribe({
            next : (data ) => {
                this.form = data;
                console.log(this.form);
            }
        })
        
    }

    //gestion du toggle isPublic du form.
    toggleIsPublic(): void {
        if (this.form) {
          this.form.isPublic = !this.form.isPublic;
          console.log("form.isPublic : " + this.form.isPublic);
          //sauvegarder le changement d'état du isPublic ici
        }
    }
}