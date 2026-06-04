export const TODO_ACTIONS = {
    FETCH_START: 'FETCH_START',
    FETCH_SUCCESS: 'FETCH_SUCCESS',
    FETCH_ERROR: 'FETCH_ERROR',
    ADD_TODO_START: 'ADD_TODO_START',
    ADD_TODO_SUCCESS: 'ADD_TODO_SUCCESS',
    ADD_TODO_ERROR: 'ADD_TODO_ERROR',
    COMPLETE_TODO_START: 'COMPLETE_TODO_START',
    COMPLETE_TODO_SUCCESS: 'COMPLETE_TODO_SUCCESS',
    COMPLETE_TODO_ERROR: 'COMPLETE_TODO_ERROR',
    UPDATE_TODO_START: 'UPDATE_TODO_START',
    UPDATE_TODO_SUCCESS: 'UPDATE_TODO_SUCCESS',
    UPDATE_TODO_ERROR: 'UPDATE_TODO_ERROR',
    SET_SORT: 'SET_SORT',
    SET_FILTER: 'SET_FILTER',
    CLEAR_ERROR: 'CLEAR_ERROR',
    CLEAR_FILTER_ERROR: 'CLEAR_FILTER_ERROR',
    RESET_FILTERS: 'RESET_FILTERS',
};

export const initialTodoState = {
    todoList: [],
    error: '',
    filterError: '',
    isTodoListLoading: true,
    sortBy: 'creationDate',
    sortDirection: 'desc',
    filterTerm: '',
    dataVersion: 0,
};

export function todoReducer(state, action) {
    switch (action.type) {
        case TODO_ACTIONS.FETCH_START:
            return { ...state, isTodoListLoading: true, error: '', filterError: '' };

        case TODO_ACTIONS.FETCH_SUCCESS:
            return { ...state, isTodoListLoading: false, todoList: action.payload.todos, filterError: '' };

        case TODO_ACTIONS.FETCH_ERROR:
            return { ...state, isTodoListLoading: false, error: action.payload.message };

        case TODO_ACTIONS.ADD_TODO_START:
            return { ...state, todoList: [action.payload.todo, ...state.todoList] };

        case TODO_ACTIONS.ADD_TODO_SUCCESS:
            return { ...state, todoList: state.todoList.map(t => t.id === action.payload.tempId ? action.payload.todo : t) };

        case TODO_ACTIONS.ADD_TODO_ERROR:
            return { ...state, todoList: state.todoList.filter(t => t.id !== action.payload.tempId), error: action.payload.message };

        case TODO_ACTIONS.COMPLETE_TODO_START:
            return { ...state, todoList: state.todoList.map(t => t.id === action.payload.id ? { ...t, isCompleted: true } : t) };

        case TODO_ACTIONS.COMPLETE_TODO_ERROR:
            return { ...state, todoList: state.todoList.map(t => t.id === action.payload.id ? action.payload.originalTodo : t), error: action.payload.message };

        case TODO_ACTIONS.UPDATE_TODO_START:
            return { ...state, todoList: state.todoList.map(t => t.id === action.payload.todo.id ? action.payload.todo : t) };

        case TODO_ACTIONS.UPDATE_TODO_ERROR:
            return { ...state, todoList: state.todoList.map(t => t.id === action.payload.id ? action.payload.originalTodo : t), error: action.payload.message };

        case TODO_ACTIONS.SET_SORT:
            return { ...state, sortBy: action.payload.sortBy, sortDirection: action.payload.sortDirection };

        case TODO_ACTIONS.SET_FILTER:
            return { ...state, filterTerm: action.payload.filterTerm };

        case TODO_ACTIONS.CLEAR_ERROR:
            return { ...state, error: '' };

        case TODO_ACTIONS.CLEAR_FILTER_ERROR:
            return { ...state, filterError: '' };

        case TODO_ACTIONS.RESET_FILTERS:
            return { ...state, filterTerm: '', sortBy: 'creationDate', sortDirection: 'desc', filterError: '' };

        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
}