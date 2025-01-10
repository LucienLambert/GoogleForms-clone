import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {Location} from '@angular/common';
import { AuthenticationService } from 'src/app/services/authentication.service';
import {ModalDialogComponent} from "../modal-dialog/modal-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
    @Output() searchEvent = new EventEmitter<string>(); 
    @Output() saveEvent = new EventEmitter<void>();
    @Output() editEvent = new EventEmitter<void>();
    @Output() AnalyseEvent = new EventEmitter<void>();
    @Output() delFormEvent = new EventEmitter<void>();
    @Output() backButtonEvent = new EventEmitter<void>();

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    @Input() title?: string;
    @Input() searchVisible: boolean = false;
    @Input() isSaveVisible: boolean = false;
    @Input() isSearchVisible: boolean = false;
    @Input() isAddVisible: boolean = false;
    @Input() backButtonVisible: boolean = false;
    @Input() saveDisabled: boolean = true;
    @Input() isAnalyseVisible: boolean = false;
    @Input() isEditVisible: boolean = false;
    @Input() isOptionListVisible: boolean = false;
    @Input() hasUnsavedChanges: boolean = false;
    @Input() delFormVisible: boolean = false;
    @Input() previousUrl: string | null = null;


    constructor(private router: Router, private _location: Location, private authService : AuthenticationService, 
                private modalDialog : MatDialog) {
    }

    toggleSearch() {
        if (this.searchVisible) {
            this.searchEvent.emit('');
            if (this.searchInput) {
                this.searchInput.nativeElement.value = '';
            }
        }
        this.searchVisible = !this.searchVisible;
    }

    onSearchChange(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        this.searchEvent.emit(inputElement.value);
    }
    
    createForm() {
        this.router.navigate(['create-edit-form']);
    }

    editForm() {
        this.editEvent.emit();
    }
    
    onSave() {
        this.saveEvent.emit();
    }

    backClicked() {
        if (this.hasUnsavedChanges) {
            this.showModalDialog();
        } else {
            this.backButtonEvent.emit();
            if(this.previousUrl){
                ///ce base sur le chemin précisé
                this.router.navigate([this.previousUrl]);
            } else {
                //ce base sur l'historique de naviagation
                this._location.back();
            }
        }
    }
    
    private showModalDialog() {
        const dialogRef = this.modalDialog.open(ModalDialogComponent, {
            disableClose: true,
            data: {
                title: 'Unsaved Changes',
                message: 'You have unsaved changes. Are you sure you want to leave?',
                context : 'editForm'
            }
        });
        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) { this.saveEvent.emit(); }
            this._location.back();
        });
    }

    logout(){
        this.authService.logout();
        this.router.navigate(['']);
    }
    
    analyse() {
        this.AnalyseEvent.emit();
    }

    delForm(){
        this.delFormEvent.emit();
    }
}
