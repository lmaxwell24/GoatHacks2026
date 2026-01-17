import { Player } from "./player.js";
import { SceneManager } from "./sceneManager.js";
import { TimeManager } from "./timeManager.js";
import { EventManager } from "./events.js";
import { Background, IMAGE_DIR } from "./background.js";
import { Menu } from "./menu.js";
import { ResponseManager } from "./response.js";

class Game {
  constructor() {
    this.width = 1280;
    this.height = 720;

    this.player = new Player(this);
    this.sceneManager = new SceneManager();
    this.time = new TimeManager(this);
    this.events = new EventManager(this);
    this.menu = new Menu();
    this.response = new ResponseManager();

    this.currentLocation = "dorm";
    this.ending = null;
    this.isSleeping = false;
    this.sleepStartTime = null;

    // Class scheduling system
    this.classAttendanceToday = [0, 0, 0]; // Track attendance for each class today
    this.classDoubleDays = [
      Math.floor(Math.random() * 7), // Random day (0-6) for Calculus II
      Math.floor(Math.random() * 7), // Random day for Physics I
      Math.floor(Math.random() * 7)  // Random day for Intro to Programming
    ];
    this.lastDayChecked = this.time.day;

    this.loadScenes();

    window.addEventListener("keydown", (e) => {
      // Only allow menu input if no response is currently displaying
      if (!this.response.isDisplaying) {
        this.menu.handleKey(e);
      }
      // Always allow response input if response is active
      this.response.handleKeyPress(e.key);
    });
  }

  loadScenes() {
    const makeBg = (file) => {
      const img = new Image();
      img.width = this.width;
      img.height = this.height;
      img.src = IMAGE_DIR + "/" + file;
      return img; // <-- FIXED
    };

    this.sceneManager.addScene("dorm", new Background(makeBg("dorm.png")));
    this.sceneManager.addScene("daka", new Background(makeBg("daka.png")));
    this.sceneManager.addScene("cc", new Background(makeBg("cc.png")));
    this.sceneManager.addScene("hallway", new Background(makeBg("hallway.png")));
    this.sceneManager.addScene("classroom", new Background(makeBg("classroom.png")));

    this.sceneManager.setScene("dorm");
  }

  openStartingScene() {
    this.setLocation("dorm");

    const options = [
      "Talk to roommate",
      "Go into hallway",
      "Sleep",
      "Study",
      "Doomscroll",
      "Drink"
    ];

    // Emphasize sleep after 10 PM (22:00)
    const sleepIndex = this.time.hour >= 22 ? 2 : -1;

    this.openMenu(
      options,
      (choice) => {
        switch (choice) {
          case "Talk to roommate":
            this.performAction({ type: "interact_roommate" });
            break;

          case "Go into hallway":
            this.openHallwayScene();
            return; // Don't reopen dorm scene yet
            break;

          case "Sleep":
            this.performAction({ type: "sleep", hours: 8 });
            break;

          case "Study":
            this.performAction({ type: "study" });
            break;

          case "Doomscroll":
            this.performAction({ type: "doomscroll" });
            break;

          case "Drink":
            this.openDrinkMenu();
            return; // Don't reopen dorm scene yet
            break;
        }

        // After action finishes, reopen the starting menu (unless sleeping)
        if (choice !== "Sleep") {
          this.openStartingScene();
        }
      },
      sleepIndex
    );
  }

  openHallwayScene() {
    this.setLocation("hallway");

    this.openMenu(
      [
        "Use the bathroom",
        "Go back to dorm",
        "Go to class",
        "Eat"
      ],
      (choice) => {
        switch (choice) {
          case "Use the bathroom":
            this.performAction({ type: "use_bathroom" });
            this.openHallwayScene();
            break;

          case "Go back to dorm":
            this.openStartingScene();
            break;

          case "Go to class":
            this.openClassMenu();
            break;

          case "Eat":
            this.openEatMenu();
            break;
        }
      }
    );
  }

