import { audioSynth } from './src/utils/audio';

console.log("Testing audioSynth types...");

try {
  const types: any[] = ['cherry_mx_blue', 'linear_red', 'silent_tactile', 'topre', 'buckling_spring', 'mechanical', 'chiclet', 'typewriter'];
  for (const t of types) {
    audioSynth.playClick(t);
    audioSynth.playDynamicClick('A', t);
    audioSynth.playDynamicClick(' ', t);
    audioSynth.playDynamicClick('Enter', t);
    audioSynth.playDynamicClick('Backspace', t);
    console.log(`Successfully simulated ${t}`);
  }
} catch(e) {
  console.error("Error during playback:", e);
}
console.log("Done");
