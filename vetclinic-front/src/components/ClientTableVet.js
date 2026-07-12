import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ClientTableVet.module.css"; 

function ClientTableVet({ clients }) {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleClick = (id_client) => {
        navigate(`/vet/clients/${id_client}`);
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedClients = useMemo(() => {
        let sortable = [...clients];
        if (sortConfig.key !== null) {
            sortable.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'id_client' || sortConfig.key === 'discount') {
                    aVal = Number(aVal) || 0;
                    bVal = Number(bVal) || 0;
                } else {
                    aVal = (aVal || '').toLowerCase();
                    bVal = (bVal || '').toLowerCase();
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortable;
    }, [clients, sortConfig]);

    const getIcon = (key) => {
        if (sortConfig.key !== key) return ' ⇅';
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    };

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th onClick={() => requestSort('id_client')}>ID{getIcon('id_client')}</th>
                    <th onClick={() => requestSort('name')}>Имя{getIcon('name')}</th>
                    <th onClick={() => requestSort('phone')}>Телефон{getIcon('phone')}</th>
                    <th onClick={() => requestSort('email')}>Email{getIcon('email')}</th>
                    <th onClick={() => requestSort('discount')}>Скидка{getIcon('discount')}</th>
                </tr>
            </thead>
            <tbody>
                {sortedClients.map(client => (
                    <tr key={client.id_client}>
                        <td>{client.id_client}</td>
                        <td>
                            <button 
                                className={styles.linkButton}
                                onClick={() => handleClick(client.id_client)}
                            >
                                {client.name}
                            </button>
                        </td>
                        <td>{client.phone}</td>
                        <td>{client.email}</td>
                        <td>{client.discount}%</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default ClientTableVet;