class TimeManager {
  constructor(game) {
    this.game = game;
    this.hour = 8;   // 0–23
    this.day = 1;    // 1–5
    this.week = 1;   // 1–7
    this.hoursAwake = 0;
  }

  isNight() {
    return this.hour >= 22 || this.hour < 6;
  }

  advance(hours) {
    for (let i = 0; i < hours; i++) {
      this.tickHour();
    }
  }

  tickHour() {
    this.hour++;
    this.hoursAwake++;

    this.game.player.advanceHour();
    this.game.onHourPassed();

    if (this.hour >= 24) {
      this.hour = 0;
      this.day++;
      this.game.player.advanceDay();
      this.game.onDayPassed();
    }

    if (this.day > 5) {
      this.day = 1;
      this.week++;
      this.game.onWeekPassed();
    }
  }
}

export { TimeManager };
