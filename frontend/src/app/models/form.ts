
import { Instance } from "./instance";
import { User } from "./user";
import { Question } from "./question";


export class Form {
    id: number;
    title: string;
    description?: string | null;
    isPublic: boolean;
    ownerId: number;
    owner: User;
    lastInstance: Instance;
    listQuestion: Question [];



    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.owner = data.owner;
        this.ownerId = data.ownerId;
        this.isPublic = data.isPublic;
        this.lastInstance = data.lastInstance;
        this.listQuestion = data.listQuestions ? data.listQuestions.map( (q: Question) => new Question(q)) : [];
    }
}