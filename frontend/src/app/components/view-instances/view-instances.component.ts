import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Form } from "src/app/models/form";
import { Instance } from "src/app/models/instance";
import { AuthenticationService } from "src/app/services/authentication.service";
import { FormService } from "src/app/services/form.service";
import { InstanceService } from "src/app/services/instance.service";
import { ModalDialogComponent } from "../modal-dialog/modal-dialog.component";

@Component({
    selector: "app-view-instances",
    templateUrl: "./view-instances.component.html",
    styleUrls: ["./view-instances.component.css"]
})
export class ViewInstancesComponent implements OnInit {
    
    navBarTitle = '';
    backButtonVisible = true;
    form? : Form;
    selectedInstances: Instance[] = [];

    constructor(private authService: AuthenticationService, private router: Router,
        private route: ActivatedRoute, private modalDialog : MatDialog, private formService : FormService,
        private instanceService : InstanceService) {
        
    }

    ngOnInit() {
        this.initializeForm();
        
    }

    initializeForm(){
        const formId = Number(this.route.snapshot.paramMap.get('id'));
        this.formService.getAllInstancesCompletedByFormId(formId).subscribe({
            next : (data) => {
                this.form = data;
                this.navBarTitle = this.form?.title;
                console.log(this.form);
            }
        });
    }

    onInstanceSelectionChange(instance : Instance){
        if(!this.selectedInstances.includes(instance)) {
            this.selectedInstances.push(instance);
        } else {
            this.selectedInstances = this.selectedInstances.filter(i => i != instance);
        }
        console.log(this.selectedInstances);
    }

    deleteSelected() {
        console.log("deleleSelected");
        const selectedInstancesId = this.selectedInstances.map(i => i.id);
        this.instanceService.delMultiInstanceById(selectedInstancesId).subscribe({
            next : (data) => {
                if(data) {
                    this.selectedInstances = [];
                    this.ngOnInit();
                }  
            }
        });
    }

    async deleteAll(){
        const canDel = await this.modalDialogDelInstances();
        if(canDel){
            this.instanceService.delInstancesCompletedByFormId(this.form!.id).subscribe({
                next : (data) => {
                    if(data){
                        console.log("deleteAll" + this.form?.listInstance);
                        this.ngOnInit();
                    }
                }
            })
        } else {
            console.log("canDel == false : deleteAll");
        }
    }

    modalDialogDelInstances() : Promise<boolean>  {
        return new Promise<boolean>((resolve) => {

            const modal = this.modalDialog.open(ModalDialogComponent, {
                disableClose: true,
                data : {
                    title: 'Delete Instances',
                    message: "Please confirm you want to delete all instances of this form.",
                    context : 'editForm'
                }, 
            });

            modal.afterClosed().subscribe(result => {
                resolve(result);
            });
        }); 
    }

    viewInstance(instance : Instance) {
        this.router.navigate(['view-instance/', instance.id]);
    }
}