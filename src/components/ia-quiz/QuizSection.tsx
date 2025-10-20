'use client';

import { useState, useEffect, useRef } from 'react';
import { flashcards, mcqs } from '@/lib/quiz-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { BookOpen, ListChecks, Check, X } from 'lucide-react';

const shuffleArray = (array: any[]) => {
  return array.sort(() => Math.random() - 0.5);
};

export function QuizSection() {
  const [quizType, setQuizType] = useState<'flashcard' | 'mcq' | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [qcmHoverState, setQcmHoverState] = useState<'initial' | 'check' | 'x'>('initial');

  const handleQcmMouseEnter = () => {
    setQcmHoverState('check');
    setTimeout(() => {
      setQcmHoverState('x');
    }, 500);
  };

  const handleQcmMouseLeave = () => {
    setQcmHoverState('initial');
  };

  useEffect(() => {
    if (quizType && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizType, isPaused]);

  const startQuiz = (type: 'flashcard' | 'mcq') => {
    setQuizType(type);
    setQuestions(shuffleArray(type === 'flashcard' ? flashcards : mcqs));
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowAnswer(false);
    setIsCorrect(null);
    setTimer(0);
    setIsPaused(false);
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correctAnswer = questions[currentQuestionIndex].answer;
    if (answer === correctAnswer) {
      setScore(score + 1);
      setIsCorrect(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setIsCorrect(false);
    }
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    setShowAnswer(false);
    setIsCorrect(null);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setIsPaused(false);
  };

  const stopQuiz = () => {
    setQuizType(null);
  };

  if (!quizType) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-8">Choisissez votre mode de quiz</h2>
        <div className="flex gap-8">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
            <Button 
              onClick={() => startQuiz('flashcard')}
              className="flex flex-col items-center justify-center w-64 h-64 rounded-xl shadow-lg transition-all hover:scale-105"
              variant="outline"
            >
              <BookOpen className="h-32 w-32 mb-2" />
              <span className="text-xl font-semibold">Flashcards</span>
            </Button>
          </motion.div>
          <Button 
            onClick={() => startQuiz('mcq')}
            className={`flex flex-col items-center justify-center w-64 h-64 rounded-xl shadow-lg transition-all hover:scale-105 ${qcmHoverState === 'check' ? 'bg-green-500 text-white' : qcmHoverState === 'x' ? 'bg-red-500 text-white' : ''}`}
            variant="outline"
            onMouseEnter={handleQcmMouseEnter}
            onMouseLeave={handleQcmMouseLeave}
          >
            {qcmHoverState === 'check' && <Check className="h-48 w-96 mb-5" />}
            {qcmHoverState === 'x' && <X className="h-48 w-96 mb-5" />}
            {qcmHoverState === 'initial' && <ListChecks className="h-48 w-96 mb-5" />}
            <span className="text-xl font-semibold">QCM</span>
          </Button>
        </div>
      </div>
    );
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Quiz terminé !</h2>
        <p className="text-lg mb-8">Votre score : {score} / {questions.length}</p>
        <p className="text-lg mb-8">Temps : {new Date(timer * 1000).toISOString().substr(14, 5)}</p>
        <Button onClick={() => setQuizType(null)}>Recommencer</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="relative">
      {showConfetti && <Confetti numberOfPieces={5000} recycle={true} />}
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold">Score: {score}</p>
        <p className="text-lg font-semibold">Temps : {new Date(timer * 1000).toISOString().substr(14, 5)}</p>
      </div>
      <AnimatePresence>
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Question {currentQuestionIndex + 1} / {questions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              {quizType === 'flashcard' ? (
                <div>
                  <motion.div
                    className="relative w-full h-64 [transform-style:preserve-3d] cursor-pointer"
                    animate={{ rotateY: showAnswer ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    onClick={() => { setShowAnswer(!showAnswer); setIsPaused(true); }}
                  >
                    <div className="absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center bg-card border rounded-lg p-4">
                      <p className="text-lg font-semibold text-center">{currentQuestion.question}</p>
                    </div>
                    <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center bg-card border rounded-lg p-4">
                      <p className="text-lg text-center">{currentQuestion.answer}</p>
                    </div>
                  </motion.div>
                  {showAnswer && isCorrect === null && (
                    <div className="mt-4 flex justify-center gap-4">
                      <Button onClick={() => { setIsCorrect(false); nextQuestion(); }} variant="outline">J'ai eu tort</Button>
                      <Button onClick={() => { setScore(score + 1); setIsCorrect(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); nextQuestion(); }}>J'ai eu raison</Button>
                    </div>
                  )}
                  {/* Removed the redundant "Next Question" button for flashcards */}
                </div>
              ) : (
                <div>
                  <p className="text-lg font-semibold mb-4">{currentQuestion.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {currentQuestion.options.map((option: string, index: number) => (
                      <Button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={showAnswer}
                        className={
                          showAnswer
                            ? option === currentQuestion.answer
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : option === selectedAnswer
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'text-foreground'
                            : ''
                        }
                        variant={'outline'}>
                        {option}
                      </Button>
                    ))}
                  </div>
                  {showAnswer && (
                    <div className="mt-4 flex justify-center">
                      <Button onClick={nextQuestion}>Question suivante</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline">{isPaused ? 'Continuer' : 'Pause'}</Button>
        <Button onClick={stopQuiz} variant="destructive">Arrêter</Button>
      </div>
    </div>
  );
}
