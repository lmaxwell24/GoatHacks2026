import {IMAGE_DIR} from "./background.js";
import {MathUtil} from "./mathutil.js";
import {Stat} from "./stat.js";
import {Vector2} from "./vector.js";

class Player {
  constructor() {
    this.food = new Stat({initialValue : 100, hourlyChange : -5});
    this.water = new Stat({initialValue : 100, hourlyChange : -7});
    this.sleep = new Stat({initialValue : 100, hourlyChange : -4});
    this.sanity = new Stat({initialValue : 100, hourlyChange : -1});
    this.hygiene = new Stat({initialValue : 100, hourlyChange : -2});
    this.rizz = new Stat({initialValue : 50, hourlyChange : 0});

    this.grades = [
      new Stat({initialValue : 80, dailyChange : -1}),
      new Stat({initialValue : 80, dailyChange : -1}),
      new Stat({initialValue : 80, dailyChange : -1})
    ];

    // Load bar overlay images
    this.barImages = {
      food : new Image(),
      water : new Image(),
      sleep : new Image(),
      sanity : new Image(),
      hygiene : new Image(),
      rizz : new Image(),
      grade1 : new Image(),
      grade2 : new Image(),
      grade3 : new Image()
    };

    this.barImages.food.src = `${IMAGE_DIR}/food_bar.png`;
    this.barImages.water.src = `${IMAGE_DIR}/water_bar.png`;
    this.barImages.sleep.src = `${IMAGE_DIR}/sleep_bar.png`;
    this.barImages.sanity.src = `${IMAGE_DIR}/sanity_bar_1.png`;
    this.barImages.hygiene.src = `${IMAGE_DIR}/hygiene_bar.png`;
    this.barImages.rizz.src = `${IMAGE_DIR}/rizz_bar.png`;
    this.barImages.grade1.src = `${IMAGE_DIR}/class_1_bar.png`;
    this.barImages.grade2.src = `${IMAGE_DIR}/class_2_bar.png`;
    this.barImages.grade3.src = `${IMAGE_DIR}/class_3_bar.png`;

    // Meal plan system - Easy: 15 special swipes a week
    this.mealPlan = {
      difficulty : "easy",
      normal : 0,
      special : 15,
      normalMax : 0,
      specialMax : 15
    };

    this.isSleeping = false;
    this.hoursSinceSleep = 0;
    this.sick = false;

    // Walking animation
    this.walkingAnimation = [
      new Image(),
      new Image(),
    ];
    this.walkingAnimation[0].src =
        `${IMAGE_DIR}/characters/player/walking_1.png`;
    this.walkingAnimation[1].src =
        `${IMAGE_DIR}/characters/player/walking_2.png`;
    // disable aliasing
    this.walkingAnimation.forEach(
        img => { img.style.imageRendering = "pixelated"; });

    this.idleImage = new Image();
    this.idleImage.src = `${IMAGE_DIR}/characters/player/idle.png`;

    this.walkingFrame = 0;
    this.isWalking = false;
    this.lastWalkFrameTime = new Date().getTime();

    this.position = new Vector2(0, 0);
    this.velocity = new Vector2(0, 0);

    this.lastMoveTime = new Date().getTime();
  }

  handleKey(activeKeys) {
    const speed = 2 * 4;
    this.velocity = new Vector2(0, 0);
    if (activeKeys.has("ArrowUp")) {
      this.velocity.y -= speed;
    }
    if (activeKeys.has("ArrowDown")) {
      this.velocity.y += speed;
    }
    if (activeKeys.has("ArrowLeft")) {
      this.velocity.x -= speed;
    }
    if (activeKeys.has("ArrowRight")) {
      this.velocity.x += speed;
    }
    this.velocity.x = Math.min(speed, Math.max(-speed, this.velocity.x));
    this.velocity.y = Math.min(speed, Math.max(-speed, this.velocity.y));

    this.isWalking = this.velocity.magnitude() > 0
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

  advanceDay() { this.grades.forEach(g => g.advanceDay()); }

  update() {
    // Update all stat animations
    this.food.update();
    this.water.update();
    this.sleep.update();
    this.sanity.update();
    this.hygiene.update();
    this.rizz.update();
    this.grades.forEach(g => g.update());

    const now = new Date().getTime();
    if (now - this.lastMoveTime > 50) {
      // Update position based on velocity
      this.position = this.position.add(this.velocity);
      this.lastMoveTime = now;
    }
  }

  getRemainingSwipes() { return this.mealPlan.normal + this.mealPlan.special; }

  getSwipesString() {
    return `Normal: ${this.mealPlan.normal} | Special: ${
        this.mealPlan.special}`;
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
      return false; // No swipes available
    }

    this.food.changeValue(30);
    this.water.changeValue(10);

    if (MathUtil.chance(10)) {
      this.sick = true;
      this.sanity.changeValue(-10);
    }

    return true; // Successfully ate
  }

  drinkSoda() {
    this.sleep.changeValue(5);
    this.water.changeValue(5);
  }

  drinkWater() { this.water.changeValue(10); }

  eatAtCC() {
    if (this.mealPlan.normal > 0) {
      this.mealPlan.normal--;
    } else if (this.mealPlan.special > 0) {
      this.mealPlan.special--;
    } else {
      return false; // No swipes available
    }

    this.food.changeValue(30);
    this.water.changeValue(10);

    return true; // Successfully ate
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

  askForTime() { this.sanity.changeValue(-5); }

  render(ctx) {
    let y = 10;
    this.food.drawBar(ctx, 10, y, "Food", this.barImages.food);
    y += 50;
    this.water.drawBar(ctx, 10, y, "Water", this.barImages.water);
    y += 50;
    this.sleep.drawBar(ctx, 10, y, "Sleep", this.barImages.sleep);
    y += 50;
    this.sanity.drawBar(ctx, 10, y, "Sanity", this.barImages.sanity);
    y += 50;
    this.hygiene.drawBar(ctx, 10, y, "Hygiene", this.barImages.hygiene);
    y += 50;
    this.rizz.drawBar(ctx, 10, y, "Rizz", this.barImages.rizz);
    y += 50;

    const gradeImages =
        [ this.barImages.grade1, this.barImages.grade2, this.barImages.grade3 ];
    this.grades.forEach((g, i) => {
      g.drawBar(ctx, 10, y, `Grade ${i + 1}`, gradeImages[i]);
      y += 50;
    });

    // render image if walking
    if (this.isWalking) {
      const now = new Date().getTime();
      if (now - this.lastWalkFrameTime > 300) {
        this.walkingFrame =
            (this.walkingFrame + 1) % this.walkingAnimation.length;
        this.lastWalkFrameTime = now;
      }
      ctx.drawImage(this.walkingAnimation[this.walkingFrame], this.position.x,
                    this.position.y, 64, 64);
    } else {
      ctx.drawImage(this.idleImage, this.position.x, this.position.y, 64, 64);
    }
  }
}

export {Player};
