import React, { useEffect, useState, useMemo } from 'react';
import styles from './AdminServices.module.css';

function AdminServices() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'name_service',
    direction: 'asc'
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(res => res.json())
      .then(setServices)
      .catch(err => console.error('Ошибка загрузки услуг:', err));
  }, []);

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredServices = useMemo(() => {
    const q = search.toLowerCase();

    return services.filter(s =>
      (s.name_service || '').toLowerCase().startsWith(q)
    );
  }, [services, search]);

  const sortedServices = useMemo(() => {
    const arr = [...filteredServices];

    const getValue = (s, key) => {
      if (key === 'cost') return Number(s.cost) || 0;
      return (s[key] || '').toString().toLowerCase();
    };

    if (sortConfig.key) {
      arr.sort((a, b) => {
        const aVal = getValue(a, sortConfig.key);
        const bVal = getValue(b, sortConfig.key);

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }, [filteredServices, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return ' ⇅';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className={styles.wrapper}>
      <h2>Услуги</h2>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="поиск услуги..."
        className={styles.search}
      />

      <table className={styles.table}>
        <thead>
          <tr>
            <th
              onClick={() => requestSort('name_service')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Название {getSortIcon('name_service')}
            </th>

            <th
              onClick={() => requestSort('cost')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Цена {getSortIcon('cost')}
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedServices.length ? (
            sortedServices.map(service => (
              <tr key={service.id_service}>
                <td>{service.name_service}</td>
                <td>{service.cost} ₽</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className={styles.empty}>
                Ничего не найдено
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminServices;