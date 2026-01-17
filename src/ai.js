const GEMINI_KEY = "AIzaSyBX9kkPu1azlHqNexBcVFxO6846ryC0dg8";
const ELEVENLABS_KEY = "sk_cb8f778f7a65a8b35f4dac2da799fd9424c2e3f4dc2838c8";

let latestAudioUrl = null;

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

export async function generate_tts(message) {
    const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/goT3UYdM9bhm0n2lmKQx",
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

    const audioBlob = await response.blob();
    latestAudioUrl = URL.createObjectURL(audioBlob);
}

export function play_latest_audio() {
  if (!latestAudioUrl) {
    console.warn("No audio generated yet.");
    return;
  }

  const audio = new Audio(latestAudioUrl);
  audio.play();
}

export async function generateAndPlayTTS(message) {
  try {
    await generate_tts(message);
    play_latest_audio();
  } catch (error) {
    console.error("Error generating or playing TTS:", error);
  }
}
