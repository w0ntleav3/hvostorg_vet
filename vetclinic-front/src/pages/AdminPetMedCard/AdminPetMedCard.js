import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminPetMedCard.module.css';

function AdminPetMedCard() {
  const { id_pet } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);

  const goBack = () => {
  const from = location.state?.from;

  if (from) {
    navigate(from);
  } else {
    // fallback если открыли прямой ссылкой
    navigate('/'); 
  }
};

  const [isAddDiagnosisOpen, setIsAddDiagnosisOpen] = useState(false);

  const [diagnosisForm, setDiagnosisForm] = useState({
    id_diagnosis: '',
    date_diagnosis: new Date().toISOString().slice(0, 10),
    status: true,
    comments: ''
  });

  const [allDiagnoses, setAllDiagnoses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Группируем диагнозы по классам и фильтруем по поиску
  const groupedDiagnoses = allDiagnoses
    .filter(d => 
      d.name_diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id_diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .reduce((acc, d) => {
      const className = d.classs?.name_class || 'Без категории';
      if (!acc[className]) acc[className] = [];
      acc[className].push(d);
      return acc;
    }, {});

  const getDiagnosisDetails = (d) => {
    // 1. Код диагноза
    const code = d.id_diagnosis || d.diagnosis_rel?.id_diagnosis || '-';
    
    // 2. Название диагноза
    const name = d.diagnosis_rel?.name_diagnosis || d.name_diagnosis || '-';
    
    // 3. Имя класса 
    const className = 
      d.diagnosis_rel?.classs?.name_class || // Стандарт
      d.diagnosis_rel?.class_rel?.name_class || // Вариант 2
      d.classs?.name_class || // Если объект класса прикреплен напрямую к записи
      '-';
    
    // 4. Флаг опасности
    const isDangerous = d.diagnosis_rel?.is_dangerous ?? d.is_dangerous ?? false;

    return { name, className, code, isDangerous };
  };

  // ЗАГРУЗКА ПИТОМЦА
  useEffect(() => {
    if (!user?.token) return;

    const loadPet = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pets/${id_pet}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        const text = await res.text();

        try {
          const data = JSON.parse(text);

          console.log('PET DATA:', data);

          setPetData(data);
        } catch (jsonError) {
          console.error('Ответ не JSON:', text);
          throw new Error('Сервер вернул не JSON');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPet();
  }, [id_pet, user]);

  // ЗАГРУЗКА ДИАГНОЗОВ
  useEffect(() => {
    if (!user?.token) return;

    fetch('http://localhost:5000/api/diagnoses', {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    })
      .then(async res => {
        const text = await res.text();

        try {
          return JSON.parse(text);
        } catch {
          console.error('diagnoses не json:', text);
          return [];
        }
      })
      .then(setAllDiagnoses)
      .catch(console.error);
  }, [user]);

  // ДОБАВЛЕНИЕ ДИАГНОЗА
 const addDiagnosis = async () => {
  if (user?.role !== 2) {
    alert('У вас нет прав на добавление диагнозов');
    return;
  }
  const medCard = petData?.med_cards?.[0];

  if (!medCard?.id_med_card) {
    alert('нет медкарты');
    return;
  }

  const idDiag = diagnosisForm.id_diagnosis;

  if (!idDiag) {
    alert('Выберите диагноз');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/diagnosis_pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        id_med_card: medCard.id_med_card,
        id_diagnosis: idDiag,
        date_diagnosis: diagnosisForm.date_diagnosis,
        status: diagnosisForm.status,
        comments: diagnosisForm.comments
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'ошибка');
      return;
    }

    // Находим выбранный диагноз в общем списке, чтобы вытащить его название и класс
    const chosenDiagnosis = allDiagnoses.find(d => String(d.id_diagnosis) === String(idDiag));

    // Универсальный поиск имени класса в зависимости от того, как его отдал бэкенд
    const extractedClassName = 
      chosenDiagnosis?.classs?.name_class || 
      chosenDiagnosis?.class_rel?.name_class || 
      chosenDiagnosis?.diagnosis_class?.name_class || 
      chosenDiagnosis?.name_class || 
      '-';

    setPetData(prev => ({
      ...prev,
      med_cards: [
        {
          ...prev.med_cards[0],
          diagnoses: [
            ...(prev.med_cards[0].diagnoses || []),
            {
              id_diagnosis_record: data.id_diagnosis_record || data.id_diagnosis_pet,
              id_med_card: medCard.id_med_card,
              id_diagnosis: idDiag,
              date_diagnosis: diagnosisForm.date_diagnosis,
              status: diagnosisForm.status,
              comments: diagnosisForm.comments,
              diagnosis_rel: {
                id_diagnosis: idDiag,
                name_diagnosis: chosenDiagnosis?.name_diagnosis || 'Диагноз добавлен',
                is_dangerous: chosenDiagnosis?.is_dangerous || false, // <--- Добавьте это
                classs: {
                  name_class: extractedClassName
                }
              }
            }
          ]
        }
      ]
    }));

    setIsAddDiagnosisOpen(false);
  } catch (e) {
    console.error(e);
    alert('Ошибка сервера');
  }
};

  // LOADING
  if (loading) return <p>Загрузка...</p>;

  if (!petData || petData.error) {
    return <p>Питомец не найден</p>;
  }

  // ДАННЫЕ
  const medCard =
    petData.med_cards?.length > 0
      ? petData.med_cards[0]
      : null;

  const records = medCard?.records || [];

  const sortedRecords = [...records].sort(
    (a, b) =>
      new Date(b.date_service) -
      new Date(a.date_service)
  );

  const diagnoses = medCard?.diagnoses || [];

  const sortedDiagnoses = [...diagnoses].sort((a, b) => {
    if (a.status === b.status) {
      return (
        new Date(b.date_diagnosis) -
        new Date(a.date_diagnosis)
      );
    }

    return a.status ? -1 : 1;
  });

  const updateRecord = async (id_record, fields) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/records/${id_record}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(fields)
      }
    );

    if (!res.ok) {
      throw new Error('Ошибка обновления');
    }

    const data = await res.json();

    console.log('UPDATED:', data);
  } catch (e) {
    console.error(e);
    alert('не удалось сохранить 💀');
  }
};

