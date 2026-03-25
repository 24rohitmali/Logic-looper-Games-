import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AuthModal = ({ onGuestMode, onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGuestClick = () => {
    onGuestMode();
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onAuth({
        id: Math.random().toString(36).substr(2, 9),
        email,
        password,
        createdAt: new Date().toISOString(),
        isRegistering
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: 'linear-gradient(to bottom right, #4f46e5, #9333ea)',
          borderRadius: '1.5rem',
          padding: '2rem',
          maxWidth: '28rem',
          width: '100%',
          color: 'white'
        }}
      >
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Welcome to Logic Looper!
        </h2>
        <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
          {isRegistering ? 'Create an account to save your progress' : 'Join the puzzle revolution and build your streak.'}
        </p>

        <form onSubmit={handleEmailSubmit} style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'white',
              color: '#4f46e5',
              fontWeight: 'bold',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
          >
            {isRegistering ? 'Create Account' : 'Login'}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.875rem'
            }}
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGuestClick}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          👤 Continue as Guest
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;
