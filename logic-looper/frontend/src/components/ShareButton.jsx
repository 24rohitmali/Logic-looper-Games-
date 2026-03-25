import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateShareLink, getShareMessage } from '../utils/shareUtils';

const ShareButton = ({ puzzle, solution, stats }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareLink = generateShareLink(puzzle, solution, stats.score);
    const message = getShareMessage(stats);
    const fullMessage = `${message}\n\n${shareLink}`;

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }

    // Try native share if available
    if (navigator.share) {
      navigator.share({
        title: '🎮 Logic Looper Challenge',
        text: message,
        url: shareLink
      });
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      style={{
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        border: 'none',
        backgroundColor: '#ec4899',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '1rem',
        transition: 'all 0.3s'
      }}
    >
      {copied ? '✅ Copied!' : '📤 Share Challenge'}
    </motion.button>
  );
};

export default ShareButton;
