import React, { useEffect, useState } from 'react';
import styles from './AdminPetTypes.module.css';
import BreedModal from '../BreedModal/BreedModal'; 

function AdminPetTypes() {
  const [petTypes, setPetTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [newType, setNewType] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name_type', direction: 'asc' }); 
  const [selectedType, setSelectedType] = useState(null);
  
  // 1. Добавляем стейт для открытия модалки создания
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadPetTypes();
  }, []);

  const loadPetTypes = () => {
    fetch('http://localhost:5000/api/pet_types')
      .then(res => res.json())
      .then(data => setPetTypes(data))
      .catch(err => console.error('Ошибка загрузки типов животных:', err));
  };

  const handleAddType = async () => {
    if (!newType.trim()) return;
    try {
      const response = await fetch('http://localhost:5000/api/pet_types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_type: newType })
      });
      if (!response.ok) throw new Error('Ошибка добавления');
      
      setNewType('');
      setIsCreateModalOpen(false); // 2. Закрываем модалку после успешного добавления
      loadPetTypes();
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredTypes = petTypes.filter(type =>
    type.name_type.toLowerCase().startsWith(search.toLowerCase())
  );

  const sortedTypes = React.useMemo(() => {
    let sortable = [...filteredTypes];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredTypes, sortConfig]);

  return (
    <div className={styles.wrapper}>
      <h2>Типы животных</h2>

      <div className={styles.topBar}>
        <input
          type="text"
          placeholder="Поиск типа..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.search}
        />

        {/* 3. Заменяем старый блок инпута на простую кнопку открытия модалки */}
        <button onClick={() => setIsCreateModalOpen(true)} className={styles.addBtn}>
          + Добавить новый тип
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr style={{ userSelect: 'none' }}>
            <th onClick={() => requestSort('name_type')} style={{ cursor: 'pointer' }}>
              Тип животного {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTypes.length ? (
            sortedTypes.map(type => (
              <tr key={type.id_type} onClick={() => setSelectedType(type)} style={{ cursor: 'pointer' }}>
                <td>{type.name_type}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.empty}>Ничего не найдено</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Модалка просмотра пород (уже была у тебя) */}
      {selectedType && (
        <BreedModal 
          type={selectedType} 
          onClose={() => setSelectedType(null)} 
        />
      )}

      {/* 4. Новая модалка для создания типа животного */}
      {isCreateModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Добавить новый тип животного</h3>
            <input
              type="text"
              placeholder="Например: Ящерицы"
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className={styles.modalInput}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setIsCreateModalOpen(false)} className={styles.cancelBtn}>
                Отмена
              </button>
              <button onClick={handleAddType} className={styles.saveBtn}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPetTypes;