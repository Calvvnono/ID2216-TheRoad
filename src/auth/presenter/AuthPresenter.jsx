import React, { useState } from 'react';
import { authPersistence } from '../persistence/authPersistence';
import LoginScreen from '../view/LoginScreen';

export default function AuthPresenter() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleSubmit() {
    setStatus('loading');
    setErrorMessage(null);
    try {
      if (mode === 'login') {
        await authPersistence.signIn(email, password);
      } else {
        await authPersistence.signUp(email, password);
      }
      // onAuthStateChanged in authPersistence will update authStore,
      // which causes _layout to re-render and show the tabs
    } catch (e) {
      setStatus('error');
      setErrorMessage(e.message);
    }
  }

  function handleToggleMode() {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setErrorMessage(null);
    setStatus('idle');
  }

  return (
    <LoginScreen
      mode={mode}
      email={email}
      password={password}
      status={status}
      errorMessage={errorMessage}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onToggleMode={handleToggleMode}
    />
  );
}
