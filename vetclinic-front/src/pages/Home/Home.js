import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Home.module.css';
import React, { useEffect, useState } from 'react';
import logo from '../../assets/icon.png';
import pet1 from '../../assets/help_pet1.avif';
import pet2 from '../../assets/help_pet2.avif';
import pet3 from '../../assets/help_pet3.jpg';

function Home() {
  const { user, logout } = useAuth();
  const [userName, setUserName] = useState(null);
  
  const featuredPets = [
    { id: 1, name: 'Глеб', photo: pet1, story: 'Теперь живёт лучшую жизнь' },
    { id: 2, name: 'Барсик', photo: pet2, story: 'Был грустный, стал наглый' },
    { id: 3, name: 'Зевс', photo: pet3, story: 'Выжил, но цену помнит' }
  ];

  // Динамическое определение ссылки на панель управления
  const getDashboardConfig = () => {
    switch (user?.role) {
      case 1: return { path: '/admin', text: 'Панель администратора' };
      case 2: return { path: '/vet', text: 'Панель ветеринара' };
      case 3: return { path: '/clients', text: 'Личный кабинет' };
      default: return null;
    }
  };

  const dashboard = getDashboardConfig();

  useEffect(() => {
    if (!user?.token) {
      setUserName(null);
      return;
    }

    const fetchName = async () => {
      try {
        // Выбираем эндпоинт в зависимости от роли
        const url = user.role === 3 
          ? 'http://localhost:5000/api/clients/me' 
          : 'http://localhost:5000/api/employees/me';

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (!res.ok) throw new Error('Ошибка загрузки данных профиля');

        const data = await res.json();
        
        // Извлекаем имя в зависимости от структуры ответа бэкенда
        const name = user.role === 3 
          ? data.client?.name 
          : (data.name || data.employee?.name || data.full_name);
          
        setUserName(name);
      } catch (err) {
        console.error('Не удалось получить имя пользователя', err);
        setUserName(null);
      }
    };

    fetchName();
  }, [user]);

  return (
    <div className={styles.homeWrapper}>
      <header className={styles.header}>
        <div className={styles.leftBlock}>
          <img src={logo} alt="Логотип" className={styles.logo} />
          <span className={styles.brandName}>ХВОСТОРГ</span>

          {userName && (
            <span className={styles.userLabel}>
              {user.role === 3 ? `Привет, ${userName}!` : `Сотрудник: ${userName}`}
            </span>
          )}
        </div>

        <nav>
          <ul className={styles.menu}>
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
            <li><Link to="/services">Услуги</Link></li>

            {user?.id_account && dashboard ? (
              <>
                <li><Link to={dashboard.path}>{dashboard.text}</Link></li>
                <li>
                  <button onClick={logout} className={styles.logoutBtn}>
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <li><Link to="/login">Войти</Link></li>
            )}
          </ul>
        </nav>
      </header>

      <main className={styles.main}>
        {/* Остальной ваш контент (Услуги, Питомцы и т.д.) */}
        <section className={styles.featuredSection}>
          <h2>Наши услуги</h2>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}><h3>Ветеринарные осмотры</h3></div>
            <div className={styles.serviceCard}><h3>Вакцинация</h3></div>
            <div className={styles.serviceCard}><h3>Приём питомцев</h3></div>
          </div>
        </section>

        <section className={styles.featuredSection}>
          <h2>Питомцы, которым мы помогли</h2>

          <div className={styles.petsGrid}>
            {featuredPets.map(pet => (
              <div key={pet.id} className={styles.petCard}>
                <img
                  src={pet.photo}
                  alt={pet.name}
                  className={styles.petPhoto}
                />
                <h4>{pet.name}</h4>
                <p>{pet.story}</p>
              </div>
            ))}
          </div>
        </section>


        <section className={styles.contactSection}>
          <h2>Связаться с нами</h2>
          <p>Телефон: +7 (900) 123-45-67</p>
          <p>Email: info@hvostorg.ru</p>
          
        </section>
      </main>
    </div>
  );
}

export default Home;
