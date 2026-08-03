import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TrueFalse({ exercise, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const options = exercise.options || [
    { id: 'true', text: 'True', isCorrect: exercise.correctAnswer === 'true' },
    { id: 'false', text: 'False', isCorrect: exercise.correctAnswer === 'false' }
  ];

  const handleSelect = (option) => {
    if (submitted || disabled) return;
    setSelected(option);
    
    setSubmitted(true);
    setTimeout(() => {
      onAnswer(option.id, option.isCorrect);
    }, 1200);
  };

  const getOptionStyle = (option) => {
    if (!submitted) {
      return selected?.id === option.id
        ? option.text === 'True' 
          ? 'border-primary bg-primary-light ring-2 ring-primary/30'
          : 'border-red bg-red-50 ring-2 ring-red/30'
        : option.text === 'True'
          ? 'border-gray-200 bg-white hover:border-primary/50'
          : 'border-gray-200 bg-white hover:border-red/50';
    }
    
    if (option.isCorrect) {
      return 'border-primary bg-primary text-white';
    }
    if (selected?.id === option.id && !option.isCorrect) {
      return 'border-red bg-red text-white';
    }
    return 'border-gray-200 bg-gray-50 opacity-50';
  };

  return (
    <div className="flex flex-col h-full px-4">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-dark mb-6"
      >
        {exercise.prompt}
      </motion.h2>

      <div className="flex-1 flex flex-col gap-4 justify-center">
        {options.map((option, idx) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.15 }}
            whileTap={!submitted ? { scale: 0.95 } : {}}
            onClick={() => handleSelect(option)}
            disabled={submitted || disabled}
            className={`w-full py-5 rounded-2xl border-2 text-center transition-all duration-300 ${getOptionStyle(option)}`}
          >
            <span className={`text-lg font-bold ${submitted && option.isCorrect ? 'text-white' : submitted && selected?.id === option.id ? 'text-white' : option.text === 'True' ? 'text-primary' : 'text-red'}`}>
              {option.text}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}