import { Instance } from "./instance";
import { User } from "./user";
import { Question } from "./question";

export class Form {
    id: number;
    title: string;
    description?: string | null; //dans le cas ou la description peut-être null
    isPublic: boolean;
    owner: User;
    lastInstance: Instance;
    listQuestion: Question [];


    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.owner = data.owner;
        this.isPublic = data.isPublic;
        this.lastInstance = data.lastInstance;
        this.listQuestion = data.ListQuestions ? data.ListQuestions.map( (q: Question) => new Question(q)) : [];
    }
}