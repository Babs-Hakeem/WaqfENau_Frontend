import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function InfoCard({ exercise, onAnswer }) {
  return (
    <div className="flex flex-col h-full justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
          <span className="text-2xl">📖</span>
        </div>
        <h2 className="text-lg font-bold text-dark mb-2">{exercise.prompt}</h2>
        <p className="text-gray leading-relaxed">{exercise.explanationText}</p>
      </motion.div>
      
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onAnswer('continue')}
        className="mt-6 w-full h-[52px] bg-primary hover:bg-primary-dark text-white font-bold rounded-button flex items-center justify-center gap-2 transition-colors"
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}