import { useState } from 'react';
import { motion } from 'framer-motion';

export default function FillBlank({ exercise, onAnswer, disabled }) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim() || submitted || disabled) return;
    
    const correct = exercise.correctAnswer?.toLowerCase().trim() === answer.toLowerCase().trim();
    setIsCorrect(correct);
    setSubmitted(true);
    
    setTimeout(() => {
      onAnswer(answer, correct);
    }, 1500);
  };

  const template = exercise.sentenceTemplate || exercise.prompt;
  const parts = template.split('___');

  return (
    <div className="flex flex-col h-full px-4">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-dark mb-6"
      >
        {exercise.prompt}
      </motion.h2>

      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <p className="text-lg text-dark leading-relaxed text-center">
            {parts.map((part, idx) => (
              <span key={idx}>
                {part}
                {idx < parts.length - 1 && (
                  <span className={`inline-block min-w-[80px] mx-1 px-2 py-1 rounded-lg border-b-2 text-center font-bold ${
                    submitted 
                      ? isCorrect 
                        ? 'border-primary text-primary bg-primary-light' 
                        : 'border-red text-red bg-red-50'
                      : 'border-primary text-primary'
                  }`}>
                    {submitted ? answer : '...'}
                  </span>
                )}
              </span>
            ))}
          </p>
        </motion.div>

        {!submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={disabled}
              className="w-full h-14 px-4 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-center text-lg font-medium transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </motion.div>
        )}

        {submitted && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100"
          >
            <p className="text-red font-medium text-center">
              Correct answer: <span className="font-bold">{exercise.correctAnswer}</span>
            </p>
          </motion.div>
        )}
      </div>

      {!submitted && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!answer.trim() || disabled}
          className="mt-4 w-full h-[52px] bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-button transition-colors"
        >
          Check
        </motion.button>
      )}
    </div>
  );
}