  openEatMenu() {
    this.openMenu(
      [
        "Eat at DAKA",
        "Eat at CC",
        "Go back"
      ],
      (choice) => {
        switch (choice) {
          case "Eat at DAKA":
            this.setLocation("daka");
            this.player.eatAtDAKA();
            const dakaMessages = [
              "You got food poisoning.",
              "That tasted suspicious...",
              "Your stomach regrets this decision.",
              "Was that even food?"
            ];
            const dakaMsg = dakaMessages[Math.floor(Math.random() * dakaMessages.length)];
            this.response.showDialogue("Your Stomach", dakaMsg, true);
            this.response.onDismiss = () => {
              this.openHallwayScene();
            };
            this.time.advance(1);
            break;

          case "Eat at CC":
            this.setLocation("cc");
            this.player.eatAtCC();
            const ccMessages = [
              "Delicious. Almost as good as Monster Energy.",
              "Worth the calories.",
              "Not bad. Could use Monster though.",
              "This hits different at midnight."
            ];
            const ccMsg = ccMessages[Math.floor(Math.random() * ccMessages.length)];
            this.response.showDialogue("You", ccMsg, true);
            this.response.onDismiss = () => {
              this.openHallwayScene();
            };
            this.time.advance(1);
            break;

          case "Go back":
            this.openHallwayScene();
            break;
        }
      }
    );
  }

  openDrinkMenu() {
    this.openMenu(
      [
        "Water",
        "Soda",
        "Monster Energy",
        "Coffee",
        "Go back"
      ],
      (choice) => {
        switch (choice) {
          case "Water":
            this.player.drinkWater();
            this.response.showDialogue("You", "Ah, refreshing.", true);
            this.response.onDismiss = () => {
              this.openHallwayScene();
            };
            this.time.advance(0.5);
            break;

          case "Soda":
            this.player.drinkSoda();
            this.response.showDialogue("You", "Classic sugar rush.", true);
            this.response.onDismiss = () => {
              this.openHallwayScene();
            };
            this.time.advance(0.5);
            break;

          case "Monster Energy":
            this.player.drinkMonster();
            this.response.showConversation("You", "Just one more Monster...", "Monster", "There is no escape.", true);
            this.response.onDismiss = () => {
              this.openHallwayScene();
            };
            this.time.advance(0.5);
            break;

          case "Coffee":
            this.player.sleep.changeValue(20);
            this.player.water.changeValue(5);
            this.response.showDialogue("You", "The best part of waking up.", true);
            this.response.onDismiss = () => {
              this.openHallwayScene();
            };
            this.time.advance(0.5);
            break;

          case "Go back":
            this.openHallwayScene();
            break;
        }
      }
    );
  }

  openClassMenu() {
    this.setLocation("classroom");

    // Check if classes are available at this time (8 AM to 5 PM)
    const isClassTime = this.time.hour >= 8 && this.time.hour < 17;

    const options = [];
    const classNames = ["Calculus II", "Physics I", "Intro to Programming"];
    const classIndices = [0, 1, 2];

    classNames.forEach((name, i) => {
      // Check if class can be attended today
      const attendedToday = this.classAttendanceToday[i];
      const isDoubleDay = this.classDoubleDays[i] === this.time.day;
      const maxAttendance = isDoubleDay ? 2 : 1;
      const canAttend = attendedToday < maxAttendance && isClassTime;

      if (canAttend) {
        options.push(name);
      } else {
        // Show why it's unavailable
        if (!isClassTime) {
          options.push(`${name} (8 AM - 5 PM only)`);
        } else {
          options.push(`${name} (Already attended today)`);
        }
      }
    });

    options.push("Go back");

    this.openMenu(
      options,
      (choice) => {
        const classIndex = classNames.findIndex(name => choice.includes(name));

        if (classIndex === -1 || choice === "Go back") {
          this.openHallwayScene();
          return;
        }

        // Check if class is actually available
        const attendedToday = this.classAttendanceToday[classIndex];
        const isDoubleDay = this.classDoubleDays[classIndex] === this.time.day;
        const maxAttendance = isDoubleDay ? 2 : 1;

        if (attendedToday >= maxAttendance || !isClassTime) {
          this.response.showSystemResponse("You can't attend this class right now.");
          return;
        }

        const profNames = ["Prof. Chen", "Prof. Martinez", "Prof. Johnson"];
        this.classAttendanceToday[classIndex]++;
        this.handleClassAttendance(classNames[classIndex], profNames[classIndex], classIndex);
      }
    );
  }

  handleClassAttendance(className, professorName, gradeIndex) {
    const gradeBoost = Math.floor(Math.random() * 8) + 2; // Random 2-9 points

    this.player.grades[gradeIndex].changeValue(gradeBoost);
    this.time.advance(1);

    const professorMessages = [
      `Nice to see you in class today.`,
      `Good attendance, keep it up.`,
      `Pay attention to the homework.`,
      `You're doing better this week.`,
      `Don't fall asleep in the back.`
    ];

    const message = professorMessages[Math.floor(Math.random() * professorMessages.length)];
    this.response.showConversation("You", "Hi Professor", professorName, message, true);
    this.response.onDismiss = () => {
      this.openHallwayScene();
    };
  }

