const sourceText = "hello world";
const sourceTokens = sourceText.split(/( |\n)/g);

let typedText = "hel ";
const typedTokens = typedText.split(/( |\n)/g);

let correct = 0;
let incorrect = 0;
let extra = 0;
let missed = 0;

for (let i = 0; i < typedTokens.length; i++) {
  const srcToken = sourceTokens[i];
  const typedToken = typedTokens[i];
  
  if (srcToken === undefined) {
    extra += typedToken.length;
    continue;
  }
  
  const isActive = i === typedTokens.length - 1;
  
  for (let j = 0; j < Math.max(srcToken.length, typedToken.length); j++) {
    const sChar = srcToken[j];
    const tChar = typedToken[j];
    
    if (tChar === undefined) {
      if (!isActive) {
        missed++;
      }
    } else if (sChar === undefined) {
      extra++;
    } else if (tChar === sChar) {
      correct++;
    } else {
      incorrect++;
    }
  }
}

console.log({correct, incorrect, extra, missed});
