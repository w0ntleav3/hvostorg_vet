import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ClientTableVet.module.css";

function ClientTable({ clients }) {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleClick = (id_client) => {
        navigate(`/admin/clients/${id_client}`);
    };

    const requestSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction:
                prev.key === key && prev.direction === 'asc'
                    ? 'desc'
                    : 'asc'
        }));
    };

    const sortedClients = useMemo(() => {
        const sortable = [...clients];

        if (sortConfig.key !== null) {
            sortable.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'id_client' || sortConfig.key === 'discount') {
                    aVal = Number(aVal) || 0;
                    bVal = Number(bVal) || 0;
                } else {
                    aVal = (aVal || '').toString().toLowerCase();
                    bVal = (bVal || '').toString().toLowerCase();
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
                <tr style={{ userSelect: 'none' }}>
                    <th onClick={() => requestSort('id_client')}>
                        ID{getIcon('id_client')}
                    </th>
                    <th onClick={() => requestSort('name')}>
                        Имя{getIcon('name')}
                    </th>
                    <th onClick={() => requestSort('phone')}>
                        Телефон{getIcon('phone')}
                    </th>
                    <th onClick={() => requestSort('email')}>
                        Email{getIcon('email')}
                    </th>
                    <th onClick={() => requestSort('discount')}>
                        Скидка{getIcon('discount')}
                    </th>
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

export default ClientTable;