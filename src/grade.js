class Grade {
    constructor(value, className) {
        this.value = value;
        this.className = className;
    }

    getLetterGrade() {
        if (this.value >= 90) return 'A';
        if (this.value >= 80) return 'B';
        if (this.value >= 70) return 'C';
        return "NR";
    }

    isPassing() {
        return this.value >= 70;
    }

    isFailing() {
        return this.value < 70;
    }
}