const updateDiagnosis = async (id_diagnosis_record, fields) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/diagnosis_pets/${id_diagnosis_record}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(fields)
      }
    );

    if (!res.ok) {
      throw new Error('Ошибка обновления');
    }

    const data = await res.json();

    console.log('UPDATED:', data);

  } catch (e) {
    console.error(e);
    alert('Не удалось обновить диагноз');
  }
};


  return (
    <div className={styles.dashboard}>
      <button className={styles.backBtn} onClick={goBack}>
        ← Назад
      </button>

      <h1>Медкарта питомца: {petData.name}</h1>

      <section className={styles.info}>
        <p>
          Вид:{' '}
          {petData.breed_info?.type || petData.type || '-'}
        </p>

        <p>
          Пол:{' '}
          {petData.sex === 'M'
            ? 'Самец'
            : petData.sex === 'F'
            ? 'Самка'
            : '-'}
        </p>

        <p>
          Порода: {petData.breed_info?.name_breed || petData.breed || '-'}
        </p>

        <p>
          Дата рождения:{' '}
          {petData.date_birth || '-'}
        </p>
      </section>

      {/* УСЛУГИ */}
      <section className={styles.records}>
        <h2>Услуги</h2>

        {sortedRecords.length === 0 ? (
          <p>Записей пока нет</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Услуга</th>
                <th>Цена</th>
                <th>Врач</th>
                <th>Комментарий</th>
                <th>Файл</th>
              </tr>
            </thead>

            <tbody>
              {sortedRecords.map(record => (
                <tr key={record.id_record}>
                  <td>
                    {record.date_service
                      ? new Date(
                          record.date_service
                        ).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      : '-'}
                  </td>

                  <td>
                    {record.service?.name_service || '-'}
                  </td>

                  <td>
                    {record.service?.cost ?? '-'}
                  </td>

                  <td>
                    {record.employee?.name ||
                      record.employee?.name_emp ||
                      '-'}
                  </td>

                  <td>
                    <input
                      type="text"
                      value={record.comment || ''}
                      onChange={e => {
                        const value = e.target.value;

                        setPetData(prev => ({
                          ...prev,
                          med_cards: [
                            {
                              ...prev.med_cards[0],
                              records:
                                prev.med_cards[0].records.map(r =>
                                  r.id_record === record.id_record
                                    ? {
                                        ...r,
                                        comment: value
                                      }
                                    : r
                                )
                            }
                          ]
                        }));
                      }}

                      onBlur={e =>
                        updateRecord(record.id_record, {
                          comment: e.target.value
                        })
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      value={record.file_link || ''}
                      placeholder="Ссылка"

                      onChange={e => {
                        const value = e.target.value;

                        setPetData(prev => ({
                          ...prev,
                          med_cards: [
                            {
                              ...prev.med_cards[0],
                              records:
                                prev.med_cards[0].records.map(r =>
                                  r.id_record === record.id_record
                                    ? {
                                        ...r,
                                        file_link: value
                                      }
                                    : r
                                )
                            }
                          ]
                        }));
                      }}

                      onBlur={e =>
                        updateRecord(record.id_record, {
                          file_link: e.target.value
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ДИАГНОЗЫ */}
        <section className={styles.records}>
          <div className={styles.sectionHeaderCenter}>
            <h2>Диагнозы</h2>

            {/* Добавляем проверку роли (2 - это ветврач) */}
            {user?.role === 2 && (
              <button
                className={`${styles.actionBtn} ${styles.addBtn}`}
                onClick={() => setIsAddDiagnosisOpen(true)}
              >
                + Добавить диагноз
              </button>
            )}
          </div>

        {sortedDiagnoses.length === 0 ? (
          <p>Диагнозов пока нет</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Код</th>
                <th>Название</th>
                <th>Класс</th>
                <th>Статус</th>
                <th>Комментарии</th>
              </tr>
            </thead>
            <tbody>
              {sortedDiagnoses.map(d => {
                const details = getDiagnosisDetails(d);
                return (
                  <tr key={d.id_diagnosis_record || `${d.id_diagnosis}-${d.date_diagnosis}`}>
                    <td>{d.date_diagnosis ? new Date(d.date_diagnosis).toLocaleDateString('ru-RU') : '-'}</td>
                    <td>
                      {/* Выводим флаг перед кодом */}
                      {details.isDangerous ? '⚠️ ' : ''}{details.code}
                    </td>
                    <td>{details.name}</td>
                    <td>{details.className}</td>
                    <td>
                      {user?.role === 2 ? (
                        <select
                          value={d.status ? 'active' : 'closed'}
                          onChange={e => {
                            const newStatus = e.target.value === 'active';

                            // обновляем UI локально
                            setPetData(prev => ({
                              ...prev,
                              med_cards: [
                                {
                                  ...prev.med_cards[0],
                                  diagnoses: prev.med_cards[0].diagnoses.map(diag =>
                                    diag.id_diagnosis_record === d.id_diagnosis_record
                                      ? {
                                          ...diag,
                                          status: newStatus
                                        }
                                      : diag
                                  )
                                }
                              ]
                            }));

                            // PATCH запрос
                            updateDiagnosis(d.id_diagnosis_record, {
                              status: newStatus
                            });
                          }}
                        >
                          <option value="active">Активен</option>
                          <option value="closed">Закрыт</option>
                        </select>
                      ) : (
                        d.status ? 'Активен' : 'Закрыт'
                      )}
                    </td>
                    <td>{d.comments || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* МОДАЛКА */}
{isAddDiagnosisOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h2>Добавить диагноз</h2>

      <label>
        Диагноз
        {/* Поле поиска */}
        <input 
          type="text" 
          placeholder="Поиск по названию или коду..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: '8px' }}
        />
        
        {/* Список с группировкой */}
        <select
          size="8"
          value={diagnosisForm.id_diagnosis || ''}
          onChange={e => setDiagnosisForm({...diagnosisForm, id_diagnosis: e.target.value})}
          style={{ width: '100%' }}
        >
          <option value="">-- Выберите диагноз --</option>
          {Object.entries(groupedDiagnoses).map(([className, diagnoses]) => (
            <optgroup key={className} label={className}>
              {diagnoses.map(d => (
                <option key={d.id_diagnosis} value={d.id_diagnosis}>
                  {d.is_dangerous ? '⚠️ ' : ''}{d.id_diagnosis} — {d.name_diagnosis}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label>
        Дата
        <input
          type="date"
          value={diagnosisForm.date_diagnosis}
          onChange={e => setDiagnosisForm({...diagnosisForm, date_diagnosis: e.target.value})}
        />
      </label>

      <label>
        Статус
        <select
          value={diagnosisForm.status ? 'active' : 'closed'}
          onChange={e => setDiagnosisForm({...diagnosisForm, status: e.target.value === 'active'})}
        >
          <option value="active">Активен</option>
          <option value="closed">Закрыт</option>
        </select>
      </label>

      <label>
        Комментарий
        <textarea
          value={diagnosisForm.comments}
          onChange={e => setDiagnosisForm({...diagnosisForm, comments: e.target.value})}
        />
      </label>

      <div className={styles.modalActions}>
        <button className={styles.cancelBtn} onClick={() => setIsAddDiagnosisOpen(false)}>
          Отмена
        </button>
        <button className={styles.saveBtn} onClick={addDiagnosis}>
          Сохранить
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default AdminPetMedCard;