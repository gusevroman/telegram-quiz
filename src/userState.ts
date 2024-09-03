import { Question } from './quizParser';

export interface UserState {
  currentQuestionIndex: number;
  currentQuestion: Question | null;
}

const userStates: { [userId: string]: UserState } = {};

export function initializeUserState(userId: string): void {
  userStates[userId] = { currentQuestionIndex: 0, currentQuestion: null };
}

export function getUserState(userId: string): UserState {
  return userStates[userId] || { currentQuestionIndex: 0, currentQuestion: null };
}

export function setUserState(userId: string, state: UserState): void {
  userStates[userId] = state;
}