import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../AdminClientDashboard/AdminClientDashboard.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function VetClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== запись =====
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    pet_id: '',
    service_id: '',
    date_service: null,
    time_service: '',
    comment: ''
  });

  const [servicesList, setServicesList] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const PET_TYPES = [
    { value: 'cat', label: 'Кошка' },
    { value: 'dog', label: 'Собака' },
    { value: 'parrot', label: 'Попугай' },
    { value: 'hamster', label: 'Хомяк' },
    { value: 'other', label: 'Другое' }
  ];

  // =========================
  // ЗАГРУЗКА ДАННЫХ
  // =========================

  useEffect(() => {
    if (!user?.token) return;
    console.log("Current user object:", user);

    fetch(`http://localhost:5000/api/clients/admin/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setClientData(data);
        setLoading(false);
      });
  }, [id, user]);

  useEffect(() => {
    if (!user?.token) return;
    fetch('http://localhost:5000/api/services', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(setServicesList);
  }, [user]);

  // =========================
  // ЗАПИСЬ (вет = текущий юзер)
  // =========================
  
    if (!user?.token || user.id_emp === null) return <p>Загрузка...</p>;
    const vetId = user.id_emp;



    const onServiceChange = async (serviceId) => {
    setRecordForm({
        ...recordForm,
        service_id: serviceId,
        date_service: null,
        time_service: ''
    });

    setAvailableDates([]);
    setAvailableSlots([]);
    
    if (!serviceId || !vetId) return;

    const res = await fetch(
    `http://localhost:5000/api/vets/${vetId}/available_dates?days=14`,
    { headers: { Authorization: `Bearer ${user.token}` } }
    );

    const data = await res.json();

    // 🔥 нормализация дат
    setAvailableDates(
        (data.dates || []).map(d => d.slice(0, 10))
    );
    };



    const onDateChange = async (date) => {
    setRecordForm({ ...recordForm, date_service: date, time_service: '' });
    setAvailableSlots([]);

    if (!date || !vetId) return;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const res = await fetch(
    `http://localhost:5000/api/vets/${vetId}/available_slots?date=${dateStr}`,
    { headers: { Authorization: `Bearer ${user.token}` } }
    );

    const data = await res.json();
    console.log('slots:', data.slots); 
    setAvailableSlots(data.slots || []);
    };


  const addRecord = async () => {
    const pet = clientData.pets.find(p => p.id_pet === Number(recordForm.pet_id));
    const medCard = pet?.med_cards?.[0];
    const localDate = recordForm.date_service;
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0'); // месяцы с 0
    const day = String(localDate.getDate()).padStart(2, '0');

    const dateStr = `${year}-${month}-${day}T${recordForm.time_service}`;

    if (!medCard) return alert('У питомца нет медкарты');

    const res = await fetch('http://localhost:5000/api/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        id_med_card: medCard.id_med_card,
        id_service: Number(recordForm.service_id),
        id_emp: vetId,
        date_service: dateStr,
        comment: recordForm.comment
      })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    };

    const refreshed = await fetch(
    `http://localhost:5000/api/clients/admin/${id}`,
    { headers: { Authorization: `Bearer ${user.token}` } }
    );

    setClientData(await refreshed.json());

    setIsAddRecordOpen(false);
    setRecordForm({
      pet_id: '',
      service_id: '',
      date_service: null,
      time_service: '',
      comment: ''
    });
  };

  if (loading) return <p>Загрузка...</p>;
  if (!clientData?.client) return <p>Клиент не найден</p>;

  const { client, pets = [] } = clientData;
  const allRecords = pets.flatMap(p =>
    (p.records || []).map(r => ({
      ...r,
      petName: p.name,
      id_pet: p.id_pet 
    }))
  )
    .sort((a, b) => new Date(a.date_service) - new Date(b.date_service));

  // =========================
  // JSX
  // =========================

  return (
    <div className={styles.dashboard}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Назад</button>
      <h1>Клиент: {client.name}</h1>

      {/* ИНФА О КЛИЕНТЕ */}
      <section>
        <h2>Информация о клиенте</h2>
        <p>Телефон: {client.phone}</p>
        <p>Email: {client.email || '-'}</p>
        <p>Скидка: {client.discount || 0}%</p>
      </section>

      {/* ПИТОМЦЫ */}
      <section>
        <h2>Питомцы</h2>
        {pets.length === 0 ? (
          <p>Нет питомцев</p>
        ) : (
          pets.map(p => (
            <div
              key={p.id_pet}
              className={styles.petCard}
              onClick={() =>
                navigate(`/admin/pet/${p.id_pet}`, {
                  state: {
                    from: `/vet/clients/${id}`,
                    role: 'vet'
                  }
                })
              }
              style={{ cursor: 'pointer' }}
            >
              <h3>{p.name}</h3>
              <p>Тип: {p.type || '-'}</p>
              <p>Пол: {p.sex === 'm' ? 'Самец' : 'Самка'}</p>
              <p>Порода: {p.breed || '-'}</p>
              <p>Дата рождения: {p.date_birth || '-'}</p>
            </div>
          ))
        )}
      </section>

      {/* УСЛУГИ */}
      <section>
        <div className={styles.sectionHeader}>
          <h2>Услуги</h2>
          <button
            className={`${styles.actionBtn} ${styles.addBtn}`}
            onClick={() => setIsAddRecordOpen(true)}
          >
            + Добавить запись
          </button>
        </div>

        {allRecords.length === 0 ? (
          <p>Записей нет</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Питомец</th>
                <th>Услуга</th>
                <th>Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {allRecords.map(r => (
                <tr key={r.id_record}>
                  <td>
                    {r.date_service
                        ? new Date(r.date_service).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                        : '-'}
                    </td>
                  <td
                    onClick={() => {
                      if (!r.id_pet) {
                        console.log("нет id_pet в записи", r);
                        return;
                      }
                      navigate(`/admin/pet/${r.id_pet}`);
                    }}
                    style={{
                      cursor: 'pointer',
                      color: '#007bff',
                      textDecoration: 'underline'
                    }}
                  >
                    {r.petName}
                  </td>
                  <td>{r.service?.name_service}</td>
                  <td>{r.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* МОДАЛКА ЗАПИСИ */}
      {isAddRecordOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Добавить запись</h2>

            <label>Питомец
              <select
                value={recordForm.pet_id}
                onChange={e => setRecordForm({ ...recordForm, pet_id: e.target.value })}
              >
                <option value="">— выберите —</option>
                {pets.map(p => (
                  <option key={p.id_pet} value={p.id_pet}>{p.name}</option>
                ))}
              </select>
            </label>

            <label>Услуга
                <select
                value={recordForm.service_id}
                onChange={e => onServiceChange(e.target.value)}
                >

                <option value="">— выберите —</option>
                {servicesList.map(s => (
                  <option key={s.id_service} value={s.id_service}>{s.name_service}</option>
                ))}
              </select>
            </label>

            <label>Дата
              <DatePicker
                selected={recordForm.date_service}
                onChange={onDateChange}
                filterDate={d =>
                  availableDates.includes(
                    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                  )
                }
                disabled={!recordForm.service_id}
                dateFormat="yyyy-MM-dd"
                />

            </label>

            <label>Время
              <select
                disabled={!recordForm.date_service}
                value={recordForm.time_service}
                onChange={e => setRecordForm({ ...recordForm, time_service: e.target.value })}
              >
                <option value="">— выберите —</option>
                {availableSlots.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>Комментарий
              <textarea
                value={recordForm.comment}
                onChange={e => setRecordForm({ ...recordForm, comment: e.target.value })}
              />
            </label>

            <div className={styles.modalActions}>
              <button onClick={() => setIsAddRecordOpen(false)}>Отмена</button>
              <button onClick={addRecord}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VetClientDashboard;