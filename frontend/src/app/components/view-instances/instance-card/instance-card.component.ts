import { Component, EventEmitter, Input, OnInit, Output, output } from "@angular/core";
import { Instance } from "src/app/models/instance";

@Component({
    selector: "app-instance-card",
    templateUrl: "./instance-card.component.html",
    styleUrls: ["./instance-card.component.css"]
})
export class InstanceCardComponent implements OnInit {

    //objet instance récupérer grâce à la vue (parent)
    @Input() instance!: Instance;
    //trigger la fonction del dans le (parent)
    @Output() deleteSelectedEvent = new EventEmitter<Instance>();
    @Output() viewInstanceEvent = new EventEmitter<Instance>();
    
    ngOnInit() {
        console.log(this.instance);
    }

    checkBoxChanged() {
        this.deleteSelectedEvent.emit(this.instance);
    }

    viewInstance(){
        this.viewInstanceEvent.emit(this.instance);
    }
}