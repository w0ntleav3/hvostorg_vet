import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || 'Ошибка регистрации');
        return;
      }

      alert('Регистрация успешна!');
      navigate('/login');
    } catch {
      alert('Ошибка сервера');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/')}
        >
          ← На главную
        </button>

        <h2>Регистрация</h2>

        <form className={styles.form} onSubmit={handleRegister}>
          <label className={styles.label}>
            <span>Имя</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input} /* Добавили класс */
              required
            />
          </label>

          <label className={styles.label}>
            <span>Почта</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input} /* Добавили класс */
              required
            />
          </label>

          <label className={styles.label}>
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input} /* Добавили класс */
              required
            />
          </label>

          <button type="submit" className={styles.submitBtn}>Создать аккаунт</button>
        </form>

        <div className={styles.login}>
          Уже есть аккаунт?{' '}
          <span onClick={() => navigate('/login')}>
            Войти
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;