import React, { useState, useEffect, useMemo } from 'react';
import styles from '../Admin_main_page/Admin.main.page.module.css';
import { useNavigate, useLocation } from 'react-router-dom';


function AdminPets() {
  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/pets')
      .then(res => res.json())
      .then(setPets)
      .catch(err => console.error('Ошибка загрузки питомцев:', err));
  }, []);

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredPets = useMemo(() => {
    const q = searchTerm.toLowerCase();

    return pets.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.type || '').toLowerCase().includes(q) ||
      (p.breed_info?.name_breed || p.breed || '').toLowerCase().includes(q) ||
      (p.owner?.name || '').toLowerCase().includes(q)
    );
  }, [pets, searchTerm]);

  const sortedPets = useMemo(() => {
    const arr = [...filteredPets];

    const getValue = (p, key) => {
      switch (key) {
        case 'type':
          return p.breed_info?.type || p.type || '';
        case 'breed':
          return p.breed_info?.name_breed || p.breed || '';
        case 'owner':
          return p.owner?.name || '';
        default:
          return p[key] || '';
      }
    };

    if (sortConfig.key) {
      arr.sort((a, b) => {
        const aVal = getValue(a, sortConfig.key).toString().toLowerCase();
        const bVal = getValue(b, sortConfig.key).toString().toLowerCase();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }, [filteredPets, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return ' ⇅';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div>
      <h2>Питомцы</h2>

      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Поиск по питомцам..."
        className={styles.searchInput}
      />

      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => requestSort('name')}>Кличка{getSortIcon('name')}</th>
            <th onClick={() => requestSort('type')}>Вид{getSortIcon('type')}</th>
            <th onClick={() => requestSort('breed')}>Порода{getSortIcon('breed')}</th>
            <th onClick={() => requestSort('sex')}>Пол{getSortIcon('sex')}</th>
            <th onClick={() => requestSort('date_birth')}>Дата рождения{getSortIcon('date_birth')}</th>
            <th onClick={() => requestSort('owner')}>Клиент{getSortIcon('owner')}</th>
          </tr>
        </thead>

        <tbody>
          {sortedPets.map(pet => (
            <tr
              key={pet.id_pet}
                onClick={() => navigate(`/admin/pet/${pet.id_pet}`, { 
                  state: { from: location.pathname } 
                })}
                style={{ cursor: 'pointer' }}
            >
              <td>{pet.name}</td>
              <td>{pet.breed_info?.type || pet.type || '-'}</td>
              <td>{pet.breed_info?.name_breed || pet.breed || '-'}</td>
              <td>
                {pet.sex?.toUpperCase() === 'M'
                  ? 'Мужской'
                  : pet.sex?.toUpperCase() === 'F'
                  ? 'Женский'
                  : '-'}
              </td>
              <td>{pet.date_birth || '-'}</td>
              <td>
                <span
                  style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/admin/clients/${pet.id_client}`);
                  }}
                >
                  {pet.owner?.name || 'Неизвестен'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPets;