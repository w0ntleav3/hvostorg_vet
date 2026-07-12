import React, { useState, useEffect, useMemo } from 'react';
import styles from './VetRecords.module.css';
import { useAuth } from '../../contexts/AuthContext';

function VetRecords() {
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('my');

  const [sortConfig, setSortConfig] = useState({
    key: 'date_service',
    direction: 'desc'
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetch('http://localhost:5000/api/records/with-details')
      .then(res => res.json())
      .then(setRecords)
      .catch(console.error);
  }, []);

  const requestSort = (key) => {
    setSortConfig(prev =>
      prev.key === key && prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    );
  };

  const modeFilteredRecords = useMemo(() => {
    if (filterMode === 'my' && user?.id_emp) {
      return records.filter(r => Number(r.employee_id) === Number(user.id_emp));
    }
    return records;
  }, [records, filterMode, user]);

  const filteredRecords = useMemo(() => {
    return modeFilteredRecords.filter(r =>
      (r.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.pet_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.service_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [modeFilteredRecords, searchTerm]);

  const sortedRecords = useMemo(() => {
    const arr = [...filteredRecords];

    arr.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';

      if (sortConfig.key === 'date_service') {
        return sortConfig.direction === 'asc'
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      }

      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return arr;
  }, [filteredRecords, sortConfig]);

  const groupedByDate = useMemo(() => {
    const map = {};
    modeFilteredRecords.forEach(r => {
      if (!r.date_service) return;

      const key = new Date(r.date_service).toISOString().split('T')[0];

      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [modeFilteredRecords]);

  const monthNames = [
    'Январь','Февраль','Март','Апрель','Май','Июнь',
    'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
  ];

  const currentMonthDays = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();

    const days = new Date(y, m + 1, 0).getDate();

    return Array.from({ length: days }, (_, i) => {
      const date = new Date(y, m, i + 1);
      return {
        day: i + 1,
        full: date.toISOString().split('T')[0]
      };
    });
  }, [currentMonth]);

  const isFuture = (dateStr) =>
    new Date(dateStr) > new Date();

  const cancelRecord = async (id) => {
    const ok = window.confirm('Отменить запись?');
    if (!ok) return;

    await fetch(`http://localhost:5000/api/records/${id}`, {
      method: 'DELETE'
    });

    setRecords(prev => prev.filter(r => r.id_record !== id));
  };

  const formatTime = (d) => {
    return new Date(d).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>

        <div className={styles.left}>

          <div className={styles.topBar}>
            <div className={styles.tabs}>
              <button
                className={filterMode === 'my' ? styles.activeTab : ''}
                onClick={() => setFilterMode('my')}
              >
                мои
              </button>

              <button
                className={filterMode === 'all' ? styles.activeTab : ''}
                onClick={() => setFilterMode('all')}
              >
                все
              </button>
            </div>

            <input
              placeholder="поиск..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => requestSort('client_name')}>Клиент</th>
                <th onClick={() => requestSort('pet_name')}>Питомец</th>
                <th onClick={() => requestSort('service_name')}>Услуга</th>
                <th onClick={() => requestSort('date_service')}>Дата</th>
              </tr>
            </thead>

            <tbody>
              {sortedRecords.map(r => (
                <tr key={r.id_record}>
                  <td>{r.client_name}</td>
                  <td>{r.pet_name}</td>
                  <td>{r.service_name}</td>
                  <td>{new Date(r.date_service).toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        <div className={styles.right}>
          <div className={styles.calendar}>

            <div className={styles.month}>
              <button onClick={() =>
                setCurrentMonth(p =>
                  new Date(p.getFullYear(), p.getMonth() - 1, 1)
                )
              }>←</button>

              <div>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>

              <button onClick={() =>
                setCurrentMonth(p =>
                  new Date(p.getFullYear(), p.getMonth() + 1, 1)
                )
              }>→</button>
            </div>

            <div className={styles.grid}>
              {currentMonthDays.map(d => {
                const has = groupedByDate[d.full]?.length > 0;
                const isToday = d.full === new Date().toISOString().split('T')[0];

                return (
                  <button
                    key={d.full}
                    className={`
                      ${styles.day}
                      ${has ? styles.has : ''}
                      ${isToday ? styles.today : ''}
                      ${selectedDate === d.full ? styles.selected : ''}
                    `}
                    onClick={() => setSelectedDate(d.full)}
                  >
                    {d.day}
                  </button>
                );
              })}
            </div>

            <div className={styles.slots}>
              <h4>Записи на {selectedDate}</h4>

              {(groupedByDate[selectedDate] || []).map(r => (
                <div key={r.id_record} className={styles.slot}>
                  <div>
                    <b className={styles.time}>{formatTime(r.date_service)}</b>
                    <span>{r.pet_name}</span>
                  </div>

                  {isFuture(r.date_service) && (
                    <button
                      className={styles.cancel}
                      onClick={() => cancelRecord(r.id_record)}
                    >
                      Отменить
                    </button>
                  )}
                </div>
              ))}

              {!groupedByDate[selectedDate]?.length && (
                <div className={styles.empty}>нет записей</div>
              )}

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default VetRecords;