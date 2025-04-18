import React, { createContext, useContext, useMemo } from 'react';
import { randomId, useLocalStorage } from '@mantine/hooks';
import { createMapping, deepEqual, sortById } from '@/utils';
import RAW_DATA_IMPORT from '../../data.json';
import {
  MappedChanges,
  DatePrecision,
  Segment,
  RawOriginal,
  MappedOriginal,
  MappedKeys,
  RawSegment,
  RawTrail,
  RawTrailEvent,
} from '@/types';

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
  saveChanges: (updates: {
    segments?: RawSegment[];
    trails?: RawTrail[];
    trailEvents?: RawTrailEvent[];
  }) => void;
  getNextId: (type: MappedKeys, otherIds?: number[]) => number;
  getSegment: (id: number) => Segment | null;
  deleteItem: (type: MappedKeys, id: number) => void;
  clearChanges: () => void;
  changes: MappedChanges;
  getCurrentJSON: () => string;
  getMinimalChangesJSON: () => [string, string];
  lastModified: Date | undefined;
  lastUpdated: Date;
  isSubmitted: boolean;
  setIsSubmitted: (value: boolean) => void;
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [changes, setChanges] = useLocalStorage<MappedChanges>({
    key: 'changes',
    defaultValue: emptyChanges,
    getInitialValueInEffect: false,
  });
  const [lastModified, setLastModified] = useLocalStorage<Date | undefined>({
    key: 'last-modified',
    defaultValue: undefined,
    deserialize: (value) => (value ? new Date(value) : undefined),
    serialize: (value) => (value ? value.toISOString() : ''),
  });

  const [editId, setEditId] = useLocalStorage({
    key: 'edit-id',
    defaultValue: randomId(''),
  });

  const [isSubmitted, setIsSubmitted] = useLocalStorage({
    key: 'is-submitted',
    defaultValue: true,
  });

  const [contact] = useLocalStorage<{
    name: string;
    email: string;
    organization: string;
  } | null>({
    key: 'contact-info',
    defaultValue: null,
  });

  const updateLastModified = () => {
    setIsSubmitted(false);
    setLastModified(new Date());
  };

  const currentData = useMemo(() => {
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
  }, [original, changes]);

  const getNextId = (type: MappedKeys, otherIds: number[] = []) => {
    const originalIds = Object.keys(original[type]).map(Number);
    const changesIds = Object.keys(changes[type as MappedKeys]).map(Number);
    const maxOriginalId = Math.max(...originalIds);

    const allIds = new Set([...originalIds, ...changesIds, ...otherIds]);

    let newId: number;
    do {
      newId = Math.floor(Math.random() * 1_000_000);
    } while (allIds.has(newId) && newId <= maxOriginalId + 1_000);

    return newId;
  };

  const saveChanges = (updates: {
    [type in MappedKeys]?: MappedChanges[type][number][];
  }) => {
    const newChanges: Partial<Record<MappedKeys, Record<number, any>>> = {};

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
        trails: {
          ...prevState.trails,
          ...(newChanges.trails ?? {}),
        },
        segments: {
          ...prevState.segments,
          ...(newChanges.segments ?? {}),
        },
        trailEvents: {
          ...prevState.trailEvents,
          ...(newChanges.trailEvents ?? {}),
        },
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
          date: event.date,
          date_precision: event.date_precision as DatePrecision,
        };
      }),
    };
  };

  const deleteItem = (type: MappedKeys, id: number) => {
    let updatedSegments: RawSegment[] = [];
    if (type === 'trails') {
      updatedSegments = Object.values(currentData.segments)
        .filter((s) => s.trails.includes(id))
        .map((s) => ({ ...s, trails: s.trails.filter((trail) => trail !== id) }));
    } else if (type === 'trailEvents') {
      updatedSegments = Object.values(currentData.segments)
        .filter((s) => s.events.includes(id))
        .map((s) => ({ ...s, events: s.events.filter((event) => event !== id) }));
    }

    saveChanges({ segments: updatedSegments, [type]: [{ id, deleted: true }] });
  };

  const clearChanges = () => {
    setChanges(emptyChanges);
    setLastModified(undefined);
    setIsSubmitted(true);
    setEditId(randomId(''));
  };

  const getCurrentJSON = (): string =>
    JSON.stringify({
      segments: sortById(currentData.segments),
      trailEvents: sortById(currentData.trailEvents),
      trails: sortById(currentData.trails),
    });

  const getMinimalChangesJSON = (): [string, string] => {
    const minimalChanges: MappedChanges = emptyChanges;

    (Object.keys(changes) as MappedKeys[]).forEach((type) => {
      (
        Object.values(changes[type as keyof MappedChanges]) as MappedChanges[typeof type][number][]
      ).forEach((item) => {
        const { id } = item;
        if (item.deleted) {
          minimalChanges[type][id] = { id, deleted: true };
        } else {
          const originalItem = original[type][+id] || {};
          const diff: Record<string, any> = {};

          Object.entries(item).forEach(([key, value]) => {
            if (!deepEqual(originalItem[key as keyof typeof originalItem], value)) {
              diff[key] = value;
            }
          });

          if (Object.keys(diff).length > 0) {
            minimalChanges[type][+id] = {
              id: +id,
              ...diff,
            };
          }
        }
      });
    });

    return [
      JSON.stringify({
        meta: {
          ...contact,
          editId,
          lastModified: (lastModified ?? new Date()).toISOString(),
        },
        segments: sortById(minimalChanges.segments),
        trailEvents: sortById(minimalChanges.trailEvents),
        trails: sortById(minimalChanges.trails),
      }),
      editId,
    ];
  };

  return (
    <DataContext.Provider
      value={{
        currentData,
        getOriginalItem: (type, id) => original[type][id],
        saveChanges,
        getNextId,
        getSegment,
        deleteItem,
        clearChanges,
        changes,
        getCurrentJSON,
        getMinimalChangesJSON,
        lastModified,
        lastUpdated,
        isSubmitted,
        setIsSubmitted,
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
