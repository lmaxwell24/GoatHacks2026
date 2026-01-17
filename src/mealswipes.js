class MealSwipes {
  constructor(initialBaseSwipes = 0, initialFlexSwipes = 0) {
    this.initialBaseSwipes = initialBaseSwipes;
    this.remainingBaseSwipes = initialBaseSwipes;

    this.initialFlexSwipes = initialFlexSwipes;
    this.remainingFlexSwipes = initialFlexSwipes;
  }

  useFlexSwipe() {
    if (this.remainingFlexSwipes > 0) {
      this.remainingFlexSwipes--;
      return true;
    } else {
      return false;
    }
  }

  useBaseSwipe() {
    if (this.remainingBaseSwipes > 0) {
      this.remainingBaseSwipes--;
      return true;
    } else if (this.remainingFlexSwipes > 0) {
      this.remainingFlexSwipes--;
      return true;
    } else {
      return false;
    }
  }

  getRemainingBaseSwipes() {
    return this.remainingBaseSwipes;
  }

  getRemainingFlexSwipes() {
    return this.remainingFlexSwipes;
  }

  resetSwipes() {
    this.remainingBaseSwipes = this.initialBaseSwipes;
    this.remainingFlexSwipes = this.initialFlexSwipes;
  }
}

const MealPlans = Object.freeze({
  Easy: new MealSwipes(initialBaseSwipes = 0, initialFlexSwipes = 15),
  Medium: new MealSwipes(initialBaseSwipes = 7, initialFlexSwipes = 5),
  Hard: new MealSwipes(initialBaseSwipes = 10, initialFlexSwipes = 0)
})

export { MealPlans };
