import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './ClientDashboard.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== phone =====
  const [isEditPhone, setIsEditPhone] = useState(false);
  const [phoneForm, setPhoneForm] = useState('');

  // ===== pets =====
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);

  const [petForm, setPetForm] = useState({
    name: '',
    type: '',
    sex: 'M',
    id_breed: '',
    date_birth: ''
  });

  const [petTypes, setPetTypes] = useState([]);
  const [allBreeds, setAllBreeds] = useState([]);
  const [breedSearch, setBreedSearch] = useState('');
  const [breedDropdownOpen, setBreedDropdownOpen] = useState(false);

  // ===== records =====
  const [isAddRecord, setIsAddRecord] = useState(false);

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

  // ================= LOAD =================
  useEffect(() => {
    if (!user?.token) return;

    const load = async () => {
      const headers = { Authorization: `Bearer ${user.token}` };

      const [c, t, b] = await Promise.all([
        fetch('http://localhost:5000/api/clients/me', { headers }),
        fetch('http://localhost:5000/api/pet_types', { headers }),
        fetch('http://localhost:5000/api/breeds', { headers })
      ]);

      const data = await c.json();
      setClientData(data);
      setPhoneForm(data.client?.phone || '');

      setPetTypes(await t.json());
      setAllBreeds(await b.json());

      setLoading(false);
    };

    load();
  }, [user]);

  useEffect(() => {
    if (!user?.token) return;

    fetch('http://localhost:5000/api/services', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(r => r.json()).then(setServicesList);

    fetch('http://localhost:5000/api/vets', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(r => r.json()).then(setVets);
  }, [user]);

  // ================= BREEDS =================
  const filteredBreeds = useMemo(() => {
    return allBreeds.filter(
      b =>
        Number(b.id_type) === Number(petForm.type) &&
        b.name_breed?.toLowerCase().includes(breedSearch.toLowerCase())
    );
  }, [allBreeds, petForm.type, breedSearch]);

  // ================= PHONE =================
  const savePhone = async () => {
    await fetch('http://localhost:5000/api/clients/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ phone: phoneForm })
    });

    setClientData(prev => ({
      ...prev,
      client: { ...prev.client, phone: phoneForm }
    }));

    setIsEditPhone(false);
  };

  // ================= PET =================
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
      id_breed: petForm.id_breed ? Number(petForm.id_breed) : null,
      date_birth: petForm.date_birth,
      id_client: clientData.client.id_client
    };

    const res = await fetch('http://localhost:5000/api/pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(payload)
    });

    const newPet = await res.json();

    setClientData(prev => ({
      ...prev,
      pets: [...prev.pets, newPet]
    }));

    setIsAddPetOpen(false);
  };

  // ================= RECORD =================
  const onVetChange = async (vetId) => {
    setRecordForm({
      ...recordForm,
      employee_id: vetId,
      date_service: null,
      time_service: ''
    });

    const res = await fetch(
      `http://localhost:5000/api/vets/${vetId}/available_dates?days=14`,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    const data = await res.json();
    setAvailableDates(data.dates || []);
  };

  const onDateChange = async (date) => {
    setRecordForm(prev => ({ ...prev, date_service: date, time_service: '' }));

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
    const medCard = pet?.records?.[0]?.med_card;

    if (!medCard) return alert('Нет медкарты');

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
        date_service: `${recordForm.date_service.toISOString().slice(0,10)}T${recordForm.time_service}`,
        comment: recordForm.comment
      })
    });

    setIsAddRecord(false);
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className={styles.dashboard}>

      <button className={styles.backBtn} onClick={() => navigate('/')}>
        ← На главную
      </button>
      <h1>Личный кабинет</h1>

      {/* ===== CLIENT ===== */}
      <section>
        <h2>Мои данные</h2>

      <div className={styles.infoRow}>
        <span>Телефон:</span>

        {!isEditPhone ? (
          <>
            <span className={styles.valueText}>{clientData.client.phone || '-'}</span>

            <button
              className={styles.inlineBtn}
              onClick={() => setIsEditPhone(true)}
            >
              Изменить
            </button>
          </>
        ) : (
          <>
            <input
              className={styles.input}
              value={phoneForm}
              onChange={e => setPhoneForm(e.target.value)}
            />

            <button className={styles.saveBtn} onClick={savePhone}>
              Сохранить
            </button>
          </>
        )}
      </div>
        <p>Email: {clientData.client.email || '-'}</p>
        <p>Скидка: {clientData.client.discount || 0}%</p>
      </section>

      {/* ===== PETS ===== */}
      <section>
        <div className={styles.sectionHeader}>
          <h2>Питомцы</h2>
          <button className={styles.addBtn} onClick={() => setIsAddPetOpen(true)}>
            + Добавить питомца
          </button>
        </div>

        {clientData.pets?.map(p => (
          <div key={p.id_pet} className={styles.petCard}>
            {p.name}
          </div>
        ))}
      </section>

      {/* ===== RECORDS ===== */}
      <section>
        <div className={styles.sectionHeader}>
          <h2>Записи</h2>
          <button className={styles.addBtn} onClick={() => setIsAddRecord(true)}>
            + Добавить запись
          </button>
        </div>
      </section>

      {/* ===== MODAL PET ===== */}
      {isAddPetOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddPetOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <h2>Добавить питомца</h2>

            <label>
              Кличка
              <input className={styles.input}
                value={petForm.name}
                onChange={e => setPetForm({ ...petForm, name: e.target.value })}
              />
            </label>

            <label>
              Пол
              <div className={styles.sexSwitcher}>
                <button onClick={() => setPetForm({ ...petForm, sex: 'M' })}>М</button>
                <button onClick={() => setPetForm({ ...petForm, sex: 'F' })}>Ж</button>
              </div>
            </label>

            <label>
              Вид
              <select className={styles.input} onChange={e => handleTypeChange(e.target.value)}>
                <option></option>
                {petTypes.map(t => (
                  <option key={t.id_type} value={t.id_type}>
                    {t.name_type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Порода
              <input
                className={styles.input}
                value={breedSearch}
                onChange={e => setBreedSearch(e.target.value)}
              />
              {breedDropdownOpen && filteredBreeds.map(b => (
                <div key={b.id_breed} onClick={() =>
                  setPetForm({ ...petForm, id_breed: b.id_breed })
                }>
                  {b.name_breed}
                </div>
              ))}
            </label>

            <label>
              Дата рождения
              <input className={styles.input} type="date"
                onChange={e => setPetForm({ ...petForm, date_birth: e.target.value })}
              />
            </label>

            <div className={styles.modalActions}>
              <button onClick={() => setIsAddPetOpen(false)} className={styles.cancelBtn}>Отмена</button>
              <button onClick={addPet} className={styles.saveBtn}>Сохранить</button>
            </div>

          </div>
        </div>
      )}

      {/* ===== MODAL RECORD ===== */}
      {isAddRecord && (
        <div className={styles.modalOverlay} onClick={() => setIsAddRecord(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <h2>Запись</h2>

            <label>
              Питомец
              <select className={styles.input}
                onChange={e => setRecordForm({ ...recordForm, pet_id: e.target.value })}
              >
                {clientData.pets.map(p => (
                  <option key={p.id_pet} value={p.id_pet}>{p.name}</option>
                ))}
              </select>
            </label>

            <label>
              Услуга
              <select className={styles.input}
                onChange={e => setRecordForm({ ...recordForm, service_id: e.target.value })}
              >
                {servicesList.map(s => (
                  <option key={s.id_service} value={s.id_service}>
                    {s.name_service}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Врач
              <select className={styles.input} onChange={e => onVetChange(e.target.value)}>
                {vets.map(v => (
                  <option key={v.id_emp} value={v.id_emp}>
                    {v.name_emp}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Дата
              <DatePicker 
                selected={recordForm.date_service} 
                onChange={onDateChange} 
                minDate={new Date()} // <-- ЗАПРЕЩАЕТ ВЫБОР ПРОШЕДШИХ ДАТ
                dateFormat="yyyy-MM-dd" // Для порядка, чтобы понятнее было
                placeholderText="Выберите дату"
              />
            </label>

            <label>
              Время
              <select className={styles.input}
                onChange={e => setRecordForm({ ...recordForm, time_service: e.target.value })}
              >
                {availableSlots.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>

            <textarea
              className={styles.input}
              onChange={e => setRecordForm({ ...recordForm, comment: e.target.value })}
            />

            <div className={styles.modalActions}>
              <button onClick={() => setIsAddRecord(false)} className={styles.cancelBtn}>Отмена</button>
              <button onClick={addRecord} className={styles.saveBtn}>Сохранить</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ClientDashboard;