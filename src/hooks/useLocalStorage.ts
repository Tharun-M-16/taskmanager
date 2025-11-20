import { useState, useEffect } from 'react';

// Helper function to convert date strings back to Date objects
function convertDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(convertDates);
    }
    
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'createdAt' || key === 'updatedAt' || key === 'dueDate') {
        // Convert date strings to Date objects
        converted[key] = value ? new Date(value) : value;
      } else {
        converted[key] = convertDates(value);
      }
    }
    return converted;
  }
  
  return obj;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          return convertDates(parsed);
        }
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}