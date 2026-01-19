const GEMINI_KEY = "AIzaSyBX9kkPu1azlHqNexBcVFxO6846ryC0dg8";
const ELEVENLABS_KEY = "sk_cb8f778f7a65a8b35f4dac2da799fd9424c2e3f4dc2838c8";

let latestAudioUrl = null;

// Persistent character voice assignments (once assigned, voice doesn't change)
const characterVoices = {};

// Voice IDs for different character types
const VOICE_IDS = {
  // Female student/girl voices - using ElevenLabs standard voices
  female_student: [
    "21m00Tcm4TlvDq8ikWAM", // Rachel (clear, young female)
    "EXAVITQu4vr4xnSDxMaL", // Bella (warm, friendly female)
    "IKne3meq5aSrNMjlSFVF"  // Maria (energetic female)
  ],
  // Male student voices - using ElevenLabs standard voices
  male_student: [
    "pFZP5JQG7iQjIQuC4Oy5", // Bill (casual male)
    "TxGEqnHWrfWFTfGW9XjX"  // James (deep male)
  ],
  // Professor/older adult voices - using ElevenLabs standard voices
  professor: [
    "nPczCjzI2devNBz1zQrb", // George (older, measured male)
    "pFZP5JQG7iQjIQuC4Oy5"  // Bill (authoritative male)
  ],
  // Roommate - consistent voice - using standard voice
  roommate: "TxGEqnHWrfWFTfGW9XjX" // James (friendly male)
};

// Map character names to voice types
function getVoiceType(characterName) {
  const name = characterName.toLowerCase();
  
  // Roommate always has the same voice
  if (name === "roommate") {
    return "roommate";
  }
  
  // Professors
  if (name.includes("prof") || name.includes("professor") || 
      name === "chen" || name === "martinez" || name === "johnson") {
    return "professor";
  }
  
  // Female students/classmates
  if (name === "jessica" || name === "maya" || name === "sophie" || 
      name === "rachel" || name === "olivia" || name === "emma" || 
      name === "sarah" || name === "alex" || name === "jordan" || 
      name === "taylor") {
    return "female_student";
  }
  
  // Male classmates
  if (name === "classmate" || name === "friend" || name === "chris" || 
      name === "conrad") {
    return "male_student";
  }
  
  // Default to female student for generic classmates
  return "female_student";
}

// Get a consistent voice ID for the character (randomly assigned on first use, then persisted)
function getVoiceId(characterName) {
  // Check if character already has an assigned voice
  if (characterVoices[characterName]) {
    return characterVoices[characterName];
  }
  
  const voiceType = getVoiceType(characterName);
  let voiceId;
  
  if (voiceType === "roommate") {
    // Roommate always gets the same voice
    voiceId = VOICE_IDS.roommate;
  } else {
    // Other characters get random voice from their type, then stored
    const voiceArray = VOICE_IDS[voiceType] || VOICE_IDS.female_student;
    voiceId = voiceArray[Math.floor(Math.random() * voiceArray.length)];
  }
  
  // Store the voice assignment for this character
  characterVoices[characterName] = voiceId;
  return voiceId;
}

export async function ask_gemini(message) {
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + GEMINI_KEY,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: message
                            }
                        ]
                    }
                ]
            })
        }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

export async function generate_tts(message, characterName = null) {
    // Validate message
    if (!message || message.trim().length === 0) {
      console.warn("Empty message provided to TTS, skipping.");
      return;
    }

    const voiceId = characterName ? getVoiceId(characterName) : "5GZaeOOG7yqLdoTRsaa6";
    
    try {
      const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "xi-api-key": ELEVENLABS_KEY,
                  "Accept": "audio/mpeg"
              },
              body: JSON.stringify({
                  text: message,
                  model_id: "eleven_flash_v2_5",
                  output_format: "mp3_44100_128"
              })
          }
      );

      // Check if response was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error ${response.status}:`, errorText);
        return;
      }

      const audioBlob = await response.blob();
      
      // Validate that we got audio data
      if (!audioBlob.type.includes("audio")) {
        console.error("Response was not audio data:", audioBlob.type);
        return;
      }

      latestAudioUrl = URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error("Error generating TTS:", error);
    }
}

export function play_latest_audio() {
  if (!latestAudioUrl) {
    console.warn("No audio generated yet.");
    return;
  }

  const audio = new Audio(latestAudioUrl);
  audio.play();
}

export async function generateAndPlayTTS(message, characterName = null) {
  try {
    await generate_tts(message, characterName);
    // Only play if we have a valid audio URL
    if (latestAudioUrl) {
      play_latest_audio();
    }
  } catch (error) {
    console.error("Error generating or playing TTS:", error);
  }
}
