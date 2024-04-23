import React, { createContext, useContext, useReducer } from 'react';
import { Link, Newsflash, Segment, Trail, Optional, Tracker } from '@/types';
import { trails } from './trails';
import { links } from './links';
import { newsflashes } from './newsflashes';
import { generateRandomId } from '@/utils';
import { segments } from './segments';

// App state ////////////////////////////////////////////////////////////////////////

export type AppState = {
  trails: Tracker<Trail>;
  segments: Tracker<Segment>;
  newsflashes: Tracker<Newsflash>;
  links: Tracker<Link>;
};

// Define initial state
const initialState: AppState = {
  trails: { original: trails, new: {} },
  segments: { original: segments, new: {} },
  newsflashes: { original: newsflashes, new: {} },
  links: { original: links, new: {} },
};

// Reducer ////////////////////////////////////////////////////////////////////////

export type Action =
  | {
      action: 'upsert';
      type: keyof AppState;
      value: Optional<Trail | Segment | Newsflash | Link, 'id'>;
    }
  | {
      action: 'delete';
      type: keyof AppState;
      id: number;
    };

export const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.action) {
    case 'upsert':
      const id = generateRandomId([state[action.type].original, state[action.type].new]);
      const upsertValue = { id, ...action.value };
      return {
        ...state,
        [action.type]: {
          original: state[action.type].original,
          new: { ...state[action.type].new, [upsertValue.id]: upsertValue },
        },
      };
    case 'delete':
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
      } else if (!inOriginal && inNew) {
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

function getSegmentData(id: number) {
  const seg = segments[id];
  return {
    ...segments[id],
    trails: trails.filter((t) => seg.trailIds.includes(t.id)),
    links: links.filter((l) => l.segmentIds?.includes(seg.id)),
  };
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return {
    ...context,
    trails: Object.values({
      ...context.state.trails.original,
      ...context.state.trails.new,
    }) as Trail[],
    segments: Object.values({
      ...context.state.segments.original,
      ...context.state.segments.new,
    }) as Segment[],
    newsflashes: Object.values({
      ...context.state.newsflashes.original,
      ...context.state.newsflashes.new,
    }) as Newsflash[],
    links: Object.values({ ...context.state.links.original, ...context.state.links.new }) as Link[],
  };
};
