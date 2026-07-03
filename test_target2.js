const sourceText = "hello world";
const typedText = "hello";

const typedTokensForTarget = typedText.split(/( |\n)/g);
const sourceTokensForTarget = sourceText.split(/( |\n)/g);
const activeTargetToken = sourceTokensForTarget[typedTokensForTarget.length - 1];
const activeTypedToken = typedTokensForTarget[typedTokensForTarget.length - 1];
let currentTargetChar = activeTargetToken && activeTypedToken ? activeTargetToken[activeTypedToken.length] : undefined;
if (currentTargetChar === undefined) {
  currentTargetChar = sourceTokensForTarget[typedTokensForTarget.length];
}
if (currentTargetChar === undefined) currentTargetChar = null;

console.log({ currentTargetChar });
