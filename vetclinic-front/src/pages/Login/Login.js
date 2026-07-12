import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    console.log('Отправляем логин', username, password);

    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: username, password })
    });

    const data = await res.json();
    console.log(res.ok, data);

    if (!res.ok) {
      setError(data.error || 'Ошибка входа');
      return;
    }

    // сохраняем данные в контекст и localStorage
    // в Login.js
    login({
      token: data.token,
      id_account: data.id_account,
      role: data.id_role, 
      id_emp: data.id_emp || null
    });


    // проверяем роль и делаем navigate
    if (data.id_role === 1) {
      navigate('/admin');
    } else if (data.id_role === 2) {
      navigate('/vet'); 
    } else if (data.id_role === 3) {
      navigate('/clients'); // клиент
    } else {
      setError('Неизвестная роль');
    }

  } catch (err) {
    console.error(err);
    setError('Сервер не отвечает');
  }
};


  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        ← На главную
      </button>

      <h2>Вход</h2>

      <form onSubmit={handleLogin} className={styles.form}>
        <label className={styles.label}>
            <span>Логин</span>
          <input 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
        </label>

        <label className={styles.label}>
          <span>Пароль</span>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit">Войти</button>
      </form>

      <p className={styles.register}>
        Нет аккаунта? <a href="/register">Зарегистрироваться</a>
      </p>
    </div></div>
  );
}

export default Login;
