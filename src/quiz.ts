import { Question } from './quizParser';
import { getUserState, setUserState } from './userState';

let questions: Question[] = [];

export function startQuiz(loadedQuestions: Question[]) {
  questions = loadedQuestions;
}

export function getNextQuestion(userId: string): Question | null {
  const userState = getUserState(userId);
  if (userState.currentQuestionIndex < questions.length) {
    const nextQuestion = questions[userState.currentQuestionIndex];
    setUserState(userId, {
      ...userState,
      currentQuestionIndex: userState.currentQuestionIndex + 1,
      currentQuestion: nextQuestion
    });
    return nextQuestion;
  }
  return null;
}

export function checkAnswer(userAnswer: string, question: Question): boolean {
  if (question.type === 'выбрать') {
    return question.answers.includes(userAnswer);
  } else if (question.type === 'сопоставить') {
    // Логика проверки для вопросов на сопоставление
    // ...
  }
  return false;
}
