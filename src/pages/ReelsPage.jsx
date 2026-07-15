import { motion } from 'framer-motion';

const ReelsPage = () => {
  return (
    <div className="max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Reels</h1>
        <p className="text-gray-500 text-sm">Discover short video memories</p>
      </motion.div>
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">Coming soon</p>
      </div>
    </div>
  );
};

export default ReelsPage;