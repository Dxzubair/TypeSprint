const sourceText = "hello world";
const typedText = "hellox";

const typedTokensForTarget = typedText.split(/( |\n)/g);
const sourceTokensForTarget = sourceText.split(/( |\n)/g);
const activeTargetToken = sourceTokensForTarget[typedTokensForTarget.length - 1];
const activeTypedToken = typedTokensForTarget[typedTokensForTarget.length - 1];
let currentTargetChar = (activeTargetToken !== undefined && activeTypedToken !== undefined) 
  ? activeTargetToken[activeTypedToken.length] 
  : undefined;
if (currentTargetChar === undefined) {
  currentTargetChar = sourceTokensForTarget[typedTokensForTarget.length];
}
if (currentTargetChar === undefined) currentTargetChar = null;

console.log({ currentTargetChar });
