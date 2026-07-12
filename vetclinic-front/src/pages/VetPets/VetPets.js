import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './VetPets.module.css';

function VetPets() {
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetch('http://localhost:5000/api/pets')
      .then(res => res.json())
      .then(data => setPets(data))
      .catch(err => console.error('Ошибка загрузки питомцев:', err));
  }, []);

  const PET_TYPES = [
    { value: 'cat', label: 'Кошка' },
    { value: 'dog', label: 'Собака' },
    { value: 'parrot', label: 'Попугай' },
    { value: 'hamster', label: 'Хомяк' },
    { value: 'other', label: 'Другое' }
  ];

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredPets = pets.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.breed || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPets = useMemo(() => {
    let arr = [...filteredPets];

    if (sortConfig.key) {
      arr.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        if (sortConfig.key === 'type') {
          aVal = PET_TYPES.find(t => t.value === a.type)?.label || a.type || '';
          bVal = PET_TYPES.find(t => t.value === b.type)?.label || b.type || '';
        }

        if (sortConfig.key === 'owner') {
          aVal = a.owner?.name || '';
          bVal = b.owner?.name || '';
        }

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }, [filteredPets, sortConfig]);

  const getIcon = (key) => {
    if (sortConfig.key !== key) return ' ⇅';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className={styles.wrapper}>
      <h2>Питомцы</h2>

      <input
        type="text"
        placeholder="Поиск по питомцам..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className={styles.search}
      />

      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => requestSort('name')}>Кличка{getIcon('name')}</th>
            <th onClick={() => requestSort('type')}>Вид{getIcon('type')}</th>
            <th onClick={() => requestSort('breed')}>Порода{getIcon('breed')}</th>
            <th onClick={() => requestSort('sex')}>Пол{getIcon('sex')}</th>
            <th onClick={() => requestSort('date_birth')}>Дата рождения{getIcon('date_birth')}</th>
            <th onClick={() => requestSort('owner')}>Клиент{getIcon('owner')}</th>
          </tr>
        </thead>

        <tbody>
          {sortedPets.length > 0 ? (
            sortedPets.map(pet => (
              <tr
                key={pet.id_pet}
                className={styles.rowClickable}
                onClick={() =>
                  navigate(`/admin/pet/${pet.id_pet}`, {
                    state: { from: '/vet/pets' }
                  })
                }
              >
                <td className={styles.petName}>{pet.name}</td>
                <td>{pet.type || '-'}</td>
                <td>{pet.breed || '-'}</td>
                <td>
                  {pet.sex === 'M'
                    ? 'Мужской'
                    : pet.sex === 'F'
                    ? 'Женский'
                    : '-'}
                </td>
                <td>{pet.date_birth || '-'}</td>
                <td>{pet.owner?.name || 'Неизвестен'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className={styles.empty}>
                Записей не найдено
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default VetPets;