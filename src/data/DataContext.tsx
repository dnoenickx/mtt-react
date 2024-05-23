import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { Newsflash, Segment, Trail, Optional, Tracker } from '@/types';
import { createMapping, generateRandomId, getItem } from '@/utils';

import { trails } from './trails';
import { newsflashes } from './newsflashes';
import { segments } from './segments';

// App state ////////////////////////////////////////////////////////////////////////

export type AppState = {
  trails: Tracker<Trail>;
  segments: Tracker<Segment>;
  newsflashes: Tracker<Newsflash>;
};

// Define initial state
const initialState: AppState = {
  trails: { original: createMapping(trails, 'id'), new: getItem('new_trails') },
  segments: { original: createMapping(segments, 'id'), new: getItem('new_segments') },
  newsflashes: { original: createMapping(newsflashes, 'id'), new: getItem('new_events') },
};

// Reducer ////////////////////////////////////////////////////////////////////////

export type Action =
  | {
      action: 'upsert';
      type: keyof AppState;
      value: Optional<Trail | Segment | Newsflash, 'id'>;
    }
  | {
      action: 'delete';
      type: keyof AppState;
      id: number;
    }
  | {
      action: 'reset';
    };

export const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.action) {
    case 'upsert': {
      const id = generateRandomId([
        ...Object.keys(state[action.type].original).map((x) => Number(x)),
        ...Object.keys(state[action.type].new).map((x) => Number(x)),
      ]);
      const upsertValue = { id, ...action.value };
      return {
        ...state,
        [action.type]: {
          original: state[action.type].original,
          new: { ...state[action.type].new, [upsertValue.id]: upsertValue },
        },
      };
    }
    case 'delete': {
      const inOriginal = Object.keys(state[action.type].original).includes(action.id.toString());
      const inNew = Object.keys(state[action.type].new).includes(action.id.toString());
      if (inOriginal) {
        return {
          ...state,
          [action.type]: {
            original: state[action.type].original,
            // add to new as undefined
            new: { ...state[action.type].new, [action.id]: undefined },
          },
        };
      }
      if (!inOriginal && inNew) {
        return {
          ...state,
          [action.type]: {
            original: state[action.type].original,
            // remove from new
            new: Object.fromEntries(
              Object.entries(state[action.type].new).filter(([key]) => key !== action.id.toString())
            ),
          },
        };
      }
      return state;
    }
    case 'reset': {
      localStorage.removeItem('new_trails');
      localStorage.removeItem('new_segments');
      localStorage.removeItem('new_events');

      return {
        trails: { original: state.trails.original, new: {} },
        segments: { original: state.segments.original, new: {} },
        newsflashes: { original: state.newsflashes.original, new: {} },
      };
    }
    default:
      return state;
  }
};

// Context + Component //////////////////////////////////////////////////////////////

const DataContext = createContext<
  { state: AppState; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <DataContext.Provider value={{ state, dispatch }}>{children}</DataContext.Provider>;
}

// Hook ////////////////////////////////////////////////////////////////////////

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  const memoizedContext = useMemo(() => context, [context]); // Memoize the context value

  return useMemo(() => {
    const { state } = memoizedContext;

    // TODO: need the same replaced for trails and events, once I allow deleting
    localStorage.setItem('new_trails', JSON.stringify(state.trails.new));
    localStorage.setItem(
      'new_segments',
      JSON.stringify(state.segments.new, (key, value) => (value === undefined ? null : value))
    );
    localStorage.setItem('new_events', JSON.stringify(state.newsflashes.new));

    return {
      ...memoizedContext,
      trails: Object.values({ ...state.trails.original, ...state.trails.new }).filter(
        (trail) => trail !== undefined
      ) as Trail[],
      segments: Object.values({ ...state.segments.original, ...state.segments.new }).filter(
        (segment) => segment !== undefined
      ) as Segment[],
      newsflashes: Object.values({
        ...state.newsflashes.original,
        ...state.newsflashes.new,
      }).filter((newsflash) => newsflash !== undefined) as Newsflash[],
    };
  }, [memoizedContext]);
};
