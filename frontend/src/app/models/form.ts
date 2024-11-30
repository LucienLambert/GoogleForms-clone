import { Question } from './question';
export class Form {
    id: number;
    title: string;
    description?: string | null;
    isPublic: boolean;
    owner: {
        id: number;
        email: string;
        firstName?: string;
        lastName?: string;
    };
    questions: Question[];

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.owner = data.owner;
        this.isPublic = data.isPublic;
        
        this.questions = data.listQuestions ? data.listQuestions.map( (q: Question) => new Question(q)) : [];
    }
}