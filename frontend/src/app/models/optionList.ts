import {User} from "./user";
import {OptionValue} from "./optionValue";
import {Question} from "./question";

export class OptionList {

    id: number;
    name: string;
    owner?: User;
    listOptionValues?: OptionValue[];

    constructor(data:any) {
        this.id = data.id;
        this.name = data.name;
        this.owner = data.owner;
        if (data.listOptionValues) {
            this.listOptionValues = data.listOptionValues.map((value: any) => new OptionValue(value));
        }
    }
}