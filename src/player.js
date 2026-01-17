import { Stat } from "./stat.js";

class Player {
    constructor() {
        this.grades = [];

        this.food = new Stat(initialValue = 100, hourlyChange = -5);
        this.water = new Stat(initialValue = 100, hourlyChange = -7);
        this.energy = new Stat(initialValue = 100, hourlyChange = -4, sleepChange = 10);
        this.rizz = new Stat(initialValue = 100);
        this.hygiene = new Stat(initialValue = 100, hourlyChange = -2);
        this.sanity = new Stat(initialValue = 100, hourlyChange = -1);

        this.stats = [this.food, this.water, this.energy, this.rizz, this.hygiene, this.sanity];
    }

    advanceHour = () => this.stats.forEach((stat) => stat.advanceHour);

    advanceDay = () => this.stats.forEach((stat) => stat.advanceDay);

    advanceSleep = () => this.stats.forEach((stat) => stat.advanceSleep);
}

export { Player };
