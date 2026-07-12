import React, { useState, useMemo } from "react";

function AccountTable({ accounts }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAccounts = useMemo(() => {
        let sortable = [...accounts];
        if (sortConfig.key !== null) {
            sortable.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'id_account') {
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
    }, [accounts, sortConfig]);

    const getIcon = (key) => {
        if (sortConfig.key !== key) return ' ⇅';
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    };

    return (
        <table>
            <thead>
                <tr style={{ userSelect: 'none' }}>
                    <th onClick={() => requestSort('id_account')} style={{ cursor: "pointer" }}>ID{getIcon('id_account')}</th>
                    <th onClick={() => requestSort('login')} style={{ cursor: "pointer" }}>Логин{getIcon('login')}</th>
                    <th onClick={() => requestSort('password')} style={{ cursor: "pointer" }}>Пароль{getIcon('password')}</th>
                    <th onClick={() => requestSort('role')} style={{ cursor: "pointer" }}>Роль{getIcon('role')}</th>
                </tr>
            </thead>
            <tbody>
                {sortedAccounts.map(acc => (
                    <tr key={acc.id_account}>
                        <td>{acc.id_account}</td>
                        <td>{acc.login || '-'}</td>
                        <td>{acc.password || '••••'}</td>
                        <td>{acc.role || '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default AccountTable;