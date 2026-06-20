import { useSearchParams } from 'react-router';

function StatusFilter() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentStatus = searchParams.get('status') || 'all';

    const handleStatusChange = (status) => {
        if (status === 'all') {
            searchParams.delete('status'); // Keep the URL clean if they select everything
        } else {
            searchParams.set('status', status);
        }
        setSearchParams(searchParams);
    };

    return (
        <div style={{ margin: '15px 0', textAlign: 'center' }}>
            <label htmlFor='statusFilter' style={{ marginRight: '8px', fontWeight: 'bold' }}>Task Scope View:</label>
            <select
                id='statusFilter'
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '4px' }}
            >
                <option value='all'>All Todos</option>
                <option value='active'>Active Tasks Only</option>
                <option value='completed'>Completed Tasks Only</option>
            </select>
        </div>
    );
}

export default StatusFilter;