  setLocation(name) {
    this.currentLocation = name;
    this.sceneManager.setScene(name);
  }

  update() {
    // Input/UI should call performAction; update is mostly for animations
    this.response.update();
    this.player.update();

    // Reset class attendance when day changes
    if (this.time.day !== this.lastDayChecked) {
      this.classAttendanceToday = [0, 0, 0];
      this.lastDayChecked = this.time.day;
    }

    // Handle sleep sequence
    if (this.isSleeping) {
      const elapsed = Date.now() - this.sleepStartTime;
      if (elapsed >= 4000) { // 4 seconds
        this.isSleeping = false;
        this.openStartingScene();
      }
    }
  }

  openMenu(options, callback, emphasizeIndex = -1) {
    this.menu.open(options, callback, emphasizeIndex);
  }

  render(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.width, this.height);

    // Show black screen during sleep
    if (this.isSleeping) {
      const elapsed = Date.now() - this.sleepStartTime;
      const progress = elapsed / 4000; // 0 to 1

      // Fade in and out
      if (progress < 0.25) {
        // Fade to black
        ctx.fillStyle = `rgba(0, 0, 0, ${progress * 4})`;
      } else if (progress > 0.75) {
        // Fade from black
        ctx.fillStyle = `rgba(0, 0, 0, ${(1 - progress) * 4})`;
      } else {
        // Full black in middle
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
      }
      ctx.fillRect(0, 0, this.width, this.height);

      // Show "Sleeping..." text
      ctx.fillStyle = "white";
      ctx.font = "40px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sleeping...", this.width / 2, this.height / 2);
      ctx.textAlign = "left";

