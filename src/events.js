import { MathUtil } from "./mathutil.js";

class EventManager {
  constructor(game) {
    this.game = game;
    this.eventsThisWeek = 0;
    this.hadEventThisDay = false;
  }

  onDayStart() {
    this.hadEventThisDay = false;
  }

  onWeekStart() {
    this.eventsThisWeek = 0;
  }

  maybeTriggerRandomEvent() {
    if (this.hadEventThisDay) return;
    if (this.eventsThisWeek >= 2) return;

    if (MathUtil.chance(20)) {
      this.triggerRandomEvent();
    }
  }

  forceThursdayEvent() {
    if (!this.hadEventThisDay && this.eventsThisWeek < 2) {
      this.triggerRandomEvent();
    }
  }

  triggerRandomEvent() {
    const events = [
      "pissFridge",
      "halalBait",
      "fizzNotification",
      "petaJumpscare",
      "sick",
      "date",
      "stomachIssues"
    ];
    const idx = MathUtil.randInt(0, events.length - 1);
    const ev = events[idx];
    this.runEvent(ev);
    this.hadEventThisDay = true;
    this.eventsThisWeek++;
  }

  runEvent(name) {
    const p = this.game.player;

    switch (name) {
      case "pissFridge":
        p.sanity.changeValue(-15);
        break;
      case "halalBait":
        p.sanity.changeValue(-5);
        break;
      case "fizzNotification":
        p.sanity.changeValue(-0.2 * p.sanity.getValue());
        break;
      case "petaJumpscare":
        p.sanity.changeValue(-10);
        break;
      case "sick":
        p.sick = true;
        p.sanity.changeValue(-10);
        break;
      case "date":
        p.rizz.changeValue(15);
        p.sanity.changeValue(10);
        break;
      case "stomachIssues":
        p.sanity.changeValue(-10);
        p.hygiene.changeValue(-20);
        break;
    }
  }
}

export { EventManager };
