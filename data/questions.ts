
import { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    subject: 'Science',
    topic: 'Solar System',
    question: 'Saur mandal ka sabse bada grah kaun sa hai?',
    options: ['Prithvi', 'Mangal', 'Brihaspati', 'Shani'],
    answer: 2,
    explanation: 'Brihaspati (Jupiter) hamare saur mandal ka sabse vishalkaya grah hai.'
  },
  {
    id: 2,
    subject: 'History',
    topic: 'India',
    question: 'Bharat kab azad hua tha?',
    options: ['1942', '1947', '1950', '1930'],
    answer: 1,
    explanation: '15 August 1947 ko Bharat British shasan se azad hua tha.'
  },
  {
    id: 3,
    subject: 'Mathematics',
    topic: 'Geometry',
    question: 'Ek triangle ke sabhi angles ka jod kitna hota hai?',
    options: ['90°', '180°', '360°', '270°'],
    answer: 1,
    explanation: 'Kisi bhi tribhuj (triangle) ke teeno konon ka yog hamesha 180 degree hota hai.'
  },
  {
    id: 4,
    subject: 'GK',
    topic: 'Geography',
    question: 'Bharat ki rajdhani kya hai?',
    options: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'],
    answer: 2,
    explanation: 'New Delhi Bharat ki rajdhani hai.'
  },
  {
    id: 5,
    subject: 'Science',
    topic: 'Biology',
    question: 'Hamare shareer mein kitni haddiya hoti hain?',
    options: ['200', '206', '210', '198'],
    answer: 1,
    explanation: 'Ek vayask manushya ke shareer mein 206 haddiya hoti hain.'
  },
  {
    id: 6,
    subject: 'English',
    topic: 'Grammar',
    question: 'Apple ka plural word kya hai?',
    options: ['Apples', 'Applees', 'Applis', 'Appless'],
    answer: 0,
    explanation: 'Apple ka plural Apples hota hai.'
  }
];
