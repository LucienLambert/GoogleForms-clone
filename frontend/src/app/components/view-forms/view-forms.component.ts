import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import {RedirectCommand} from "@angular/router";

import { FormService } from '../../services/form.service';
import { Form } from '../../models/form';

@Component({
    selector: 'app-view-forms',
    templateUrl: './view-forms.component.html',
})
export class View_forms implements OnInit {
    forms: Form[] = []; //Liste des formulaire à afficher
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

    this.formService.getUserForms().subscribe({
        next: (data) => {
          this.forms = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des formulaires:', err);
          this.errorMessage = 'Impossible de charger les formulaires.';
        }
    });
    }

    logout() {
        this.authService.logout()
        this.router.navigate(['/login']);
    }
}
