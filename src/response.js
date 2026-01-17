/**
 * ResponseManager handles displaying system responses and conversations
 * after player decisions
 */
import { generateAndPlayTTS } from "./ai.js";

class ResponseManager {
  constructor() {
    this.currentResponse = null;
    this.responseQueue = [];
    this.isDisplaying = false;
    this.startTime = null;
    this.fadeInDuration = 300; // ms
    this.fadeOutDuration = 300; // ms
    this.holdDuration = 2000; // ms to hold after appearing
    this.requiresAcknowledge = false; // Whether Enter is required to dismiss
    this.onDismiss = null; // Callback when response is dismissed
  }

  /**
   * Show a system response (e.g., "You ate at DAKA and gained 30 food")
   * @param {string} message - The message to display
   * @param {boolean} requiresAcknowledge - If true, user must press Enter to dismiss
   */
  showSystemResponse(message, requiresAcknowledge = false) {
    this.responseQueue.push({
      type: "system",
      message: message,
      requiresAcknowledge: requiresAcknowledge
    });
    this.processQueue();
  }

  /**
   * Show a conversation between sprites
   * @param {string} sprite1Name - Name of first speaker
   * @param {string} sprite1Message - What they say
   * @param {string} sprite2Name - Name of second speaker
   * @param {string} sprite2Message - What they say
   * @param {boolean} requiresAcknowledge - If true, user must press Enter to dismiss
   */
  showConversation(sprite1Name, sprite1Message, sprite2Name, sprite2Message, requiresAcknowledge = true) {
    this.responseQueue.push({
      type: "conversation",
      sprite1Name: sprite1Name,
      sprite1Message: sprite1Message,
      sprite2Name: sprite2Name,
      sprite2Message: sprite2Message,
      requiresAcknowledge: requiresAcknowledge,
      npcMessage: sprite1Name === "You" ? sprite2Message : sprite1Message,
      npcName: sprite1Name === "You" ? sprite2Name : sprite1Name
    });
    this.processQueue();
  }

  /**
   * Show a single-sprite dialogue
   * @param {string} spriteName - Name of speaker
   * @param {string} message - What they say
   * @param {boolean} requiresAcknowledge - If true, user must press Enter to dismiss
   */
  showDialogue(spriteName, message, requiresAcknowledge = true) {
    this.responseQueue.push({
      type: "dialogue",
      spriteName: spriteName,
      message: message,
      requiresAcknowledge: requiresAcknowledge,
      npcMessage: spriteName !== "You" ? message : null,
      npcName: spriteName !== "You" ? spriteName : null
    });
    this.processQueue();
  }

  processQueue() {
    if (this.isDisplaying || this.responseQueue.length === 0) return;

    this.currentResponse = this.responseQueue.shift();
    this.isDisplaying = true;
    this.startTime = Date.now();
    this.requiresAcknowledge = this.currentResponse.requiresAcknowledge;

    // Generate and play TTS for NPC dialogue (not for player messages)
    if (this.currentResponse.npcMessage) {
      generateAndPlayTTS(this.currentResponse.npcMessage).catch(err => {
        console.log("TTS generation skipped or failed:", err);
      });
    }
    this.requiresAcknowledge = this.currentResponse.requiresAcknowledge;
  }

  getProgress() {
    if (!this.isDisplaying || !this.startTime) return 0;
    
    const elapsed = Date.now() - this.startTime;
    const totalDuration = this.fadeInDuration + this.holdDuration + this.fadeOutDuration;

    if (this.requiresAcknowledge && elapsed > this.fadeInDuration + this.holdDuration) {
      // Show "Press Enter" prompt
      return 1; // Fully visible
    }

    if (elapsed < this.fadeInDuration) {
      return elapsed / this.fadeInDuration; // Fade in
    } else if (elapsed < this.fadeInDuration + this.holdDuration) {
      return 1; // Hold
    } else if (elapsed < totalDuration) {
      return (totalDuration - elapsed) / this.fadeOutDuration; // Fade out (unless requires acknowledge)
    }

    return 0;
  }

  update() {
    if (!this.isDisplaying || !this.currentResponse) return;

    const elapsed = Date.now() - this.startTime;
    const totalDuration = this.fadeInDuration + this.holdDuration + this.fadeOutDuration;

    // Auto-dismiss after animation completes if doesn't require acknowledge
    if (!this.requiresAcknowledge && elapsed >= totalDuration) {
      this.dismiss();
    }
  }

