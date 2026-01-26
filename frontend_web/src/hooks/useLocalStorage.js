import { useState, useEffect } from 'react';

// Custom hook for localStorage persistence
const useLocalStorage = (key, initialValue) => {
    // Only verify initial state once on mount (or rely on useEffect below)
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Update internal state if key changes (e.g. user switch)
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            setStoredValue(item ? JSON.parse(item) : initialValue);
        } catch (error) {
            setStoredValue(initialValue);
        }
    }, [key]); // Intentionally omitting initialValue to avoid reset strictly on init val change

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
};

export default useLocalStorage;
