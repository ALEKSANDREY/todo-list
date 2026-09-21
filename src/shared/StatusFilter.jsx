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
        <select
            id="statusFilter"
            aria-label="Filter tasks by status"
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="select"
        >
            <option value="all">All tasks</option>
            <option value="active">Active only</option>
            <option value="completed">Completed only</option>
        </select>
    );
}

export default StatusFilter;
