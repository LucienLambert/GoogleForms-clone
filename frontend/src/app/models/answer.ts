
export class Answer {
    
    instanceId: number;
    questionId: number;
    index: number;
    value: string;

    constructor(data: any) {
        this.instanceId = data.instanceId;
        this.questionId = data.questionId;
        this.index = data.idx;
        this.value = data.value;
    }
}