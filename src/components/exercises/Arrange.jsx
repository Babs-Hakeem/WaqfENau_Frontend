import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Arrange({ exercise, onAnswer, disabled }) {
  const [available, setAvailable] = useState([...exercise.options].sort(() => Math.random() - 0.5));
  const [arranged, setArranged] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const handleAdd = (option) => {
    if (submitted || disabled) return;
    setAvailable(prev => prev.filter(o => o.id !== option.id));
    setArranged(prev => [...prev, option]);
  };

  const handleRemove = (index) => {
    if (submitted || disabled) return;
    const option = arranged[index];
    setArranged(prev => prev.filter((_, i) => i !== index));
    setAvailable(prev => [...prev, option]);
  };

  const handleSubmit = () => {
    if (arranged.length === 0 || submitted || disabled) return;
    
    const answerString = arranged.map(o => o.id).join(',');
    const correctString = exercise.options
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(o => o.id)
      .join(',');
    
    const correct = answerString === correctString;
    setSubmitted(true);
    
    setTimeout(() => {
      onAnswer(answerString, correct);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full px-4">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-dark mb-4"
      >
        {exercise.prompt}
      </motion.h2>

      <p className="text-sm text-gray mb-4">Arrange the words in the correct order:</p>

      <div className="min-h-[80px] bg-primary-light/50 rounded-2xl p-4 mb-4 flex flex-wrap gap-2 items-center justify-center border-2 border-dashed border-primary/30">
        {arranged.length === 0 ? (
          <span className="text-gray text-sm">Tap words below to arrange</span>
        ) : (
          arranged.map((option, idx) => (
            <motion.button
              key={`${option.id}-${idx}`}
              layout
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={!submitted ? { scale: 0.9 } : {}}
              onClick={() => handleRemove(idx)}
              disabled={submitted}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                submitted 
                  ? option.orderIndex === idx + 1 
                    ? 'bg-primary text-white' 
                    : 'bg-red text-white'
                  : 'bg-white text-dark shadow-sm border border-primary/20 hover:bg-primary-light'
              }`}
            >
              {option.text}
            </motion.button>
          ))
        )}
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {available.map((option) => (
              <motion.button
                key={option.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={!submitted ? { scale: 0.9 } : {}}
                onClick={() => handleAdd(option)}
                disabled={submitted}
                className="px-4 py-2 rounded-xl bg-white text-dark font-medium text-sm shadow-sm border border-gray-200 hover:border-primary hover:bg-primary-light transition-all"
              >
                {option.text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {arranged.length > 0 && !submitted && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="mt-4 w-full h-[52px] bg-primary hover:bg-primary-dark text-white font-bold rounded-button transition-colors"
        >
          Check
        </motion.button>
      )}
    </div>
  );
}