import { Stat } from "./stat.js";
import { MathUtil } from "./mathutil.js";

class Player {
  constructor(game) {
    this.game = game;

    this.food = new Stat({ initialValue: 100, hourlyChange: -5 });
    this.water = new Stat({ initialValue: 100, hourlyChange: -7 });
    this.sleep = new Stat({ initialValue: 100, hourlyChange: -4 });
    this.sanity = new Stat({ initialValue: 100, hourlyChange: -1 });
    this.hygiene = new Stat({ initialValue: 100, hourlyChange: -2 });
    this.rizz = new Stat({ initialValue: 50, hourlyChange: 0 });

    this.grades = [
      new Stat({ initialValue: 80, dailyChange: -1 }),
      new Stat({ initialValue: 80, dailyChange: -1 }),
      new Stat({ initialValue: 80, dailyChange: -1 })
    ];

    // Meal plan system - Easy: 15 special swipes a week
    this.mealPlan = {
      difficulty: "easy",
      normal: 0,
      special: 15,
      normalMax: 0,
      specialMax: 15
    };

    this.isSleeping = false;
    this.hoursSinceSleep = 0;
    this.sick = false;
  }

  advanceHour() {
    this.food.advanceHour();
    this.water.advanceHour();
    this.sleep.advanceHour();
    this.sanity.advanceHour();
    this.hygiene.advanceHour();

    this.hoursSinceSleep++;

    if (this.hoursSinceSleep >= 24) {
      this.sanity.changeValue(-1); // extra sanity decay after 24h awake
    }
  }

  advanceDay() {
    this.grades.forEach(g => g.advanceDay());
  }

  update() {
    // Update all stat animations
    this.food.update();
    this.water.update();
    this.sleep.update();
    this.sanity.update();
    this.hygiene.update();
    this.rizz.update();
    this.grades.forEach(g => g.update());
  }

  sleepHours(hours) {
    this.sleep.changeValue(hours * 10);
    this.sanity.changeValue(50);
    this.hoursSinceSleep = 0;
  }

  eatAtDAKA() {
    if (this.mealPlan.normal > 0) {
      this.mealPlan.normal--;
    } else if (this.mealPlan.special > 0) {
      this.mealPlan.special--;
    } else {
      return;
    }

    this.food.changeValue(30);
    this.water.changeValue(10);

    if (MathUtil.chance(10)) {
      this.sick = true;
      this.sanity.changeValue(-10);
    }
  }

  drinkSoda() {
    this.sleep.changeValue(5);
    this.water.changeValue(5);
  }

  drinkWater() {
    this.water.changeValue(10);
  }

  eatAtCC() {
    this.food.changeValue(30);
    this.water.changeValue(10);
  }

  drinkMonster() {
    this.sleep.changeValue(25);
    this.water.changeValue(5);
  }

  goToClass(attended) {
    const sanityVal = this.sanity.getValue();
    const idx = MathUtil.randInt(0, this.grades.length - 1);
    const grade = this.grades[idx];

    if (!attended) {
      grade.changeValue(-MathUtil.randInt(0, 5));
      return;
    }

    if (sanityVal > 50) {
      grade.changeValue(MathUtil.randInt(0, 5));
    } else {
      grade.changeValue(-MathUtil.randInt(0, 3));
    }

    if (MathUtil.chance(20)) {
      this.rizz.changeValue(5);
    }
  }

  doomscroll(hours) {
    const delta = -3 * hours;
    this.food.changeValue(delta);
    this.water.changeValue(delta);
    this.sleep.changeValue(delta);
    this.sanity.changeValue(delta);
    this.hygiene.changeValue(delta);
  }

  visitFriends() {
    if (MathUtil.chance(50)) {
      this.rizz.changeValue(10);
    } else {
      this.rizz.changeValue(-5);
      this.sanity.changeValue(-5);
    }
  }

  useBathroom() {
    this.hygiene.changeValue(20);
    if (MathUtil.chance(20)) {
      this.sanity.changeValue(-5);
    }
  }

  interactRoommate() {
    this.food.changeValue(-5);
    this.water.changeValue(-5);
    this.sleep.changeValue(-5);
    this.sanity.changeValue(-10);
    this.hygiene.changeValue(-5);
    if (MathUtil.chance(1)) {
      this.rizz.changeValue(10);
    }
  }

  askForTime() {
    this.sanity.changeValue(-5);
  }

  render(ctx) {
    let y = 10;
    this.food.drawBar(ctx, 10, y, "Food"); y += 25;
    this.water.drawBar(ctx, 10, y, "Water"); y += 25;
    this.sleep.drawBar(ctx, 10, y, "Sleep"); y += 25;
    this.sanity.drawBar(ctx, 10, y, "Sanity"); y += 25;
    this.hygiene.drawBar(ctx, 10, y, "Hygiene"); y += 25;
    this.rizz.drawBar(ctx, 10, y, "Rizz"); y += 25;

    this.grades.forEach((g, i) => {
      g.drawBar(ctx, 10, y, `Grade ${i + 1}`); y += 25;
    });
  }
}

export { Player };
