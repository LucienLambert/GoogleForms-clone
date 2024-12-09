import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { Form } from '../../models/form';
import { forEach } from 'lodash-es';

@Component({
    selector: 'app-view-forms',
    templateUrl: './view-forms.component.html',
    styleUrl:'./view-forms.component.css'
})
export class ViewFormsComponent implements OnInit {
    forms: Form[] = [];
    filteredForms: Form[] = [];
    errorMessage: string = '';
    user?: User;

    isSaveVisible: boolean = false;
    isSearchVisible: boolean = true;
    isAddVisible: boolean = true;

    constructor(private authService: AuthenticationService, private router: Router,
        private formService: FormService) {

    }

    ngOnInit() {
        if(this.authentification()) {
            console.log(this.user);
            if(this.user?.role == 2) {
                this.getAllForm();
            }else {
                this.getOwnerPublicAccessForm();
            }
        }
    }

    authentification() {
        if (!this.authService.currentUser) {
            this.router.navigate(['/login']);
            return false;
        } else {
            this.user = this.authService.currentUser;
            return true;
        }
    }

    getAllForm(){
        this.formService.getAllForm().subscribe({
            next: (data) => {
                this.forms = data;
                this.filteredForms = data;
                console.log(this.forms);
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
                console.log(this.forms);
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

    // Le bouton "Open" ne doit pas être visible si le formulaire ne contient pas de questions.
    openForm(form: Form){
        if(form != null && (form.owner.id == this.user?.id || this.user?.role != 0 ||form.isPublic != true)){
            console.log('Formulaire sélectionné:', form);
            this.router.navigate(['view-instance', form.id]);
        } else {
            console.log("Vous n'avez pas les droits pour ouvrir ce formulaire");
        }
    }

    /*Le bouton "Manage" permet d'ouvrir le formulaire en tant qu'éditeur,
    en vue d'en modifier la définition et les questions. Ce bouton n'est 
    visible que si l'utilisateur a accès au formulaire en mode d'édition */
    manageForm(form: Form){
        console.log('Formulaire sélectionné:', form);
            this.router.navigate(['view-form', form.id]);
    }

    handleSearch(term: string) {
        if (term.trim() === '') {
            // Reset to show all forms
            this.filteredForms = this.forms;
        } else {
            // Filter forms based on the search term
            this.filteredForms = this.forms.filter(form =>
                form.title.toLowerCase().includes(term.toLowerCase()) ||
                form.description!.toLowerCase().includes(term.toLowerCase()) ||
                form.owner?.firstName!.toLowerCase().includes(term.toLowerCase()) ||
                form.owner?.lastName!.toLowerCase().includes(term.toLowerCase())
            );
        }
    }
}
