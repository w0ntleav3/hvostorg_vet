import React, { useState, useEffect } from 'react';
import styles from '../Admin_main_page/Admin.main.page.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import VetRecords from '../VetRecords/VetRecords';
import VetPets from '../VetPets/VetPets';
import VetServices from '../VetServices/VetServices';
import ClientTableVet from '../../components/ClientTableVet';

function VetMainPage() {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Предположим, token берется из контекста. 
  // Если нет, замените на: const token = localStorage.getItem('token');
  const { logout, token } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
  if (activeTab === 'clients') {
    // Достаем токен напрямую из хранилища. 
    // ВАЖНО: Ключ должен быть точно таким же, под каким его сохраняет Login.js (например, 'token' или 'jwt_token')
    const savedToken = localStorage.getItem('token'); 

    console.log("Отправляем запрос с токеном:", savedToken); // Лог для проверки в консоли

    fetch('http://localhost:5000/api/clients', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${savedToken}` // Передаем токен бэкенду
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Ошибка сервера: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setClients(data);
        } else {
          console.error('Пришел не массив:', data);
          setClients([]);
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки клиентов:', err);
        setClients([]);
      });
  }
}, [activeTab]);

  // Дополнительная подстраховка: если clients по какой-то причине не массив
  const filteredClients = Array.isArray(clients) 
    ? clients.filter(c =>
        (c.name || '').toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        (c.phone || '').startsWith(searchTerm) ||
        (c.email || '').toLowerCase().startsWith(searchTerm.toLowerCase())
      )
    : [];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← Назад
        </button>
        <h1>Хвосторг — Для Врача</h1>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Выйти из аккаунта →
        </button>
      </header>

      <div className={styles.tabs}>
        <button className={activeTab === 'clients' ? styles.active : ''} onClick={() => setActiveTab('clients')}>
          Клиенты
        </button>
        <button className={activeTab === 'pets' ? styles.active : ''} onClick={() => setActiveTab('pets')}>
          Питомцы
        </button>
        <button className={activeTab === 'records' ? styles.active : ''} onClick={() => setActiveTab('records')}>
          Записи
        </button>
        <button className={activeTab === 'services' ? styles.active : ''} onClick={() => setActiveTab('services')}>
          Услуги
        </button>
      </div>

      <main className={styles.content}>
        {activeTab === 'clients' && (
          <>
            <input
              className={styles.search}
              placeholder="Поиск клиента..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <ClientTableVet clients={filteredClients} />
          </>
        )}

        {activeTab === 'pets' && <VetPets />}
        {activeTab === 'records' && <VetRecords />}
        {activeTab === 'services' && <VetServices />}
      </main>
    </div>
  );
}

export default VetMainPage;