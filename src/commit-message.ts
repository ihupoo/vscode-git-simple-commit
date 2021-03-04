
export class CommitMessage {
  private _type: string = '';
  private _scope: string = '';
  private _subject: string = '';
  private _body: string = '';
  private _breakChange: string = '';
  private _footer: string = '';

  get type() {
    return this._type;
  }

  set type(input: string) {
    this._type = input.trim();
  }

  get scope() {
    return this._scope;
  }

  set scope(input: string) {
    this._scope = input.trim();
  }

  get subject() {
    return this._subject;
  }

  set subject(input: string) {
    this._subject = input.trim();
  }

  get body() {
    return this._body;
  }

  set body(input: string) {
    this._body = input.trim();
  }

  get breakChange() {
    return this._breakChange;
  }

  set breakChange(input: string) {
    this._breakChange = input.trim();
  }

  get footer() {
    return this._footer;
  }

  set footer(input: string) {
    this._footer = input.trim();
  }
}



export function serializeHeader(partialCommitMessage: {
  type: string;
  scope: string;
  subject: string;
}) {
  let result = '';
  result += partialCommitMessage.type;
  const { scope, subject } = partialCommitMessage;
  if (scope) {
    result += `(${scope})`;
  }
  result += `: ${subject}`;
  return result;
}

export function serialize(commitMessage: CommitMessage) {
  let message = serializeHeader(commitMessage);
  const { body, footer, breakChange } = commitMessage;
  if (breakChange) {
    message += `\n\nBREAKING CHANGE: ${breakChange}`;
  }
  if (body) {
    message += `\n\n${body}`;
  }
  if (footer) {
    message += `\n\n${footer}`;
  }
  return message;
}
