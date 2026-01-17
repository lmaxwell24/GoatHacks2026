import { Stat } from "./stat.js";

class Player {
    constructor(mealplan) {
        this.grades = [];

        this.food = new Stat({ initialValue: 100, hourlyChange: -5 });
        this.water = new Stat({ initialValue: 100, hourlyChange: -7 });
        this.energy = new Stat({ initialValue: 100, hourlyChange: -4, sleepChange: 10 });
        this.rizz = new Stat({ initialValue: 100 });
        this.hygiene = new Stat({ initialValue: 100, hourlyChange: -2 });
        this.sanity = new Stat({ initialValue: 100, hourlyChange: -1 });

        this.stats = [this.food, this.water, this.energy, this.rizz, this.hygiene, this.sanity];

        this.mealplan = mealplan;
    }

    advanceHour = () => this.stats.forEach((stat) => stat.advanceHour);

    advanceDay = () => this.stats.forEach((stat) => stat.advanceDay);

    advanceWeek = () => this.mealplan.resetSwipes();

    advanceSleep = () => this.stats.forEach((stat) => stat.advanceSleep);

    render(ctx) {
      for (let i = 0; i < this.stats.length; i++) {
        this.stats[i].drawBar(ctx, 5, i*10);
      }
    }

    update() {}
}

export { Player };
