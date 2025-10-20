'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChatSection } from '@/components/ia-quiz/ChatSection';
import { QuizSection } from '@/components/ia-quiz/QuizSection';
import { Header } from '@/components/layout/Header';

export default function IAQuizPage() {
  const [activeSection, setActiveSection] = useState<'ia' | 'quiz'>('ia');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-muted p-1 rounded-lg flex gap-2">
            <Button onClick={() => setActiveSection('ia')} variant={activeSection === 'ia' ? 'default' : 'ghost'}>IA</Button>
            <Button onClick={() => setActiveSection('quiz')} variant={activeSection === 'quiz' ? 'default' : 'ghost'}>Quiz</Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'ia' ? <ChatSection /> : <QuizSection />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
