import * as fs from 'fs';
import * as path from 'path';

export type QuestionType = 'выбрать' | 'сопоставить';
export type Question = {
  type: QuestionType;
  text: string;
  options: string[];
  answers: string[];
};

export function parseQuizFile(filePath: string): Question[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const questionBlocks = fileContent.split('---').map(block => block.trim()).filter(block => block);

  const questions: Question[] = questionBlocks.map(block => {
    const lines = block.split('\n').map(line => line.trim()).filter(line => line);
    
    const typeLine = lines.find(line => line.startsWith('Тип:'))?.split(': ')[1] as QuestionType;
    const questionLine = lines.find(line => line.startsWith('Вопрос:'))?.split(': ')[1] || '';

    const optionsStartIndex = lines.findIndex(line => line.startsWith('Варианты:')) + 1;
    const datesStartIndex = lines.findIndex(line => line.startsWith('Даты:')) + 1;

    let options: string[] = [];
    if (optionsStartIndex > 0 && optionsStartIndex < lines.length) {
      for (let i = optionsStartIndex; i < lines.length; i++) {
        if (lines[i].startsWith('Ответы:') || lines[i].startsWith('Даты:')) break;
        options.push(lines[i].split(') ')[1] || lines[i]);
      }
    }

    if (typeLine === 'сопоставить' && datesStartIndex > 0 && datesStartIndex < lines.length) {
      for (let i = datesStartIndex; i < lines.length; i++) {
        if (lines[i].startsWith('Ответы:')) break;
        options.push(lines[i]);
      }
    }

    const answersLine = lines.find(line => line.startsWith('Ответы:'))?.split(': ')[1] || '';
    const answers = answersLine.split(',').map(answer => answer.trim());

    return {
      type: typeLine,
      text: questionLine,
      options,
      answers,
    };
  });

  return questions;
}
