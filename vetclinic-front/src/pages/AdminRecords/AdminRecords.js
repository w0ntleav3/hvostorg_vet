import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Admin_main_page/Admin.main.page.module.css';

function AdminRecords() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'date_service',
    direction: 'desc'
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/records/with-details')
      .then(res => res.json())
      .then(setRecords)
      .catch(err => console.error('Ошибка загрузки записей:', err));
  }, []);

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();

    return records.filter(r =>
      (r.client_name || '').toLowerCase().includes(q) ||
      (r.pet_name || '').toLowerCase().includes(q) ||
      (r.service_name || '').toLowerCase().includes(q) ||
      (r.employee_name || '').toLowerCase().includes(q)
    );
  }, [records, searchTerm]);

  const sortedRecords = useMemo(() => {
    const arr = [...filteredRecords];

    const getValue = (r, key) => {
      if (key === 'date_service') return new Date(r[key] || 0).getTime();
      return (r[key] || '').toString().toLowerCase();
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
  }, [filteredRecords, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return ' ⇅';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div>
      <h2>Все записи</h2>

      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="поиск по записям..."
        className={styles.searchInput}
      />

      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => requestSort('client_name')}>Клиент{getSortIcon('client_name')}</th>
            <th onClick={() => requestSort('pet_name')}>Питомец{getSortIcon('pet_name')}</th>
            <th onClick={() => requestSort('service_name')}>Услуга{getSortIcon('service_name')}</th>
            <th onClick={() => requestSort('date_service')}>Дата{getSortIcon('date_service')}</th>
            <th onClick={() => requestSort('employee_name')}>Врач{getSortIcon('employee_name')}</th>
            <th>Комментарий</th>
            <th>Файл</th>
          </tr>
        </thead>

        <tbody>
          {sortedRecords.map(record => (
            <tr key={record.id_record}>
              <td>
                <span
                  style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/clients/${record.client_id}`)}
                >
                  {record.client_name || 'Неизвестен'}
                </span>
              </td>

              <td>
                <span
                  style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/pet/${record.pet_id}`)}
                >
                  {record.pet_name || 'Неизвестен'}
                </span>
              </td>

              <td>{record.service_name || '-'}</td>
              <td>{record.date_service || '-'}</td>
              <td>{record.employee_name || '-'}</td>
              <td>{record.comment || '-'}</td>

              <td>
                {record.file_link ? (
                  <a href={record.file_link} target="_blank" rel="noreferrer">
                    скачать
                  </a>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminRecords;