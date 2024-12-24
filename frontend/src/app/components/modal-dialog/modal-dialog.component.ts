import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'app-modal-dialog',
    templateUrl: "./modal-dialog.component.html",
    styleUrl: "./modal-dialog.component.css"
})
export class ModalDialogComponent {
        
    constructor(public dialogRef: MatDialogRef<ModalDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any){

    }

    clickOnNo() : void{
        this.dialogRef.close(false);
    }

    clickOnYes() : void {
        this.dialogRef.close(true);
    }
}