export function speakText(
  text: string,
  rate = 0.9,
  pitch = 1,
  volume = 1
) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Stop previous speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;     // Speed
  utterance.pitch = pitch;   // Tone
  utterance.volume = volume; // Loudness
  utterance.lang = 'en-US';

  window.speechSynthesis.speak(utterance);
}
