import {Answer} from "./answer";

export class Instance {

    id: number;
    started: Date;
    completed?: Date;

    form: {
        id: number;
        title: string;
        description: string;
        ownerId: number;
    };

    owner: {
        id: number;
        email: string;
        firstName?: string;
        lastName?: string;
    };

    listAnswers: Answer[];
    
    constructor(data: any) {
        this.id = data.id;
        this.started = data.started;
        this.completed = data.completed;
        this.form= data.form;
        this.owner = data.owner;
        this.listAnswers = data.listAnswers ? data.listAnswers.map((a : Answer) => new Answer(a)) : [];
    }
}