import React, { useState, useMemo } from "react";

function ServicesTable({ services }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedServices = useMemo(() => {
        let sortable = [...services];
        if (sortConfig.key !== null) {
            sortable.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'cost') {
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
    }, [services, sortConfig]);

    return (
        <table>
            <thead>
                <tr style={{ userSelect: 'none' }}>
                    <th onClick={() => requestSort('name_service')} style={{ cursor: "pointer" }}>
                        Услуга{sortConfig.key === 'name_service' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                    </th>
                    <th onClick={() => requestSort('cost')} style={{ cursor: "pointer" }}>
                        Цена{sortConfig.key === 'cost' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                    </th>
                </tr>
            </thead>

            <tbody>
                {sortedServices.map(service => (
                    <tr key={service.id_service}>
                        <td>{service.name_service}</td>
                        <td>{service.cost} ₽</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default ServicesTable;