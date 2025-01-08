import {Answer} from "./answer";
import {Form} from "./form";

export class Instance {

    id: number;
    started: Date;
    completed?: Date;

    form: Form = new Form({})

    owner: {
        id: number;
        email: string;
        firstName?: string;
        lastName?: string;
    };

    listAnswers: Answer[];
    
    constructor(data: any) {
        console.log("voici les datas:",data);
        this.id = data.id;
        this.started = data.started;
        this.completed = data.completed;
        this.form = data.form;
        this.owner = data.owner;
        this.listAnswers = data.listAnswers ? data.listAnswers.map((a : Answer) => new Answer(a)) : [];
    }
}