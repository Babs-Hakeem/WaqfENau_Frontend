import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function MultipleChoice({ exercise, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (option) => {
    if (submitted || disabled) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (!selected || submitted) return;
    setSubmitted(true);
    
    setTimeout(() => {
      onAnswer(selected.id, selected.isCorrect);
    }, 1200);
  };

  const getOptionStyle = (option) => {
    if (!submitted) {
      return selected?.id === option.id
        ? 'border-primary bg-primary-light ring-2 ring-primary/30'
        : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50';
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

      <div className="flex-1 space-y-3">
        {exercise.options.map((option, idx) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileTap={!submitted ? { scale: 0.98 } : {}}
            onClick={() => handleSelect(option)}
            disabled={submitted || disabled}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center justify-between ${getOptionStyle(option)}`}
          >
            <span className={`font-medium ${submitted && option.isCorrect ? 'text-white' : submitted && selected?.id === option.id ? 'text-white' : 'text-dark'}`}>
              {option.text}
            </span>
            <AnimatePresence>
              {submitted && option.isCorrect && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              )}
              {submitted && selected?.id === option.id && !option.isCorrect && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <X className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {!submitted && selected && (
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