import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminClientDashboard.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function AdminClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  // клиент
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    discount: 0
  });

  // питомцы
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [petForm, setPetForm] = useState({
    name: '',
    type: '',
    sex: '',
    id_breed: '',
    date_birth: ''
  });

  // запись
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    pet_id: '',
    service_id: '',
    employee_id: '',
    date_service: null,
    time_service: '',
    comment: ''
  });

  const [servicesList, setServicesList] = useState([]);
  const [vets, setVets] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [allBreeds, setAllBreeds] = useState([]);
  const [breedSearch, setBreedSearch] = useState('');
  const [breedDropdownOpen, setBreedDropdownOpen] = useState(false);
  const location = useLocation();
  const filteredBreeds = useMemo(() => {
    return allBreeds.filter(
      b =>
        Number(b.id_type) === Number(petForm.type) &&
        b.name_breed
          ?.toLowerCase()
          .includes(breedSearch.toLowerCase())
    );
  }, [allBreeds, petForm.type, breedSearch]);

  // ЗАГРУЗКА ДАННЫХ
  useEffect(() => {
    if (!user?.token) return;

    fetch(`http://localhost:5000/api/clients/admin/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setClientData(data);
        setLoading(false);
        if (data.client) {
          setEditForm({
            name: data.client.name,
            phone: data.client.phone,
            email: data.client.email || '',
            discount: data.client.discount || 0
          });
        }
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

  useEffect(() => {
    if (!user?.token) return;
    fetch('http://localhost:5000/api/vets', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(setVets);
  }, [user]);

  useEffect(() => {
  if (!user?.token) return;

  fetch('http://localhost:5000/api/pet_types', {
    headers: { Authorization: `Bearer ${user.token}` }
  })
    .then(res => res.json())
    .then(setPetTypes);
}, [user]);

useEffect(() => {
  if (!user?.token) return;

  fetch('http://localhost:5000/api/breeds', {
    headers: { Authorization: `Bearer ${user.token}` }
  })
    .then(res => res.json())
    .then(setAllBreeds);
}, [user]);

  // КЛИЕНТ
  const saveClient = async () => {
    await fetch(`http://localhost:5000/api/clients/${clientData.client.id_client}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ ...editForm, discount: Number(editForm.discount) })
    });

    setClientData(prev => ({
      ...prev,
      client: { ...prev.client, ...editForm }
    }));
    setIsEditOpen(false);
  };

  // ПИТОМЦЫ
  const handleTypeChange = (typeId) => {
    setPetForm(prev => ({
      ...prev,
      type: typeId,
      id_breed: ''
    }));

    setBreedSearch('');
    setBreedDropdownOpen(false);
  };

  const addPet = async () => {
    const payload = {
      name: petForm.name,
      sex: petForm.sex, 
      id_type: petForm.type ? Number(petForm.type) : null, 
      id_breed: petForm.id_breed ? Number(petForm.id_breed) : null, // Если пустой, бэкенд создаст породу сам
      date_birth: petForm.date_birth,
      id_client: clientData.client.id_client
    };

    const petRes = await fetch('http://localhost:5000/api/pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(payload)
    });
    
      
  
    const petData = await petRes.json();

  await fetch('http://localhost:5000/api/med_cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`
    },
    body: JSON.stringify({
      id_pet: petData.id_pet,
      date_open: new Date().toISOString().slice(0, 10)
    })
  });

  const refreshed = await fetch(
    `http://localhost:5000/api/clients/admin/${id}`,
    {
      headers: { Authorization: `Bearer ${user.token}` }
    }
  );

  setClientData(await refreshed.json());

  setIsAddPetOpen(false);

  setPetForm({
    name: '',
    type: '',
    sex: '',
    id_breed: '',
    date_birth: ''
  });
};

  // ЗАПИСЬ К ВРАЧУ 

  const onVetChange = async (vetId) => {
    setRecordForm({
      ...recordForm,
      employee_id: vetId,
      date_service: null,
      time_service: ''
    });
    setAvailableDates([]);
    setAvailableSlots([]);

    if (!vetId) return;

    const res = await fetch(
      `http://localhost:5000/api/vets/${vetId}/available_dates?days=14`,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    const data = await res.json();
    setAvailableDates(data.dates || []);
  };

  const onDateChange = async (date) => {
    setRecordForm({ ...recordForm, date_service: date, time_service: '' });
    setAvailableSlots([]);

    if (!recordForm.employee_id || !date) return;

    const dateStr = date.toISOString().slice(0, 10);
    const res = await fetch(
      `http://localhost:5000/api/vets/${recordForm.employee_id}/available_slots?date=${dateStr}`,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    const data = await res.json();
    setAvailableSlots(data.slots || []);
  };

  const addRecord = async () => {
    const pet = clientData.pets.find(p => p.id_pet === Number(recordForm.pet_id));
    const medCard = pet?.med_cards?.[0];
    if (!medCard) return alert('У питомца нет медкарты');

    await fetch('http://localhost:5000/api/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        id_med_card: medCard.id_med_card,
        id_service: Number(recordForm.service_id),
        id_emp: Number(recordForm.employee_id),
        date_service: `${recordForm.date_service.getFullYear()}-${recordForm.date_service.getMonth()+1}-${recordForm.date_service.getDate()}T${recordForm.time_service}`,
        comment: recordForm.comment
      })
    });

    const refreshed = await fetch(
      `http://localhost:5000/api/clients/admin/${id}`,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    setClientData(await refreshed.json());

    setIsAddRecordOpen(false);
    setRecordForm({
      pet_id: '',
      service_id: '',
      employee_id: '',
      date_service: null,
      time_service: '',
      comment: ''
    });
  };

  if (loading) return <p>Загрузка...</p>;
  if (!clientData?.client) return <p>Клиент не найден</p>;

  const { client, pets = [] } = clientData;
  const allRecords = pets
    .flatMap(p =>
        (p.records || []).map(r => ({ ...r, petName: p.name }))
    )
    .sort((a, b) => new Date(a.date_service) - new Date(b.date_service));


  return (
    <div className={styles.dashboard}>
      <button className={styles.backBtn} onClick={() => navigate('/admin')}>← Назад</button>
      <h1>Клиент: {client.name}</h1>

      {/* ИНФА О КЛИЕНТЕ */}
      <section className={styles.clientInfo}>
        <div className={styles.sectionHeader}>
          <h2>Информация о клиенте</h2>
          <button
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={() => setIsEditOpen(true)}
          >
            Редактировать
          </button>
        </div>

        <p>Телефон: {client.phone}</p>
        <p>Email: {client.email || '-'}</p>
        <p>Скидка: {client.discount || 0}%</p>
      </section>

      {/* ПИТОМЦЫ */}
      <section className={styles.pets}>
        <div className={styles.sectionHeader}>
          <h2>Питомцы</h2>
          <button
            className={`${styles.actionBtn} ${styles.addBtn}`}
            onClick={() => setIsAddPetOpen(true)}
          >
            + Добавить питомца
          </button>
        </div>

        {pets.length === 0 ? (
          <p>Нет питомцев</p>
        ) : (
          pets.map(p => (
            <div
              key={p.id_pet}
              className={styles.petCard}
              onClick={() => navigate(`/admin/pet/${p.id_pet}`, { 
                state: { from: location.pathname } 
              })}
              style={{ cursor: 'pointer' }} // чтобы было понятно, что кликабельно
            >
              <h3>{p.name}</h3>
              <p>Вид: {p.type || '-'}</p>
              <p>Пол: {p.sex === 'M' ? 'Самец' : 'Самка'}</p>
              <p>Порода: {p.breed || '-'}</p>
              <p>Дата рождения: {p.date_birth || '-'}</p>
            </div>
          ))

        )}
      </section>

      {/* УСЛУГИ */}
      <section className={styles.records}>
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
          <p>Услуг нет</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Питомец</th>
                <th>Услуга</th>
                <th>Врач</th>
                <th>Комментарий</th>
                <th>Действия</th>
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

                  <td>{r.petName}</td>
                  <td>{r.service?.name_service}</td>
                  <td>{r.employee?.name_emp}</td>
                  <td>{r.comment}</td>
                  <td>
                    {new Date(r.date_service) > new Date() && (
                      <button
                        className={styles.deleteBtn}
                        onClick={async () => {
                          await fetch(`http://localhost:5000/api/records/${r.id_record}`, {
                            method: 'DELETE',
                            headers: {
                              Authorization: `Bearer ${user.token}`
                            }
                          });

                          const refreshed = await fetch(
                            `http://localhost:5000/api/clients/admin/${id}`,
                            { headers: { Authorization: `Bearer ${user.token}` } }
                          );

                          setClientData(await refreshed.json());
                        }}
                      >
                        Удалить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* МОДАЛКИ */}
      {isEditOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Редактировать клиента</h2>

            <label>
              Имя
              <input
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              />
            </label>

            <label>
              Телефон
              <input
                value={editForm.phone}
                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </label>

            <label>
              Email
              <input
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              />
            </label>

            <label>
              Скидка
              <input
                type="number"
                value={editForm.discount}
                onChange={e =>
                  setEditForm({ ...editForm, discount: e.target.value })
                }
              />
            </label>

            <div className={styles.modalActions}>
              <button onClick={() => setIsEditOpen(false)}>Отмена</button>
              <button onClick={saveClient}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
      
      {isAddPetOpen && (
      <div
        className={styles.modalOverlay}
        onClick={() => {
          setIsAddPetOpen(false);
          setBreedDropdownOpen(false);
        }}
      >
        <div
          className={styles.modal}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h3>Добавить питомца</h3>

            <button
              className={styles.closeBtn}
              onClick={() => {
                setIsAddPetOpen(false);
                setBreedDropdownOpen(false);
              }}
            >
              ✕
            </button>
          </div>

          <label>
            Кличка

            <input
              className={styles.input}
              value={petForm.name}
              onChange={e =>
                setPetForm({
                  ...petForm,
                  name: e.target.value
                })
              }
            />
          </label>

          <label>
            Пол

            <div className={styles.sexSwitcher}>
              <button
                type="button"
                className={`${styles.sexOption} ${
                  petForm.sex === 'M'
                    ? styles.activeSex
                    : ''
                }`}
                onClick={() =>
                  setPetForm({
                    ...petForm,
                    sex: 'M'
                  })
                }
              >
                Самец
              </button>

              <button
                type="button"
                className={`${styles.sexOption} ${
                  petForm.sex === 'F'
                    ? styles.activeSex
                    : ''
                }`}
                onClick={() =>
                  setPetForm({
                    ...petForm,
                    sex: 'F'
                  })
                }
              >
                Самка
              </button>
            </div>
          </label>

          <label>
            Вид

            <select
              className={styles.input}
              value={petForm.type}
              onChange={e =>
                handleTypeChange(e.target.value)
              }
            >
              <option value="">
                Выберите вид
              </option>

              {petTypes.map(t => (
                <option
                  key={t.id_type}
                  value={t.id_type}
                >
                  {t.name_type}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.dropdownWrap}>
            Порода

            <input
              className={styles.input}
              placeholder="Поиск породы..."
              value={breedSearch}
              disabled={!petForm.type}
              onChange={e => {
                setBreedSearch(e.target.value);
                setBreedDropdownOpen(true);
              }}
              onFocus={() => {
                if (petForm.type) {
                  setBreedDropdownOpen(true);
                }
              }}
            />

            {breedDropdownOpen && (
              <div className={styles.dropdown}>
                {filteredBreeds.length > 0 ? (
                  filteredBreeds.map(b => (
                    <div
                      key={b.id_breed}
                      className={styles.dropdownItem}
                      onClick={() => {
                        setPetForm({
                          ...petForm,
                          id_breed: b.id_breed
                        });

                        setBreedSearch(
                          b.name_breed
                        );

                        setBreedDropdownOpen(false);
                      }}
                    >
                      {b.name_breed}
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyDropdown}>
                    Ничего не найдено
                  </div>
                )}
              </div>
            )}
          </label>

          <label>
            Дата рождения

            <input
              className={styles.input}
              type="date"
              value={petForm.date_birth}
              onChange={e =>
                setPetForm({
                  ...petForm,
                  date_birth: e.target.value
                })
              }
            />
          </label>

          <div className={styles.modalActions}>
            <button
              className={styles.cancelBtn}
              onClick={() =>
                setIsAddPetOpen(false)
              }
            >
              Отмена
            </button>

            <button
              className={styles.saveBtn}
              onClick={addPet}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    )}

      {isAddRecordOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Добавить запись</h2>

            <label>Питомец
              <select value={recordForm.pet_id}
                onChange={e => setRecordForm({ ...recordForm, pet_id: e.target.value })}>
                <option value="">— выберите —</option>
                {pets.map(p => (
                  <option key={p.id_pet} value={p.id_pet}>{p.name}</option>
                ))}
              </select>
            </label>

            <label>Услуга
              <select value={recordForm.service_id}
                onChange={e => setRecordForm({ ...recordForm, service_id: e.target.value })}>
                <option value="">— выберите —</option>
                {servicesList.map(s => (
                  <option key={s.id_service} value={s.id_service}>{s.name_service}</option>
                ))}
              </select>
            </label>

            <label>Врач
              <select value={recordForm.employee_id}
                onChange={e => onVetChange(e.target.value)}>
                <option value="">— выберите —</option>
                {vets.map(v => (
                  <option key={v.id_emp} value={v.id_emp}>{v.name_emp}</option>
                ))}
              </select>
            </label>

            <label>Дата
              <DatePicker
                selected={recordForm.date_service}
                onChange={onDateChange}
                filterDate={d => availableDates.includes(d.toISOString().slice(0, 10))}
                disabled={!recordForm.employee_id}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
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

export default AdminClientDashboard;