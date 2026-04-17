export interface AutoResponderEntry {
  userId: string;
  username: string;
  response: string;
}

export interface autoResponderData {
  [userId: string]: AutoResponderEntry;
}