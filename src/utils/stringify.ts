// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (Array.isArray(token)) {
    return `[${token.map(stringify).join(', ')}]`;
  }

  if (token == null) {
    return '' + token;
  }

  const name = token.overriddenName || token.name;
  if (name) {
    return `${name}`;
  }

  const result = token.toString();

  if (result == null) {
    return '' + result;
  }

  const newLineIndex = result.indexOf('\n');
  return newLineIndex >= 0 ? result.slice(0, newLineIndex) : result;
}
