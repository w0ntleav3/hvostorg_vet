import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ContactsPage.module.css';

function ContactsPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.contactsPage}>
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        ← на главную
      </button>

      <h1>Контакты</h1>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>📍 Адрес</h3>
          <p>г. Воронеж</p>
          <p>ул. Очень заботливая, 12</p>
        </div>

        <div className={styles.card}>
          <h3>📞 Телефон</h3>
          <p>+7 (900) 123-45-67</p>
          <p>Ежедневно с 10:00 до 17:30</p>
        </div>

        <div className={styles.card}>
          <h3>✉️ Email</h3>
          <p>hvostorg@vetclinic.ru</p>
          <p>Отвечаем в течение дня</p>
        </div>
      </div>

      <div className={styles.note}>
        <p>
          Если ваш питомец плохо себя чувствует — не тяните.
          Мы тут, чтобы помочь 🐾
        </p>
      </div>
    </div>
  );
}

export default ContactsPage;
