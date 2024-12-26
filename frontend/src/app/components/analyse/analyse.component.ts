import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-analyse',
    templateUrl: './analyse.component.html',
    styleUrls: ['./analyse.component.css']
})
export class AnalyseComponent implements OnInit {
    questions = [
        { id: 1, text: 'What is your favorite color?' },
        { id: 2, text: 'How often do you exercise?' },
        { id: 3, text: 'Do you like Angular?' }
    ];

    selectedQuestion: number | null = null;
    statistics: { answer: string; count: number; ratio: number }[] = [];

    ngOnInit(): void {
        // Default statistics for the first question
        if (this.questions.length > 0) {
            this.selectedQuestion = this.questions[0].id;
            this.loadStatistics(this.selectedQuestion);
        }
    }

    onQuestionChange(): void {
        if (this.selectedQuestion !== null) {
            this.loadStatistics(this.selectedQuestion);
        }
    }

    loadStatistics(questionId: number): void {
        // Replace this mock data with actual API calls to fetch statistics
        if (questionId === 1) {
            this.statistics = [
                { answer: 'Red', count: 10, ratio: 0.4 },
                { answer: 'Blue', count: 15, ratio: 0.6 }
            ];
        } else if (questionId === 2) {
            this.statistics = [
                { answer: 'Daily', count: 20, ratio: 0.5 },
                { answer: 'Weekly', count: 15, ratio: 0.375 },
                { answer: 'Rarely', count: 5, ratio: 0.125 }
            ];
        } else if (questionId === 3) {
            this.statistics = [
                { answer: 'Yes', count: 25, ratio: 0.833 },
                { answer: 'No', count: 5, ratio: 0.167 }
            ];
        }
    }
}
