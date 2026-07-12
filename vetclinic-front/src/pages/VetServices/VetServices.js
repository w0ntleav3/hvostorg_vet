import React, { useEffect, useState, useMemo } from 'react';
import styles from './VetServices.module.css';

function VetServices() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(res => res.json())
      .then(setServices)
      .catch(err => console.error('Ошибка загрузки услуг:', err));
  }, []);

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const visibleServices = useMemo(() => {
    let result = [...services];

    if (search) {
      result = result.filter(s =>
        s.name_service.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'cost') {
          aVal = Number(aVal);
          bVal = Number(bVal);
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [services, search, sortConfig]);

  const sortIcon = (key) => {
    if (sortConfig.key !== key) return ' ⇅';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className={styles.wrapper}>
      <h2>Услуги</h2>

      <input
        type="text"
        placeholder="Поиск услуги..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={styles.search}
      />

      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => requestSort('name_service')}>
              Название{sortIcon('name_service')}
            </th>
            <th onClick={() => requestSort('cost')}>
              Цена{sortIcon('cost')}
            </th>
          </tr>
        </thead>

        <tbody>
          {visibleServices.length ? (
            visibleServices.map(service => (
              <tr key={service.id_service}>
                <td className={styles.serviceName}>
                  {service.name_service}
                </td>
                <td className={styles.costCell}>
                  {service.cost} ₽
                </td>
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

export default VetServices;