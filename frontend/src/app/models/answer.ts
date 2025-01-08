
export class Answer {
    
    instanceId: number;
    questionId: number;
    idx: number;
    value: string;

    constructor(data: any) {
        this.instanceId = data.instanceId;
        this.questionId = data.questionId;
        this.idx = data.idx;
        this.value = data.value;
    }
}