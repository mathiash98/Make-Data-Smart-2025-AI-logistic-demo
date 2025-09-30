import { useCallback, useEffect, useState, useRef } from "react";

/**
 * Hook for managing query parameters in a more structured way.
 * Supports arrays, strings, numbers, booleans, and dates.
 */
export default function useQueryParams<
  T extends {
    [key: string]:
      | string
      | number
      | boolean
      | Date
      | string[]
      | number[]
      | undefined
      | null;
  },
>(defaultValues: T): [T, (params: T) => void, boolean] {
  const [params, setParams] = useState<T>({ ...defaultValues });
  const [queryParamsLoaded, setQueryParamsLoaded] = useState(false);

  const defaultValuesRef = useRef(defaultValues);

  // Parse query params from URL on initial load and when URL changes
  useEffect(() => {
    parseAndSetParams();
    setQueryParamsLoaded(true);

    window.addEventListener("popstate", parseAndSetParams);
    // Clean up event listener
    return () => {
      window.removeEventListener("popstate", parseAndSetParams);
    };
  }, []);

  function parseAndSetParams() {
    // Parse URL params when component mounts
    const newParams = parseUrlParams();

    // Only update state if something actually changed
    // Deep comparison to avoid unnecessary renders
    if (!isDeepEqual(newParams, params)) {
      setParams(newParams);
    }
  }

  /**
   * Parses parameters from the URL and updates the state.
   * @returns
   */
  const parseUrlParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const newParams = { ...defaultValuesRef.current };

    Object.keys(newParams).forEach((key) => {
      if (!searchParams.has(key)) {
        // If the key is not in the URL, set it to its default value
        newParams[key as keyof T] = defaultValuesRef.current[key] as T[keyof T];
        return;
      }

      const values = searchParams.getAll(key);
      const value = values[0];
      if (value === null) return;

      if (Array.isArray(newParams[key])) {
        // If the default value is an array, initialize it as an empty array
        newParams[key as keyof T] = values as string[] as T[keyof T];
      } else if (typeof newParams[key] === "number") {
        // If the default value is an object, initialize it as an empty object
        newParams[key as keyof T] = Number(value) as T[keyof T];
      } else if (typeof newParams[key] === "boolean") {
        newParams[key as keyof T] = (value.toLowerCase() ===
          "true") as T[keyof T];
      } else if (
        typeof newParams[key] === "object" &&
        newParams[key] instanceof Date
      ) {
        // If the default value is a Date, parse it
        newParams[key as keyof T] = new Date(value) as T[keyof T];
      } else {
        // Default to string
        newParams[key as keyof T] = value as T[keyof T];
      }
    });

    return newParams;
  };

  const setQueryParams = useCallback((newParams: T) => {
    const queryParams = queryToParams(newParams);

    // Update URL without refreshing the page
    const newUrl = `${window.location.pathname}${queryParams}`;
    window.history.pushState({ path: newUrl }, "", newUrl);

    setParams(newParams);
  }, []);

  return [params, setQueryParams, queryParamsLoaded];
}

// Deep comparison helper function to avoid unnecessary re-renders
function isDeepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;

    if (!isDeepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

/**
 * Convert object with query params to a queryString
 * @param {} search Object with search params
 * @param {} separateListByComma If true, list will be separated by commas instead of multiple keys as it should be. Ex: "?key=a,b,c" instead of "?key=a&key
 * @returns {} Ex: "?key=value&key2=value2&key3=a&key3=b"
 */
export function queryToParams(
  search?: {
    [key: string]:
      | string
      | string[]
      | number
      | number[]
      | boolean
      | Date
      | undefined
      | null;
  },
  separateListByComma = false
): string {
  if (!search) {
    return "";
  }

  const params = Object.keys(search)
    .filter(
      (key) =>
        !!search[key] &&
        (Array.isArray(search[key]) ? search[key].length > 0 : true)
    )
    .map((key) => {
      const objVal = search[key] as string | string[] | number | boolean | Date;
      let value: string | number | boolean;
      if (Array.isArray(objVal)) {
        if (separateListByComma) {
          value = objVal.join(",");
        } else {
          return objVal
            .map(
              (val) => encodeURIComponent(key) + "=" + encodeURIComponent(val)
            )
            .join("&");
        }
      } else if (objVal instanceof Date) {
        value = objVal.toISOString();
      } else {
        value = objVal;
      }

      return encodeURIComponent(key) + "=" + encodeURIComponent(value);
    });

  let queryString = "";
  if (params.length > 0) {
    queryString = "?" + params.join("&");
  }

  return queryString;
}
