import React, { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { createMapping, deepEqual } from '@/utils';
import RAW_DATA_IMPORT from '../../data.json';
import {
  MappedChanges,
  DatePrecision,
  Segment,
  RawOriginal,
  MappedOriginal,
  MappedKeys,
} from '@/types';
import { importChanges } from './importUtil';

const fetchRawData = (): [MappedOriginal, Date] => {
  const data = RAW_DATA_IMPORT as RawOriginal;
  return [
    {
      trails: createMapping(data.trails),
      segments: createMapping(data.segments),
      trailEvents: createMapping(data.trailEvents),
    },
    new Date(data.lastUpdated),
  ];
};

const [original, lastUpdated] = fetchRawData();

const emptyChanges: MappedChanges = {
  trails: {},
  segments: {},
  trailEvents: {},
};

type DataContextType = {
  currentData: MappedOriginal;
  getOriginalItem: (type: MappedKeys, id: number) => any | undefined;
  saveChanges: (updates: { [type in MappedKeys]?: any[] }) => void;
  getNextId: (type: MappedKeys, otherIds?: number[]) => number;
  getSegment: (id: number) => Segment | null;
  deleteItem: (type: MappedKeys, id: number) => void;
  editingEnabled: boolean;
  setEditingEnabled: (value: boolean) => void;
  clearChanges: () => void;
  importChanges: (data: string) => boolean;
  changes: MappedChanges;
  lastModified: Date | undefined;
  lastUpdated: Date;
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [editingEnabled, setEditingEnabled] = useLocalStorage<boolean>({
    key: 'editingEnabled',
    defaultValue: false,
  });
  const [changes, setChanges] = useLocalStorage<MappedChanges>({
    key: 'changes',
    defaultValue: emptyChanges,
  });
  const [lastModified, setLastModified] = useLocalStorage<Date | undefined>({
    key: 'lastModified',
    defaultValue: undefined,
  });

  const updateLastModified = () => setLastModified(new Date());

  const currentData = useMemo(() => {
    if (!editingEnabled) {
      return original;
    }

    const result: MappedOriginal = {
      trails: { ...original.trails },
      segments: { ...original.segments },
      trailEvents: { ...original.trailEvents },
    };

    Object.keys(changes).forEach((type) => {
      Object.entries(changes[type as MappedKeys]).forEach(([id, change]) => {
        if (change.deleted) {
          delete result[type as MappedKeys][+id];
        } else {
          result[type as MappedKeys][+id] = {
            ...result[type as MappedKeys][+id],
            ...change,
          };
        }
      });
    });

    return result;
  }, [original, changes, editingEnabled]);

  const getNextId = (type: MappedKeys, otherIds: number[] = []) => {
    const allIds = new Set([
      ...Object.keys(original[type]).map(Number),
      ...Object.keys(changes[type as MappedKeys]).map(Number),
      ...otherIds,
    ]);

    let newId: number;
    do {
      newId = Math.floor(Math.random() * 1_000_000);
    } while (allIds.has(newId));

    return newId;
  };

  const saveChanges = (updates: {
    [type in MappedKeys]?: any[];
  }) => {
    const newChanges: Record<string, Record<number, any>> = {};

    Object.entries(updates).forEach(([type, updatesForType]) => {
      const typeKey = type as MappedKeys;
      const typeChanges: Record<number, any> = {};

      updatesForType!.forEach((updatedObject) => {
        const { id } = updatedObject;
        const existingObject = currentData[typeKey][id];

        if (!existingObject || !deepEqual(existingObject, updatedObject)) {
          // If the object doesn't exist or is different from the current data, add it to changes
          typeChanges[id] = updatedObject;
        }
      });

      if (Object.keys(typeChanges).length > 0) {
        newChanges[typeKey] = typeChanges;
      }
    });

    if (Object.keys(newChanges).length > 0) {
      setChanges((prevState) => ({
        ...prevState,
        ...newChanges,
      }));
      updateLastModified();
    }
  };

  const getSegment = (id: number): Segment | null => {
    const seg = currentData.segments[id];
    if (!seg) return null;
    const { trails: trailIds, events: eventIds } = seg;
    return {
      ...seg,
      trails: trailIds.map((trailId) => currentData.trails[trailId]),
      events: eventIds.map((eventId) => {
        const event = currentData.trailEvents[eventId];
        return {
          ...event,
          date: new Date(event.date),
          date_precision: event.date_precision as DatePrecision,
        };
      }),
    };
  };

  const deleteItem = (type: MappedKeys, id: number) => {
    setChanges((prevState) => ({
      ...prevState,
      [type]: {
        ...prevState[type],
        [id]: { id, deleted: true },
      },
    }));
    updateLastModified();
  };

  console.log('changes:');
  console.log(changes);
  console.log(`lastModified: ${lastModified} (${typeof lastModified})`);
  console.log(`lastUpdated: ${lastUpdated} (${typeof lastUpdated})`);

  return (
    <DataContext.Provider
      value={{
        currentData,
        getOriginalItem: (type, id) => original[type][id],
        saveChanges,
        getNextId,
        getSegment,
        deleteItem,
        editingEnabled,
        setEditingEnabled,
        clearChanges: () => {
          setChanges(emptyChanges);
          setLastModified(undefined);
        },
        changes,
        importChanges: (data) => {
          const newImport = importChanges(data);
          if (!newImport) return false;
          const { lastModified: importLastModified, ...newChanges } = newImport;
          setChanges(newChanges);
          setLastModified(importLastModified);
          return true;
        },
        lastModified,
        lastUpdated,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