      return; // Skip normal rendering during sleep
    }

    this.sceneManager.render(ctx);
    this.player.render(ctx);

    // Fade out menu and scene if response is active
    if (this.response.isActive()) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, this.width, this.height);
      this.response.draw(ctx, this.width, this.height);
    } else {
      this.menu.draw(ctx);
      this.response.draw(ctx, this.width, this.height);
    }

    ctx.fillStyle = "white";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Week ${this.time.week}, Day ${this.time.day}, Hour ${this.time.hour}:00`, 10, this.height - 20);

    if (this.ending) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = "white";
      ctx.font = "40px sans-serif";
      ctx.fillText(this.ending, this.width / 2 - 150, this.height / 2);
    }
  }

  performAction(action) {
    if (this.ending) return;

    switch (action.type) {
      case "sleep":
        this.handleSleep(action);
        break;
      case "eat_daka":
        this.player.eatAtDAKA();
        this.response.showSystemResponse("You ate a meal at DAKA and gained 30 food.");
        this.time.advance(1);
        break;
      case "drink_soda":
        this.player.drinkSoda();
        this.response.showSystemResponse("You cracked open a cold soda. A small boost of energy!");
        this.time.advance(0.5);
        break;
      case "drink_water":
        this.player.drinkWater();
        this.response.showSystemResponse("You hydrated yourself with some fresh water.");
        this.time.advance(0.5);
        break;
      case "eat_cc":
        this.player.eatAtCC();
        this.response.showSystemResponse("You grabbed some food at the Commons. Delicious!");
        this.time.advance(1);
        break;
      case "drink_monster":
        this.player.drinkMonster();
        this.response.showConversation("You", "I'm not going to sleep tonight.", "Monster", "Neither am I.");
        this.time.advance(0.5);
        break;
      case "visit_friends":
        this.player.visitFriends();
        this.response.showConversation("You", "What's up guys?", "Friend", "Yo! Good to see you.");
        this.time.advance(1);
        break;
      case "use_bathroom":
        this.player.useBathroom();
        this.response.showSystemResponse("You took care of some personal hygiene. Much better.");
        this.time.advance(0.5);
        break;
      case "go_class":
        this.setLocation("classroom");
        this.player.goToClass(true);
        this.response.showSystemResponse("You attended class and took notes. Good job staying on top of it.");
        this.time.advance(1);
        break;
      case "skip_class":
        this.player.goToClass(false);
        this.response.showConversation("You", "Just gonna skip today.", "Professor", "Your absence has been noted.");
        this.time.advance(1);
        break;
      case "doomscroll":
        this.handleDoomscroll();
        break;
      case "interact_roommate":
        this.handleRoommateInteraction();
        break;
      case "study":
        this.handleStudy();
        break;
      case "ask_time":
        this.player.askForTime();
        this.response.showConversation("You", "What time is it?", "Friend", `It's ${this.time.hour}:00.`);
        this.time.advance(1);
        break;
      case "check_schedule":
        this.response.showSystemResponse("You checked your schedule. Classes at 9 AM and 2 PM tomorrow.");
        break;
    }

    this.checkEndings();
  }

  handleSleep(action) {
    const hours = action.hours || 8;
    const isNight = this.time.isNight();

    this.player.sleepHours(hours);
    this.time.advance(hours);
    this.player.sanity.changeValue(50);

    // Trigger sleep sequence (black screen for 10 seconds)
    this.isSleeping = true;
    this.sleepStartTime = Date.now();
  }

  handleDoomscroll() {
    const hours = Math.floor(Math.random() * 5) + 1;
    this.player.doomscroll(hours);
    this.response.showConversation("You", "Just one more scroll...", "Phone", "*infinite feed of doom*");
    this.time.advance(hours);
  }

  handleRoommateInteraction() {
    const responses = [
      {
        sprite1: "You",
        msg1: "Hey, how's it going?",
        sprite2: "Roommate",
        msg2: "It's been a long week, ngl."
      },
      {
        sprite1: "Roommate",
        msg1: "Did you finish that problem set?",
        sprite2: "You",
        msg2: "Not yet, maybe tonight..."
      },
      {
        sprite1: "You",
        msg1: "Want to grab food later?",
        sprite2: "Roommate",
        msg2: "Yeah, I could use a break."
      },
      {
        sprite1: "Roommate",
        msg1: "Dude, the AC is killing me.",
        sprite2: "You",
        msg2: "Tell me about it..."
      },
      {
        sprite1: "You",
        msg1: "What's up?",
        sprite2: "Roommate",
        msg2: "Just vibing. You?"
      }
    ];

    const random = responses[Math.floor(Math.random() * responses.length)];
    this.player.interactRoommate();
    this.response.showConversation(random.sprite1, random.msg1, random.sprite2, random.msg2);
    this.time.advance(1);
  }

  handleStudy() {
    const studyResponses = [
      "You spent an hour studying. Your grades feel a little more secure.",
      "You cracked open your notes and reviewed the lecture. Productive session.",
      "Time to ace this exam. You hit the books hard.",
      "You worked through some practice problems. Getting more confident.",
      "Study sesh engaged. Time to turn those B's into A's."
    ];

    const random = studyResponses[Math.floor(Math.random() * studyResponses.length)];
    this.response.showSystemResponse(random);
    this.time.advance(1);
    this.player.grades.forEach(g => g.changeValue(5));
  }

  onHourPassed() {
    if (this.time.hoursAwake >= 48) {
      this.player.sleepHours(8);
      this.time.hoursAwake = 0;
    }

    if (this.player.sanity.getValue() <= 0 && !this.ending) {
      this.ending = "Wellness Day Added!";
    }

    this.events.maybeTriggerRandomEvent();
  }

  onDayPassed() {
    this.events.onDayStart();

    if (this.time.day === 4) {
      this.events.forceThursdayEvent();
    }
  }

  onWeekPassed() {
    this.events.onWeekStart();

    if (this.time.week === 7) {
      this.evaluateFinals();
    }
  }

  evaluateFinals() {
    this.checkEndings(true);
  }

  checkEndings(force = false) {
    if (!force && this.time.week < 7) return;

    const stats = [
      this.player.food.getValue(),
      this.player.water.getValue(),
      this.player.sleep.getValue(),
      this.player.sanity.getValue(),
      this.player.hygiene.getValue()
    ];

    const allBetween70And80 = stats.every(v => v >= 70 && v <= 80);
    const allA = this.player.grades.every(g => g.getValue() >= 90);
    const lowRizz = this.player.rizz.getValue() < 40;
    const highRizz = this.player.rizz.getValue() >= 80;

    if (this.player.sanity.getValue() <= 0) {
      this.ending = "Wellness Day Added!";
    } else if (allBetween70And80) {
      this.ending = "C's Get Degrees";
    } else if (allA && lowRizz) {
      this.ending = "Nerd";
    } else if (highRizz) {
      this.ending = "Playboy";
    }
  }
}

export { Game };
