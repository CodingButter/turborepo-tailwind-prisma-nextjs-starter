import { useState, useEffect } from "react";

export function useStorage<K>( key: string,initialData: K ) {
  const [data, setData] = useState<K>(() => {
    if (typeof window !== "undefined") {
      const storageData = localStorage.getItem(key);
      if (storageData) {
        try{
        return JSON.parse(storageData) as K;
        }catch(_){
          return initialData;
        }
      }
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data));
  }, [data, key]);

const handleSetData = (data: K) => {
  setData(data);
};

  return [data, handleSetData];
}