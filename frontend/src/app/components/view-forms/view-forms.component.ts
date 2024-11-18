import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import {RedirectCommand} from "@angular/router";

import { FormService } from '../../services/form.service';
import { Form } from '../../models/form';
import { forEach } from 'lodash-es';

@Component({
    selector: 'app-view-forms',
    templateUrl: './view-forms.component.html',
    styleUrl:'./view-forms.component.css'
})
export class ViewFormsComponent implements OnInit {
    forms: Form[] = []; //Liste des formulaire CurrentUser.
    publicForms: Form[] = [] // Liste des formulaire public.
    allFormsSorted: Form[] = [] // liste de toutes les formulaires à afficher.
    errorMessage: string = ''; // permet de stocket les éventuelles erreurs lors du chargement des objets de la liste.
    user?: User;

    constructor(private authService: AuthenticationService, private router: Router,
        private formService: FormService) {

    }

    ngOnInit() {
        // Vérifier si l'utilisateur est connecté
        if (!this.authService.currentUser) {
            console.log("L'utilisateur n'est pas connecté.");
            this.router.navigate(['/login']);
        } else {
            this.user = this.authService.currentUser;
            console.log("L'utilisateur est bien connecté:", this.user);
        }
        //ajouter une condition pour la suite dans le cas ou 
        //on doit afficher les formulaires public en plus ou si le CurrentUser est un admin ou Guest
        // this.formService.getPublicFoms().subscribe({
        //     next: (data) => {
        //         this.publicForms = data;
        //         console.log(this.publicForms);
        //     }
        // });

        // this.formService.getUserForms().subscribe({
        //     next: (data) => {
        //     this.forms = data;
        //     console.log(this.forms);
        //     },
        //     error: (err) => {
        //     console.error('Erreur lors du chargement des formulaires:', err);
        //     this.errorMessage = 'Impossible de charger les formulaires.';
        //     }
        // });

        this.formService.getPublicFoms().subscribe({
            next: (publicData) => {
                this.publicForms = publicData;

                this.formService.getUserForms().subscribe({
                    next: (userData) => {
                        this.forms = userData;
                        //permet de fusioner les deux tableaux
                        const allForms = [...this.publicForms, ...this.forms]
                        //on supprime les doublons avec comme ref leurs ID
                        const uniqueForms = allForms.filter(
                            (form, index, self) => 
                                index === self.findIndex(f => f.id == form.id)
                        );

                        this.allFormsSorted = uniqueForms.sort((a, b) => 
                            a.title.localeCompare(b.title)
                        );
                        console.log("Formulaires triés et uniques :", this.allFormsSorted);
                    }
                });
            }
        });
    }

    openForm(form: Form){
        if(form != null && (form.owner.id == this.user?.id || this.user?.role == 2)){
            console.log('Formulaire sélectionné:', form);
        } else {
            console.log("Vous n'avez pas les droits pour ouvrir ce formulaire");
        }
    }

    logout() {
        this.authService.logout()
        this.router.navigate(['/login']);
    }
}
