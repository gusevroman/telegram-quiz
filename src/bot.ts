import * as dotenv from 'dotenv';
dotenv.config();  // Загружаем переменные окружения

import { Telegraf, Context, Markup } from 'telegraf';
import { parseQuizFile } from './quizParser';
import { startQuiz, getNextQuestion, checkAnswer } from './quiz';
import * as path from 'path';
import { UserState, initializeUserState, getUserState, setUserState } from './userState';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is required in the environment variables.");
}

const bot = new Telegraf(BOT_TOKEN);
console.log(bot);

// Загрузка вопросов из файла
const questions = parseQuizFile(path.join(__dirname, 'quiz-questions-answers.txt'));
startQuiz(questions);
console.log(questions);

bot.start((ctx) => {
  console.log('Получена команда /start');
  ctx.reply('Добро пожаловать в викторину ЕГЭ! Напишите /quiz, чтобы начать.');
});

bot.command('quiz', (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    ctx.reply('Ошибка: не удалось определить пользователя.');
    return;
  }

  initializeUserState(userId);
  const question = getNextQuestion(userId);
  
  if (question) {
    let questionText = `Вопрос: ${question.text}\n`;
    
    if (question.type === 'выбрать') {
      const keyboard = Markup.inlineKeyboard(
        question.options.map((option, index) => 
          [Markup.button.callback(option, `answer_${index + 1}`)]
        )
      );
      
      ctx.reply(questionText, keyboard);
    } else if (question.type === 'сопоставить') {
      // Для вопросов на сопоставление можно использовать другой формат кнопок
      // или оставить текстовый ввод
      questionText += question.options.map((option, index) => 
        `${index + 1}) ${option}`
      ).join('\n');
      
      ctx.reply(questionText);
    } else {
      ctx.reply(questionText);
    }
  } else {
    ctx.reply('Вопросы закончились!');
  }
});

// Обработчик нажатий на кнопки
bot.action(/^answer_/, (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    ctx.answerCbQuery('Ошибка: не удалось определить пользователя.');
    return;
  }

  const userState = getUserState(userId);
  if (!userState.currentQuestion) {
    ctx.answerCbQuery('Ошибка: текущий вопрос не найден.');
    return;
  }

  const answer = ctx.match[0].split('_')[1];
  const isCorrect = checkAnswer(answer, userState.currentQuestion);

  if (isCorrect) {
    ctx.answerCbQuery('Правильно!');
    const nextQuestion = getNextQuestion(userId);
    if (nextQuestion) {
      // Отправляем следующий вопрос
      // (здесь нужно повторить логику отправки вопроса с кнопками)
    } else {
      ctx.reply('Поздравляем! Вы ответили на все вопросы.');
    }
  } else {
    ctx.answerCbQuery('Неправильно. Попробуйте ещё раз.');
  }
});

bot.on('message', (ctx) => {
  if ('text' in ctx.message) {
    console.log('Получено сообщение:', ctx.message.text);
    try {
      const userId = ctx.from?.id.toString();
      if (!userId) {
        ctx.reply('Ошибка: не удалось определить пользователя.');
        return;
      }

      const userAnswer = ctx.message.text;
      const userState = getUserState(userId);

      if (!userState.currentQuestion) {
        ctx.reply('Пожалуйста, начните викторину с команды /quiz');
        return;
      }

      const isCorrect = checkAnswer(userAnswer, userState.currentQuestion);
      if (isCorrect) {
        ctx.reply('Правильно!');
        const nextQuestion = getNextQuestion(userId);
        if (nextQuestion) {
          let questionText = `Следующий вопрос: ${nextQuestion.text}\n`;
          if (nextQuestion.type === 'выбрать' || nextQuestion.type === 'сопоставить') {
            nextQuestion.options.forEach((option, index) => {
              questionText += `${index + 1}) ${option}\n`;
            });
          }
          ctx.reply(questionText);
        } else {
          ctx.reply('Поздравляем! Вы ответили на все вопросы.');
        }
      } else {
        ctx.reply('Неправильно. Попробуйте ещё раз.');
      }
    } catch (error) {
      console.error('Ошибка при обработке сообщения:', error);
      ctx.reply('Произошла ошибка при обработке вашего ответа. Пожалуйста, попробуйте еще ра��.');
    }
  } else {
    console.log('Получено нетекстовое сообщение');
    // Обработка нетекстовых сообщений, если нужно
  }
});

bot.launch().then(() => {
  console.log('Бот успешно запущен и готов к работе');
}).catch((error) => {
  console.error('Ошибка при запуске бота:', error);
});
