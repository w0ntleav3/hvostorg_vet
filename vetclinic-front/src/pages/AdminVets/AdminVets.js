import React, { useState, useEffect } from 'react';
import styles from '../Admin_main_page/Admin.main.page.module.css';

function VetsPage() {
  const [vets, setVets] = useState([]);
  const [selectedVetId, setSelectedVetId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // 🔥

  useEffect(() => {
    fetch('http://localhost:5000/api/vets/with-records')
      .then(res => res.json())
      .then(data => setVets(data))
      .catch(err => console.error(err));
  }, []);

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 🔥 Сортировка врачей
  const sortedVets = React.useMemo(() => {
    let sortable = [...vets];
    if (sortConfig.key !== null) {
      sortable.sort((a, b) => {
        let aVal = sortConfig.key === 'rating' ? (a[sortConfig.key] ?? 0) : (a[sortConfig.key] || '');
        let bVal = sortConfig.key === 'rating' ? (b[sortConfig.key] ?? 0) : (b[sortConfig.key] || '');

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [vets, sortConfig]);

  const allFutureRecords = vets.flatMap(v =>
    v.future_records.map(r => ({
      ...r,
      vet_id: v.id_emp,
      vet_name: v.name
    }))
  );

  const displayedRecords = (
    selectedVetId ? allFutureRecords.filter(r => r.vet_id === selectedVetId) : allFutureRecords
  ).sort((a, b) => new Date(a.date_service) - new Date(b.date_service));

  return (
    <div className={styles.vetsPage}>
      <div className={styles.tableContainer}>
        
        {/* ЛЕВАЯ ТАБЛИЦА */}
        <div className={styles.leftTable}>
          <h2>Все врачи</h2>
          <table className={styles.table}>
            <thead>
              <tr style={{ userSelect: 'none' }}>
                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>Имя{sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}</th>
                <th onClick={() => requestSort('spec')} style={{ cursor: 'pointer' }}>Специализация{sortConfig.key === 'spec' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}</th>
                <th onClick={() => requestSort('rating')} style={{ cursor: 'pointer' }}>Рейтинг{sortConfig.key === 'rating' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}</th>
              </tr>
            </thead>
            <tbody>
              {sortedVets.map(v => (
                <tr
                  key={v.id_emp}
                  onClick={() => setSelectedVetId(v.id_emp)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedVetId === v.id_emp ? '#f0f0f0' : 'transparent'
                  }}
                >
                  <td>{v.name}</td>
                  <td>{v.spec}</td>
                  <td>{v.rating ?? '-'}</td>
                </tr>
              ))}
              <tr onClick={() => setSelectedVetId(null)} style={{ cursor: 'pointer', fontStyle: 'italic', backgroundColor: !selectedVetId ? '#f0f0f0' : 'transparent' }}>
                <td colSpan={3}>Показать всех</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ПРАВАЯ ТАБЛИЦА */}
        <div className={styles.rightTable}>
          <h2>Будущие записи {selectedVetId ? '(фильтр по врачу)' : ''}</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Врач</th>
                <th>Дата и время</th>
                <th>Питомец</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.map(r => (
                <tr key={r.id_record}>
                  <td>{r.vet_name}</td>
                  <td>{formatDateTime(r.date_service)}</td>
                  <td>{r.pet_name}</td>
                </tr>
              ))}
              {displayedRecords.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>Нет будущих записей</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default VetsPage;