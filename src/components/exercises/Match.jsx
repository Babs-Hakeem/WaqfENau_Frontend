import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function Match({ exercise, onAnswer, disabled }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const leftItems = exercise.options.filter((_, i) => i % 2 === 0);
  const rightItems = exercise.options.filter((_, i) => i % 2 === 1).sort(() => Math.random() - 0.5);

  const handleLeft = (item) => {
    if (submitted || disabled || pairs.find(p => p.left.id === item.id)) return;
    setSelectedLeft(item);
    
    if (selectedRight) {
      const newPair = { left: item, right: selectedRight };
      setPairs(prev => [...prev, newPair]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleRight = (item) => {
    if (submitted || disabled || pairs.find(p => p.right.id === item.id)) return;
    setSelectedRight(item);
    
    if (selectedLeft) {
      const newPair = { left: selectedLeft, right: item };
      setPairs(prev => [...prev, newPair]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleSubmit = () => {
    if (pairs.length === 0 || submitted || disabled) return;
    
    const answerPairs = pairs.map(p => `${p.left.id}:${p.right.id}`).join(',');
    setSubmitted(true);
    
    setTimeout(() => {
      onAnswer(answerPairs, true);
    }, 1500);
  };

  const isPaired = (item, side) => {
    return pairs.some(p => p[side].id === item.id);
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

      <p className="text-sm text-gray mb-4">Tap an item on the left, then its match on the right:</p>

      <div className="flex-1 flex gap-4">
        <div className="flex-1 space-y-2">
          {leftItems.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileTap={!submitted ? { scale: 0.95 } : {}}
              onClick={() => handleLeft(item)}
              disabled={submitted || isPaired(item, 'left')}
              className={`w-full p-3 rounded-xl text-sm font-medium text-left transition-all ${
                isPaired(item, 'left')
                  ? 'bg-primary text-white'
                  : selectedLeft?.id === item.id
                    ? 'bg-primary-light border-2 border-primary text-primary'
                    : 'bg-white border-2 border-gray-200 text-dark hover:border-primary/50'
              }`}
            >
              {item.text}
              {isPaired(item, 'left') && <Check className="w-4 h-4 inline ml-2" />}
            </motion.button>
          ))}
        </div>

        <div className="flex-1 space-y-2">
          {rightItems.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileTap={!submitted ? { scale: 0.95 } : {}}
              onClick={() => handleRight(item)}
              disabled={submitted || isPaired(item, 'right')}
              className={`w-full p-3 rounded-xl text-sm font-medium text-left transition-all ${
                isPaired(item, 'right')
                  ? 'bg-primary text-white'
                  : selectedRight?.id === item.id
                    ? 'bg-primary-light border-2 border-primary text-primary'
                    : 'bg-white border-2 border-gray-200 text-dark hover:border-primary/50'
              }`}
            >
              {item.text}
              {isPaired(item, 'right') && <Check className="w-4 h-4 inline ml-2" />}
            </motion.button>
          ))}
        </div>
      </div>

      {pairs.length === leftItems.length && !submitted && (
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