import React, { useState, useEffect } from 'react';
import styles from './BreedModal.module.css';

function BreedModal({ type, onClose }) {
  const [breeds, setBreeds] = useState([]);
  const [newBreed, setNewBreed] = useState('');
  const [breedSearch, setBreedSearch] = useState('');

  const loadBreeds = () => {
    fetch(`http://localhost:5000/api/breeds?type_id=${type.id_type}`)
      .then(res => res.json())
      .then(setBreeds);
  };

  useEffect(() => {
    loadBreeds();
  }, [type]);

  const handleAdd = async () => {
    if (!newBreed.trim()) return;
    await fetch('http://localhost:5000/api/breeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name_breed: newBreed, id_type: type.id_type })
    });
    setNewBreed('');
    loadBreeds();
  };

  const filteredBreeds = breeds.filter(b => 
    b.name_breed.toLowerCase().includes(breedSearch.toLowerCase())
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Породы: {type.name_type}</h3>
        
        <input 
          placeholder="Поиск породы..." 
          value={breedSearch} 
          onChange={e => setBreedSearch(e.target.value)} 
        />

        <div className={styles.addBlock}>
          <input 
            placeholder="Новая порода" 
            value={newBreed} 
            onChange={e => setNewBreed(e.target.value)} 
          />
          <button onClick={handleAdd}>+</button>
        </div>

        <ul>
          {filteredBreeds.map(b => <li key={b.id_breed}>{b.name_breed}</li>)}
        </ul>
        
        <button onClick={onClose} className={styles.closeBtn}>Закрыть</button>
      </div>
    </div>
  );
}

export default BreedModal;