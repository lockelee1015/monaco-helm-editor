//检测是否在{{}}之中
function isInsideBrackets(currentLine: string, position: number): boolean {
  const prefix = currentLine.substring(0, position);
  return isBracketsInPrefix(prefix);
}

function getWordAt(str: string, pos: number): string {
  const left = str.slice(0, pos + 1).search(/\S+$/);
  return str.slice(left, pos + 1);
}

/**
 * Checks whether string before cursor contains'{{' or not
 */
function isBracketsInPrefix(prefix: string): boolean {
  let prevChar = '';
  for (let index = prefix.length - 1; index >= 0; index--) {
    if (prefix.charAt(index) === '}') {
      return false;
    }
    if (prefix.charAt(index) === '{' && prevChar === '{') {
      return true;
    }
    prevChar = prefix.charAt(index);
  }
  return false;
}

export default {
  isInsideBrackets, getWordAt
}
