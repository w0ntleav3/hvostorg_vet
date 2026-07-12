import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Admin.main.page.module.css';
import ClientTable from '../../components/ClientTable';
import AdminVets from '../AdminVets/AdminVets';
import AdminPets from '../AdminPets/AdminPets';
import AdminRecords from '../AdminRecords/AdminRecords';
import AdminServices from '../AdminServices/AdminServices';
import AdminPetTypes from '../AdminPetTypes/AdminPetTypes';
import { useAuth } from '../../contexts/AuthContext';

function AdminMainPage() {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

useEffect(() => {
  if (activeTab !== 'clients') return;

  if (!user?.token) return;

  fetch('http://localhost:5000/api/clients', {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  })
    .then(async res => {
      if (!res.ok) {
        if (res.status === 401) {
          logout(); // 
          navigate('/login');
        }
        throw new Error('Ошибка загрузки');
      }
      return res.json();
    })
    .then(setClients)
    .catch(err => console.error('Ошибка загрузки клиентов:', err));

}, [activeTab, user]);

  const filteredClients = clients.filter(c => {
    const name = (c.name || '').toLowerCase();
    const phone = c.phone || '';
    const email = (c.email || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      name.startsWith(term) ||
      phone.startsWith(searchTerm) ||
      email.startsWith(term)
    );
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
           <button className={styles.backBtn} onClick={() => navigate(-1)}>
             ← Назад
           </button>
           <h1>Хвосторг — Панель администратора</h1>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          Выйти из аккаунта →
        </button>
      </header>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'clients' ? styles.active : ''}
          onClick={() => setActiveTab('clients')}
        >
          Клиенты
        </button>

        <button
          className={activeTab === 'pets' ? styles.active : ''}
          onClick={() => setActiveTab('pets')}
        >
          Питомцы
        </button>

        <button
          className={activeTab === 'vets' ? styles.active : ''}
          onClick={() => setActiveTab('vets')}
        >
          Врачи
        </button>

        <button
          className={activeTab === 'records' ? styles.active : ''}
          onClick={() => setActiveTab('records')}
        >
          Записи
        </button>

        <button
          className={activeTab === 'services' ? styles.active : ''}
          onClick={() => setActiveTab('services')}
        >
          Услуги
        </button>

        <button
          className={activeTab === 'pet_types' ? styles.active : ''}
          onClick={() => setActiveTab('pet_types')}
        >
          Типы животных
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
            <ClientTable clients={filteredClients} />
          </>
        )}

        {activeTab === 'vets' && <AdminVets />}
        {activeTab === 'pets' && <AdminPets />}
        {activeTab === 'records' && <AdminRecords />}
        {activeTab === 'services' && <AdminServices />}
        {activeTab === 'pet_types' && <AdminPetTypes />}
      </main>
    </div>
  );
}

export default AdminMainPage;