  handleKeyPress(key) {
    if (!this.isDisplaying || !this.requiresAcknowledge) return;

    const elapsed = Date.now() - this.startTime;
    const readyTime = this.fadeInDuration + this.holdDuration;

    if (key === "Enter" && elapsed >= readyTime) {
      this.dismiss();
    }
  }

  dismiss() {
    this.isDisplaying = false;
    this.currentResponse = null;
    if (this.onDismiss) this.onDismiss();
    this.processQueue();
  }

  draw(ctx, width, height) {
    if (!this.isDisplaying || !this.currentResponse) return;

    const progress = this.getProgress();
    if (progress <= 0) return;

    const response = this.currentResponse;
    
    // Make dialogue box about 1/2 screen width, centered
    const boxWidth = width * 0.5;
    const boxX = (width - boxWidth) / 2;
    
    // Dynamically size dialogue box based on content
    let boxHeight = 120;
    if (response.type === "conversation") {
      boxHeight = 180;
    } else if (response.type === "dialogue" || response.type === "system") {
      // Measure text to determine needed height
      ctx.font = "16px sans-serif";
      const testMessage = response.message || (response.spriteName ? response.spriteName + ": " + response.message : "");
      const lines = this.wrapText(testMessage, boxWidth - 80, ctx);
      boxHeight = 60 + (lines.length * 25) + 20;
    }
    
    // Position box at bottom middle of screen
    const boxY = height - boxHeight - 20;

    // Apply fade effect
    const alpha = progress;

    // Semi-transparent background
    ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * alpha})`;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Border
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * alpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    ctx.fillStyle = "white";
    ctx.font = "18px sans-serif";
    ctx.globalAlpha = alpha;

    if (response.type === "system") {
      ctx.font = "20px sans-serif";
      ctx.fillStyle = "#FFD700"; // Gold for system messages
      const lines = this.wrapText(response.message, boxWidth - 80, ctx);
      lines.forEach((line, i) => {
        ctx.fillText(line, boxX + 20, boxY + 40 + i * 30);
      });
    } else if (response.type === "dialogue") {
      ctx.fillStyle = "#87CEEB"; // Sky blue for dialogue
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(response.spriteName + ":", boxX + 20, boxY + 35);

      ctx.fillStyle = "white";
      ctx.font = "16px sans-serif";
      const lines = this.wrapText(response.message, boxWidth - 80, ctx);
      lines.forEach((line, i) => {
        ctx.fillText(line, boxX + 40, boxY + 60 + i * 25);
      });
    } else if (response.type === "conversation") {
      // First sprite
      ctx.fillStyle = "#87CEEB";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(response.sprite1Name + ":", boxX + 20, boxY + 30);

      ctx.fillStyle = "white";
      ctx.font = "14px sans-serif";
      ctx.fillText('"' + response.sprite1Message + '"', boxX + 40, boxY + 55);

      // Second sprite
      ctx.fillStyle = "#FF69B4"; // Hot pink for second speaker
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(response.sprite2Name + ":", boxX + 20, boxY + 100);

      ctx.fillStyle = "white";
      ctx.font = "14px sans-serif";
      ctx.fillText('"' + response.sprite2Message + '"', boxX + 40, boxY + 125);
    }

    ctx.globalAlpha = 1;

    // Show "Press Enter" prompt if waiting for acknowledge
    if (this.requiresAcknowledge) {
      const elapsed = Date.now() - this.startTime;
      const readyTime = this.fadeInDuration + this.holdDuration;

      if (elapsed >= readyTime) {
        // Blinking "Press Enter" text
        const blinkCycle = 1000; // ms
        const blinkProgress = (elapsed - readyTime) % blinkCycle;
        const shouldShow = blinkProgress < 500;

        if (shouldShow) {
          ctx.fillStyle = "#FFFF00";
          ctx.font = "italic 14px sans-serif";
          ctx.fillText("[Press Enter to continue]", boxX + (boxWidth / 2) - 120, boxY - 10);
        }
      }
    }
  }

  wrapText(text, maxWidth, ctx) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? currentLine + " " + word : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  isActive() {
    return this.isDisplaying || this.responseQueue.length > 0;
  }
}

export { ResponseManager };
