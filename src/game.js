import {Background, IMAGE_DIR} from "./background.js";
import {EventManager} from "./events.js";
import {Menu} from "./menu.js";
import {Player} from "./player.js";
import {ResponseManager} from "./response.js";
import {SceneManager} from "./sceneManager.js";
import {TimeManager} from "./timeManager.js";

class Game {
  constructor() {
    this.width = 1280;
    this.height = 720;

    this.player = new Player();
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
    this.classAttendanceToday =
        [ 0, 0, 0 ]; // Track attendance for each class today
    this.classDoubleDays = [
      Math.floor(Math.random() * 7), // Random day (0-6) for Calculus II
      Math.floor(Math.random() * 7), // Random day for Physics I
      Math.floor(Math.random() * 7)  // Random day for Intro to Programming
    ];
    this.lastDayChecked = this.time.day;

    // Flirt history tracking for dialogue context
    this.hallwayFlirtHistory = {
      attempted : 0,
      succeeded : 0,
      lastOutcome : null, // 'success' or 'failure'
      lastDay : -1
    };

    this.classFlirtHistory =
        {attempted : 0, succeeded : 0, lastOutcome : null, lastDay : -1};

    this.loadScenes();

    this.activeKeys = new Set();

    window.addEventListener("keydown", (e) => {
      // Only allow menu input if no response is currently displaying
      if(e.key === "f"){
        canvas.requestFullscreen();
      }
      this.activeKeys.add(e.key);
      if (!this.response.isDisplaying) {
        this.menu.handleKey(e);
      } else if (!this.menu.active){
        // we are able to move
      }
      // Always allow response input if response is active
      this.response.handleKeyPress(e.key);

      this.player.handleKey(this.activeKeys);

    });
    window.addEventListener("keyup", (e) => {
      this.activeKeys.delete(e.key);
      this.player.handleKey(this.activeKeys);
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
    this.sceneManager.addScene("daka", new Background(makeBg("daka.jpg")));
    this.sceneManager.addScene("cc", new Background(makeBg("cc.png")));
    this.sceneManager.addScene("hallway",
                               new Background(makeBg("hallway.png")));
    this.sceneManager.addScene("classroom",
                               new Background(makeBg("classroom.png")));
    this.sceneManager.addScene("bathroom",
                               new Background(makeBg("bathroom.jpg")));
    this.sceneManager.addScene("halalshack",
                               new Background(makeBg("halalshack.jpg")));

    this.sceneManager.setScene("dorm");
  }

  openStartingScene() {
    this.setLocation("dorm");

    const options = [
      "Talk to roommate", "Go into hallway", "Sleep", "Study", "Doomscroll",
      "Drink"
    ];

    // Emphasize sleep after 10 PM (22:00)
    const sleepIndex = this.time.hour >= 22 ? 2 : -1;

    // this.openMenu(options, (choice) => {
    //   switch (choice) {
    //   case "Talk to roommate":
    //     this.performAction({type : "interact_roommate"});
    //     break;

    //   case "Go into hallway":
    //     this.openHallwayScene();
    //     return; // Don't reopen dorm scene yet
    //     break;

    //   case "Sleep":
    //     this.performAction({type : "sleep", hours : 8});
    //     break;

    //   case "Study":
    //     this.performAction({type : "study"});
    //     break;

    //   case "Doomscroll":
    //     this.performAction({type : "doomscroll"});
    //     break;

    //   case "Drink":
    //     this.openDrinkMenu();
    //     return; // Don't reopen dorm scene yet
    //     break;
    //   }

    //   // After action finishes, reopen the starting menu (unless sleeping)
    //   if (choice !== "Sleep") {
    //     this.openStartingScene();
    //   }
    // }, sleepIndex);
  }

  openHallwayScene() {
    this.setLocation("hallway");

    this.openMenu(
        [
          "Use the bathroom", "Go back to dorm", "Go to class", "Eat",
          "Talk to someone"
        ],
        (choice) => {
          switch (choice) {
          case "Use the bathroom":
            this.setLocation("bathroom");
            const bathroomDialogues = [
              "Why does it smell like that?", "Is this even sanitary?",
              "I've seen worse.", "Definitely flushing twice.",
              "Let's not think too hard about this.", "This is fine."
            ];
            const bathroomMsg = bathroomDialogues[Math.floor(
                Math.random() * bathroomDialogues.length)];
            this.response.showDialogue("You", bathroomMsg, true);
            this.response.onDismiss = () => { this.openHallwayScene(); };
            this.performAction({type : "use_bathroom"});
            this.time.advance(0.5);
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

          case "Talk to someone":
            this.handleHallwayFlirt();
            break;
          }
        });
  }

  openEatMenu() {
    this.openMenu(
        [ "Eat at DAKA", "Eat at CC", "Check Halal Shack", "Go back" ],
        (choice) => {
          switch (choice) {
          case "Eat at DAKA":
            if (this.player.getRemainingSwipes() <= 0) {
              this.response.showSystemResponse(
                  "You don't have any meal swipes left!");
              this.response.onDismiss = () => { this.openEatMenu(); };
              return;
            }

            this.setLocation("daka");
            this.player.eatAtDAKA();
            const dakaMessages = [
              "You got food poisoning.", "That tasted suspicious...",
              "Your stomach regrets this decision.", "Was that even food?"
            ];
            const dakaMsg =
                dakaMessages[Math.floor(Math.random() * dakaMessages.length)];
            this.response.showDialogue("Your Stomach", dakaMsg, true);
            this.response.onDismiss = () => { this.openHallwayScene(); };
            this.time.advance(1);
            break;

          case "Eat at CC":
            if (this.player.getRemainingSwipes() <= 0) {
              this.response.showSystemResponse(
                  "You don't have any meal swipes left!");
              this.response.onDismiss = () => { this.openEatMenu(); };
              return;
            }

            this.setLocation("cc");
            this.player.eatAtCC();
            const ccMessages = [
              "Delicious. Almost as good as Monster Energy.",
              "Worth the calories.", "Not bad. Could use Monster though.",
              "This hits different at midnight."
            ];
            const ccMsg =
                ccMessages[Math.floor(Math.random() * ccMessages.length)];
            this.response.showDialogue("You", ccMsg, true);
            this.response.onDismiss = () => { this.openHallwayScene(); };
            this.time.advance(1);
            break;

          case "Check Halal Shack":
            this.setLocation("halalshack");
            this.time.advance(1);
            const disappointedMessages = [
              "Closed. Of course it's closed.",
              "...It's locked. Why am I even surprised?",
              "Nope. Closed again. This never works out.",
              "Yeah, it's closed. As always.",
              "Really? REALLY? Closed. I should have known.",
              "I've learned not to expect anything from this place."
            ];
            const message = disappointedMessages[Math.floor(
                Math.random() * disappointedMessages.length)];
            this.response.showDialogue("You", message, true);
            this.response.onDismiss = () => { this.openHallwayScene(); };
            break;

          case "Go back":
            this.openHallwayScene();
            break;
          }
        });
  }

  openDrinkMenu() {
    this.openMenu(
        [ "Water", "Soda", "Monster Energy", "Coffee", "Go back" ],
        (choice) => {
          switch (choice) {
          case "Water":
            this.player.drinkWater();
            this.response.showDialogue("You", "Ah, refreshing.", true);
            this.response.onDismiss = () => { this.openHallwayScene(); };
            this.time.advance(0.5);
            break;

          case "Soda":
            this.player.drinkSoda();
            this.response.showDialogue("You", "Classic sugar rush.", true);
            this.response.onDismiss = () => { this.openHallwayScene(); };
            this.time.advance(0.5);
            break;

          case "Monster Energy":
            this.player.drinkMonster();
            this.response.showConversation("You", "Just one more Monster...",
                                           "Monster", "There is no escape.",
                                           true);
            this.response.onDismiss = () => { this.openHallwayScene(); };
            this.time.advance(0.5);
            break;

          case "Coffee":
            this.player.sleep.changeValue(20);
            this.player.water.changeValue(5);
            this.response.showDialogue("You", "The best part of waking up.",
                                       true);
            this.response.onDismiss = () => { this.openHallwayScene(); };
            this.time.advance(0.5);
            break;

          case "Go back":
            this.openStartingScene();
            break;
          }
        });
  }

  openClassMenu() {
    this.setLocation("classroom");

    const classNames = [ "Calculus II", "Physics I", "Intro to Programming" ];

    const options = [];
    classNames.forEach((name, i) => {
      const attendedToday = this.classAttendanceToday[i];
      const isDoubleDay = this.classDoubleDays[i] === this.time.day;
      const maxAttendance = isDoubleDay ? 2 : 1;

      if (attendedToday < maxAttendance) {
        options.push(name);
      } else {
        options.push(`${name} (Already attended today)`);
      }
    });

    options.push("Talk to someone");
    options.push("Go back");

    this.openMenu(options, (choice) => {
      if (choice === "Talk to someone") {
        this.handleClassFlirt();
        return;
      }

      const classIndex = classNames.findIndex(name => choice.includes(name));

      if (classIndex === -1 || choice === "Go back") {
        this.openHallwayScene();
        return;
      }

      // Check if class is actually available
      const attendedToday = this.classAttendanceToday[classIndex];
      const isDoubleDay = this.classDoubleDays[classIndex] === this.time.day;
      const maxAttendance = isDoubleDay ? 2 : 1;

      if (attendedToday >= maxAttendance) {
        this.response.showSystemResponse(
            "You can't attend this class right now.");
        return;
      }

      const profNames = [ "Prof. Chen", "Prof. Martinez", "Prof. Johnson" ];
      this.classAttendanceToday[classIndex]++;
      this.handleClassAttendance(classNames[classIndex], profNames[classIndex],
                                 classIndex);
    });
  }

  handleClassAttendance(className, professorName, gradeIndex) {
    const isClassTime = this.time.hour >= 8 && this.time.hour < 17;

    // If not during class hours, show a rude classmate comment
    if (!isClassTime) {
      const rudeComments = [
        "Why are you even here right now? Did you sleep through the day?",
        "Bro, this class ended like 10 hours ago. Are you okay?",
        "Dude, what? That's not when we meet.",
        "I think you're lost, man. This room's not being used right now.",
        "Uh... the class doesn't meet now. Did you forget to check your schedule?"
      ];

      const comment =
          rudeComments[Math.floor(Math.random() * rudeComments.length)];
      this.response.showConversation("Classmate", comment, "You",
                                     "Oh... right. My bad.", true);
      this.response.onDismiss = () => { this.openHallwayScene(); };
      this.time.advance(0.5); // 30 minutes
      return;
    }

    // Normal class attendance
    const gradeBoost = Math.floor(Math.random() * 8) + 2; // Random 2-9 points
    this.player.grades[gradeIndex].changeValue(gradeBoost);
    this.time.advance(0.5); // 30 minutes

    const professorMessages = [
      `Nice to see you in class today.`, `Good attendance, keep it up.`,
      `Pay attention to the homework.`, `You're doing better this week.`,
      `Don't fall asleep in the back.`
    ];

    const message =
        professorMessages[Math.floor(Math.random() * professorMessages.length)];
    this.response.showConversation("You", "Hi Professor", professorName,
                                   message, true);
    this.response.onDismiss = () => { this.openHallwayScene(); };
  }

  handleHallwayFlirt() {
    this.time.advance(0.25);
    const sanity = this.player.sanity.getValue();

    // Success rate based on sanity (higher sanity = better chances)
    const successChance = Math.max(20, Math.min(80, sanity));
    const success = Math.random() * 100 < successChance;

    const girls = [
      {
        name : "Emma",
        responses :
            [ "Hey, how's it going?", "What's your name?", "You seem cool." ]
      },
      {
        name : "Sarah",
        responses : [ "Hi there!", "Do I know you?", "What's up?" ]
      },
      {
        name : "Alex",
        responses : [ "Oh, hey.", "How do I know you?", "I'm listening..." ]
      },
      {
        name : "Jordan",
        responses : [
          "Hey! What's going on?", "Do I know you from somewhere?",
          "What's on your mind?"
        ]
      },
      {
        name : "Taylor",
        responses : [ "Oh hi!", "I don't think we've met.", "Sup?" ]
      }
    ];

    const girl = girls[Math.floor(Math.random() * girls.length)];

    // Track interaction
    const wasRecentFailure =
        this.hallwayFlirtHistory.lastOutcome === 'failure' &&
        this.hallwayFlirtHistory.lastDay === this.time.day;
    const hasTriedBefore = this.hallwayFlirtHistory.attempted > 0;
    const hasSucceededBefore = this.hallwayFlirtHistory.succeeded > 0;

    if (success) {
      const rizzGains = Math.floor(Math.random() * 10) + 5; // 5-15 rizz
      this.player.rizz.changeValue(rizzGains);

      this.hallwayFlirtHistory.attempted++;
      this.hallwayFlirtHistory.succeeded++;
      this.hallwayFlirtHistory.lastOutcome = 'success';
      this.hallwayFlirtHistory.lastDay = this.time.day;

      // Dialogue changes based on history
      let successLines;
      if (hasTriedBefore && hasSucceededBefore) {
        successLines = [
          "You: Hey! Good to see you again. Coffee later?",
          "You: I was hoping I'd run into you. How've you been?",
          "You: You know, I keep thinking about our last conversation.",
          "You: I've been wanting to see you again. Coincidence?"
        ];
      } else if (wasRecentFailure) {
        // Second chance - more hopeful
        successLines = [
          "You: Hey, I wanted to say sorry about earlier. Can we start over?",
          "You: I wasn't thinking clearly before. But I meant what I said.",
          "You: Okay, second time's the charm. Can I get your number?",
          "You: I've been kicking myself all day. Want to give me another shot?"
        ];
      } else {
        successLines = [
          "You: Hey, I couldn't help but notice you. What's your name?",
          "You: You seem really interesting. Want to grab coffee?",
          "You: I think we'd get along great. What do you say?",
          "You: That smile is contagious. What are you up to?"
        ];
      }

      const girlResponse =
          hasTriedBefore ? "Yeah, I remember you. Let's hang out sometime."
                         : girl.responses[Math.floor(Math.random() *
                                                     girl.responses.length)];

      const yourLine =
          successLines[Math.floor(Math.random() * successLines.length)];
      this.response.showConversation("You", yourLine, girl.name, girlResponse,
                                     true);
    } else {
      const rizzLoss = Math.floor(Math.random() * 5) + 1; // 1-5 rizz
      this.player.rizz.changeValue(-rizzLoss);

      this.hallwayFlirtHistory.attempted++;
      this.hallwayFlirtHistory.lastOutcome = 'failure';
      this.hallwayFlirtHistory.lastDay = this.time.day;

      // Dialogue changes based on history
      let failLines;
      let failResponse;

      if (hasTriedBefore && hasSucceededBefore) {
        // Been successful before - this is awkward
        failLines = [
          "You: Hey, remember me? Maybe this time—",
          "You: I know we had something before, so... another try?",
          "You: I'm usually better at this. Can I try again?"
        ];
        failResponse = [
          "Yeah, I remember. And I'm still not interested.",
          "Sorry, but my answer hasn't changed.",
          "That was a no last time, and it's still a no."
        ];
      } else if (wasRecentFailure) {
        // Tried and failed earlier today - third attempt
        failLines = [
          "You: Okay, one more time. I promise I can do better.",
          "You: I know I failed twice, but—",
          "You: Third time's the charm, right?"
        ];
        failResponse = [
          "I think you got the message. Please stop.",
          "You're sweet, but I'm going to pass. Permanently.",
          "No means no. I think you know this."
        ];
      } else {
        failLines = [
          "You: Uh... hi. Do I know you?", "You: Wait, have we met before?",
          "You: I just... never mind.", "You: Yo, you seem... cool?"
        ];
        failResponse = [
          "Thanks, but I think you have the wrong person.",
          "Um, I'm not sure what you're going for here.",
          "That's... kind of weird. Sorry.", "I'm good, thanks though."
        ];
      }

      const yourLine = failLines[Math.floor(Math.random() * failLines.length)];
      const herResponse =
          failResponse[Math.floor(Math.random() * failResponse.length)];
      this.response.showConversation("You", yourLine, girl.name, herResponse,
                                     true);
    }

    this.response.onDismiss = () => { this.openHallwayScene(); };
  }

  handleClassFlirt() {
    this.time.advance(0.25);
    const sanity = this.player.sanity.getValue();

    // Success rate based on sanity
    const successChance = Math.max(20, Math.min(80, sanity));
    const success = Math.random() * 100 < successChance;

    const classmates = [
      {
        name : "Jessica",
        responses : [
          "Oh hey! What's up?", "Sure, what's on your mind?", "Yeah, totally."
        ]
      },
      {
        name : "Maya",
        responses :
            [ "Hi! I've seen you around.", "Oh, okay.", "Sure, I guess." ]
      },
      {
        name : "Sophie",
        responses : [ "Hey! How's it going?", "What's good?", "Sup." ]
      },
      {
        name : "Rachel",
        responses : [ "Oh hey there!", "Yeah?", "I'm listening." ]
      },
      {
        name : "Olivia",
        responses : [ "Hey! What's up?", "Sure.", "That's sweet." ]
      }
    ];

    const classmate = classmates[Math.floor(Math.random() * classmates.length)];

    // Track interaction
    const wasRecentFailure = this.classFlirtHistory.lastOutcome === 'failure' &&
                             this.classFlirtHistory.lastDay === this.time.day;
    const hasTriedBefore = this.classFlirtHistory.attempted > 0;
    const hasSucceededBefore = this.classFlirtHistory.succeeded > 0;

    if (success) {
      const rizzGains =
          Math.floor(Math.random() * 12) + 5; // 5-17 rizz (better in class)
      this.player.rizz.changeValue(rizzGains);

      this.classFlirtHistory.attempted++;
      this.classFlirtHistory.succeeded++;
      this.classFlirtHistory.lastOutcome = 'success';
      this.classFlirtHistory.lastDay = this.time.day;

      // Dialogue changes based on history
      let successLines;
      if (hasTriedBefore && hasSucceededBefore) {
        successLines = [
          "You: Hey, want to work on the project together again?",
          "You: I really enjoyed our study session. When are you free?",
          "You: I was hoping we'd run into each other in class again.",
          "You: You know, I look forward to seeing you in class now."
        ];
      } else if (wasRecentFailure) {
        // Second chance - more confident
        successLines = [
          "You: Hey, I wanted to give that another shot. How about we actually study together?",
          "You: You know, I've been thinking about what you said. Let's grab coffee?",
          "You: I wasn't prepared before, but I meant it. Want to work together on the project?",
          "You: Okay, let me try this properly. Study session tomorrow?"
        ];
      } else {
        successLines = [
          "You: Hey, I've been meaning to ask... want to study together sometime?",
          "You: You're always prepared in class. That's impressive.",
          "You: We should work on the project together.",
          "You: I think we'd make a good team. For the homework, I mean."
        ];
      }

      const classmateResponse =
          hasTriedBefore ? "Yeah, I'd like that. Let me know when."
                         : classmate.responses[Math.floor(
                               Math.random() * classmate.responses.length)];

      const yourLine =
          successLines[Math.floor(Math.random() * successLines.length)];
      this.response.showConversation("You", yourLine, classmate.name,
                                     classmateResponse, true);
    } else {
      const rizzLoss = Math.floor(Math.random() * 5) + 1;
      this.player.rizz.changeValue(-rizzLoss);

      this.classFlirtHistory.attempted++;
      this.classFlirtHistory.lastOutcome = 'failure';
      this.classFlirtHistory.lastDay = this.time.day;

      // Dialogue changes based on history
      let failLines;
      let failResponse;

      if (hasTriedBefore && hasSucceededBefore) {
        // Been successful before - this is awkward
        failLines = [
          "You: Hey, maybe this time we could—",
          "You: I know things have been good between us, but what if—",
          "You: I'm usually better at this. Can I try again?"
        ];
        failResponse = [
          "I think we're better off as study partners.",
          "Let's keep it professional, okay?",
          "I value our friendship. Let's not make it weird."
        ];
      } else if (wasRecentFailure) {
        // Tried and failed earlier today
        failLines = [
          "You: Okay, third time's the charm. Really.",
          "You: I promise I'm more interesting than I seem.",
          "You: One more chance? I swear I'm not this awkward normally."
        ];
        failResponse = [
          "I appreciate the effort, but I'm just not interested.",
          "You're a good person, but no.",
          "I think we've done this enough times today."
        ];
      } else {
        failLines = [
          "You: So, uh, this class is... hard, right?",
          "You: You seem pretty smart. What are you gonna do after class?",
          "You: I don't think we've met. I'm... cool.",
          "You: Do you always sit here, or...?"
        ];
        failResponse = [
          "Yeah, it's not easy. Anyway, I need to focus.",
          "Thanks, but I should probably pay attention.",
          "Um, okay... I'm going to step outside real quick.",
          "I'm actually trying to understand the material, so..."
        ];
      }

      const yourLine = failLines[Math.floor(Math.random() * failLines.length)];
      const herResponse =
          failResponse[Math.floor(Math.random() * failResponse.length)];
      this.response.showConversation("You", yourLine, classmate.name,
                                     herResponse, true);
    }

    this.response.onDismiss = () => { this.openClassMenu(); };
  }

  setLocation(name) {
    this.currentLocation = name;
    this.sceneManager.setScene(name);
  }

  formatTime(hour24) {
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 < 12 ? "AM" : "PM";
    return `${hour12}:00 ${ampm}`;
  }

  update() {
    // Input/UI should call performAction; update is mostly for animations
    this.response.update();
    this.player.update();

    // Reset class attendance when day changes
    if (this.time.day !== this.lastDayChecked) {
      this.classAttendanceToday = [ 0, 0, 0 ];
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
    } else if (this.menu.active) {
      this.menu.draw(ctx);
      this.response.draw(ctx, this.width, this.height);
    }

    ctx.fillStyle = "white";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Week ${this.time.week}, Day ${this.time.day}, ${
                     this.formatTime(this.time.hour)}`,
                 10, this.height - 20);

    // Display meal swipes
    ctx.fillStyle = "white";
    ctx.font = "14px sans-serif";
    ctx.fillText(`Meals: ${this.player.getSwipesString()}`, 10,
                 this.height - 40);

    if (this.ending) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = "white";
      ctx.font = "40px sans-serif";
      ctx.fillText(this.ending, this.width / 2 - 150, this.height / 2);
    }
  }

  performAction(action) {
    if (this.ending)
      return;

    switch (action.type) {
    case "sleep":
      this.handleSleep(action);
      break;
    case "eat_daka":
      this.player.eatAtDAKA();
      this.response.showSystemResponse(
          "You ate a meal at DAKA and gained 30 food.");
      this.time.advance(1);
      break;
    case "drink_soda":
      this.player.drinkSoda();
      this.response.showSystemResponse(
          "You cracked open a cold soda. A small boost of energy!");
      this.time.advance(0.5);
      break;
    case "drink_water":
      this.player.drinkWater();
      this.response.showSystemResponse(
          "You hydrated yourself with some fresh water.");
      this.time.advance(0.5);
      break;
    case "eat_cc":
      this.player.eatAtCC();
      this.response.showSystemResponse(
          "You grabbed some food at the Commons. Delicious!");
      this.time.advance(1);
      break;
    case "drink_monster":
      this.player.drinkMonster();
      this.response.showConversation("You", "I'm not going to sleep tonight.",
                                     "Monster", "Neither am I.");
      this.time.advance(0.5);
      break;
    case "visit_friends":
      this.player.visitFriends();
      this.response.showConversation("You", "What's up guys?", "Friend",
                                     "Yo! Good to see you.");
      this.time.advance(1);
      break;
    case "use_bathroom":
      this.player.useBathroom();
      this.response.showSystemResponse(
          "You took care of some personal hygiene. Much better.");
      this.time.advance(0.5);
      break;
    case "go_class":
      this.setLocation("classroom");
      this.player.goToClass(true);
      this.response.showSystemResponse(
          "You attended class and took notes. Good job staying on top of it.");
      this.time.advance(1);
      break;
    case "skip_class":
      this.player.goToClass(false);
      this.response.showConversation("You", "Just gonna skip today.",
                                     "Professor",
                                     "Your absence has been noted.");
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
      this.response.showConversation("You", "What time is it?", "Friend",
                                     `It's ${this.time.hour}:00.`);
      this.time.advance(1);
      break;
    case "check_schedule":
      this.response.showSystemResponse(
          "You checked your schedule. Classes at 9 AM and 2 PM tomorrow.");
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
    this.response.showConversation("You", "Just one more scroll...", "Phone",
                                   "*infinite feed of doom*");
    this.time.advance(hours);
  }

  handleRoommateInteraction() {
    const responses = [
      {
        sprite1 : "You",
        msg1 : "Hey, how's it going?",
        sprite2 : "Roommate",
        msg2 : "It's been a long week, ngl."
      },
      {
        sprite1 : "Roommate",
        msg1 : "Did you finish that problem set?",
        sprite2 : "You",
        msg2 : "Not yet, maybe tonight..."
      },
      {
        sprite1 : "You",
        msg1 : "Want to grab food later?",
        sprite2 : "Roommate",
        msg2 : "Yeah, I could use a break."
      },
      {
        sprite1 : "Roommate",
        msg1 : "Dude, the AC is killing me.",
        sprite2 : "You",
        msg2 : "Tell me about it..."
      },
      {
        sprite1 : "You",
        msg1 : "What's up?",
        sprite2 : "Roommate",
        msg2 : "Just vibing. You?"
      }
    ];

    const random = responses[Math.floor(Math.random() * responses.length)];
    this.player.interactRoommate();
    this.response.showConversation(random.sprite1, random.msg1, random.sprite2,
                                   random.msg2);
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

    const random =
        studyResponses[Math.floor(Math.random() * studyResponses.length)];
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

  evaluateFinals() { this.checkEndings(true); }

  checkEndings(force = false) {
    if (!force && this.time.week < 7)
      return;

    const stats = [
      this.player.food.getValue(), this.player.water.getValue(),
      this.player.sleep.getValue(), this.player.sanity.getValue(),
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

export {Game};
