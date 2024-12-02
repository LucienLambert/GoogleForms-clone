import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import {RedirectCommand} from "@angular/router";

import { FormService } from '../../services/form.service';
import { Form } from '../../models/form';
import { FormCardComponent } from './form-card/form-card.component';

@Component({
    selector: 'app-view-forms',
    templateUrl: './view-forms.component.html',
    styleUrl:'./view-forms.component.css'
})
export class ViewFormsComponent implements OnInit {
    forms: Form[] = []; //Liste des formulaire CurrentUser.
    filteredForms: Form[] = [];
    errorMessage: string = ''; // permet de stocket les éventuelles erreurs lors du chargement des objets de la liste.
    user?: User;

    constructor(private authService: AuthenticationService, private router: Router,
        private formService: FormService) {

    }

    ngOnInit() {
        if(this.authentification()) {
            if(this.user?.role == 2) {
                console.log("Admin");
                this.getAllForm();
            }else {
                console.log("user or guest");
                this.getOwnerPublicAccessForm();
            }
        }
    }

    authentification() {
        if (!this.authService.currentUser) {
            console.log("L'utilisateur n'est pas connecté.");
            this.router.navigate(['/login']);
            return false;
        } else {
            this.user = this.authService.currentUser;
            console.log("L'utilisateur est bien connecté:", this.user);
            return true;
        }
    }

    getAllForm(){
        this.formService.getAllForm().subscribe({
            next: (data) => {
                this.forms = data;
                this.filteredForms = data;
            },
            error: (err) => {
            this.errorMessage = "Erreur de récupération des formulaires.";
            }
        });
    }

    getOwnerPublicAccessForm(){
        this.formService.getOwnerPublicAccessForm().subscribe({
            next: (data) => {
                this.forms = data;
                this.filteredForms = data;
            },
            error: (err) => {
            this.errorMessage = "Erreur de récupération des formulaires.";
            }
        });
    }

    filterForms(searchText: string) {
        const lowerSearchText = searchText.toLowerCase();
        this.filteredForms = this.forms.filter((form) =>
            form.title.toLowerCase().includes(lowerSearchText)
        );
    }

    openForm(form: Form){
        if(form != null && (form.owner.id == this.user?.id || this.user?.role == 2)){
            console.log('Formulaire sélectionné:', form);
            this.router.navigate(['view-instance', form.id]);
        } else {
            console.log("Vous n'avez pas les droits pour ouvrir ce formulaire");
        }
    }

    logout() {
        this.authService.logout()
        this.router.navigate(['/login']);
    }
}
