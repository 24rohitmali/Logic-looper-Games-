import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import GameScreen from './components/GameScreen';
import { initDB } from './utils/storage';
import './App.css';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          backgroundColor: '#667eea',
          minHeight: '100vh',
          padding: '2rem',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          <h1>🔴 React Error Boundary Caught:</h1>
          <p>{this.state.error?.toString()}</p>
          <p>{this.state.error?.stack}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    console.log('APP LOG:', msg);
    setLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    try {
      addLog('1. App mounted');
      
      // Capture global errors
      const handleError = (e) => {
        addLog(`GLOBAL ERROR: ${e.message}`);
        setError(e.error);
      };
      window.addEventListener('error', handleError);
      
      const handleUnhandledRejection = (e) => {
        addLog(`UNHANDLED PROMISE: ${e.reason}`);
        setError(e.reason);
      };
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      addLog('2. Starting DB init');
      initDB()
        .then(() => {
          addLog('3. DB init success');
          setLoading(false);
        })
        .catch(err => {
          addLog(`4. DB init error: ${err.message}`);
          setError(err);
          setLoading(false);
        });

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    } catch (err) {
      addLog(`SYNC ERROR: ${err.message}`);
      setError(err);
      setLoading(false);
    }
  }, []);

  if (error) {
    return (
      <div style={{
        backgroundColor: '#667eea',
        minHeight: '100vh',
        padding: '2rem',
        color: 'white',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontSize: '12px'
      }}>
        <h1>🔴 ERROR:</h1>
        <p>{error?.message || error?.toString()}</p>
        <p>{error?.stack}</p>
        <hr />
        <h2>Logs:</h2>
        {logs.map((log, i) => <div key={i}>  {i + 1}. {log}</div>)}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <div style={{ minHeight: '100vh' }}>
          
          {loading && (
            <div style={{
              backgroundColor: '#667eea',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: 'Arial, sans-serif',
              fontSize: '1.5rem'
            }}>
              <div>Loading Logic Looper...</div>
              <div style={{marginTop: '2rem', fontSize: '12px', opacity: 0.7}}>
                {logs.map((log, i) => <div key={i}>{i+1}. {log}</div>)}
              </div>
            </div>
          )}
          {!loading && <GameScreen />}
        </div>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
