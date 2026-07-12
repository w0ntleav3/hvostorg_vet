import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ServicesPage.module.css';
import ServicesTable from '../../components/ServicesTable';

function ServicesPage() {
  const [services, setServices] = useState([]);
  const navigate = useNavigate(); // навигация

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(response => response.json())
      .then(data => setServices(data))
      .catch(error => console.error('ошибка загрузки услуг:', error));
  }, []);

  return (
    <div className={styles.ServicesPage}>
      {/* кнопка возврата */}
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        ← на главную
      </button>

      <h1>Услуги</h1>
      <ServicesTable services={services} />
    </div>
  );
}

export default ServicesPage;
