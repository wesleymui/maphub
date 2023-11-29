import { IPropertyPanelSectionProps } from 'app/create/ui/components/property/PropertyPanel';
import { Dispatch, createContext, useReducer } from 'react';
import { IDotDensityProps, MHJSON } from 'types/MHJSON';
import { GeoJSONVisitor, mergeBBox } from './editorHelpers/GeoJSONVisitor';
import * as G from 'geojson';
import { ActionStack } from './editorHelpers/Actions';
import { Delta, DeltaType, TargetType } from 'types/delta';
import { DELETED_NAME, applyDelta } from './editorHelpers/DeltaUtil';

export enum ToolbarButtons {
  select = 'select',
  pan = 'pan',
  erase = 'erase',
  dot = 'dot',
  symbol = 'symbol',
  arrow = 'arrow',
}

// the global state interface
export interface IEditorState {
  // propertiesPanel: Array<IPropertyPanelSectionProps>;
  map: MHJSON | null;
  map_id: string;
  selectedTool: ToolbarButtons | null;
  selectedItem: null | {
    type: TargetType;
    id: number;
    subid: string;
  };
  mapDetails: {
    availableProps: Array<string>;
    bbox: [x: number, y: number, w: number, h: number];
    originalRegions: Array<G.Feature>;
  };
  actionStack: ActionStack;
  lastInstantiated: string; // name of the last instantiated item
}

// initial global state
let initialState: IEditorState = {
  // propertiesPanel: [],
  map: null,
  map_id: '',
  selectedTool: null,
  mapDetails: {
    availableProps: [],
    bbox: [0, 0, 0, 0],
    originalRegions: [],
  },
  actionStack: new ActionStack(),
  lastInstantiated: DELETED_NAME,
  selectedItem: null,
};

// actions the reducer can take
export enum EditorActions {
  SET_SELECTED,
  SET_MAP,
  SET_TOOL,
  SET_TITLE,
  SET_ACTION,
}

// the reducer
function reducer(
  prev: IEditorState,
  action: {
    type: EditorActions;
    payload: Partial<IEditorState>;
  },
): IEditorState {
  let newState: IEditorState = { ...prev };
  switch (action.type) {
    case EditorActions.SET_SELECTED: {
      if (action.payload.selectedItem || action.payload.selectedItem === null) {
        newState.selectedItem = action.payload.selectedItem;
      } else {
        throw new Error('SET_SELECTED must have a selectedItem in its payload');
      }
      break;
    }
    case EditorActions.SET_MAP: {
      if (action.payload.map && action.payload.map_id) {
        newState.map = action.payload.map;
        newState.map_id = action.payload.map_id;
        let v = new GeoJSONVisitor(action.payload.map.geoJSON);
        v.visitRoot();
        newState.mapDetails = {
          availableProps: Array.from(
            v.getFeatureResults().aggregate.globallyAvailableKeys,
          ),
          bbox: v
            .getFeatureResults()
            .perFeature.reduce(
              (prev, curr) => mergeBBox(prev, curr.box),
              v.getFeatureResults().perFeature[0].box,
            ),
          originalRegions: v
            .getFeatureResults()
            .perFeature.map(x => x.originalFeature),
        };
      } else {
        throw new Error('SET_MAP must have a map and a map_id in its payload');
      }
      break;
    }
    case EditorActions.SET_TOOL: {
      if (action.payload.selectedTool !== undefined) {
        newState.selectedTool = action.payload.selectedTool;
      } else {
        throw new Error('SET_TOOL must have a tool in its payload');
      }
      break;
    }
    case EditorActions.SET_TITLE: {
      if (action.payload.map !== undefined) {
        newState.map = action.payload.map;
      } else {
        throw new Error('SET_NAME must have a map in its payload');
      }
      break;
    }
    case EditorActions.SET_ACTION: {
      if (
        action.payload.map !== undefined &&
        action.payload.actionStack !== undefined &&
        action.payload.lastInstantiated !== undefined
      ) {
        newState.map = action.payload.map;
        newState.actionStack = action.payload.actionStack;
        newState.lastInstantiated = action.payload.lastInstantiated;
      } else {
        throw new Error(
          'SET_ACTION must have a map, an actionstack, and lastInstantiated in its payload',
        );
      }
      break;
    }
    default:
      throw new Error('UNHANDLED ACTION');
  }
  return newState;
}

class helpers {
  public changeTitle(ctx: IEditorContext, newTitle: string) {
    let newMap = structuredClone(ctx.state.map);
    if (newMap === null) {
      throw new Error('Cannot change title if there is no map');
    }
    newMap.title = newTitle;
    ctx.dispatch({
      type: EditorActions.SET_TITLE,
      payload: {
        map: newMap,
      },
    });
  }

  public setLoadedMap(ctx: IEditorContext, id: string, map: MHJSON) {
    ctx.dispatch({
      type: EditorActions.SET_MAP,
      payload: {
        map_id: id,
        map: map,
      },
    });
  }

  public addDelta(ctx: IEditorContext, d: Delta, dInv: Delta) {
    let x = ctx.state.map;
    if (x !== null) {
      let map = x;

      let nStack = ctx.state.actionStack.clone();
      nStack.counterStack = [];
      nStack.stack.push({
        do: d,
        undo: dInv,
      });
      let nMap = { ...map };
      applyDelta(nMap, d);
      let li = ctx.state.lastInstantiated;
      if (d.type === DeltaType.CREATE && d.payload.name !== undefined) {
        li = d.payload.name;
      }

      ctx.dispatch({
        type: EditorActions.SET_ACTION,
        payload: {
          actionStack: nStack,
          map: nMap,
          lastInstantiated: li,
          // propertiesPanel: newPropertiesPanel,
        },
      });
    } else {
      throw new Error('Cannot add diff when there is no map');
    }
  }

  public undo(ctx: IEditorContext) {
    let map = ctx.state.map;
    if (ctx.state.actionStack.canUndo() && map !== null) {
      // get most recent action
      let a = ctx.state.actionStack.peekStack();
      // apply it to a copy of the map
      let nMap = { ...map };
      applyDelta(nMap, a.undo);
      // create a copy of the stack with the change
      let nStack = ctx.state.actionStack.clone();
      nStack.counterStack.push(nStack.stack.pop()!);
      //dispatch it
      ctx.dispatch({
        type: EditorActions.SET_ACTION,
        payload: {
          map: nMap,
          actionStack: nStack,
          lastInstantiated: ctx.state.lastInstantiated,
        },
      });
    } else {
      throw new Error('Cannot undo if there is nothing left');
    }
  }

  public redo(ctx: IEditorContext) {
    let map = ctx.state.map;
    if (ctx.state.actionStack.canRedo() && map !== null) {
      // get most recent action
      let a = ctx.state.actionStack.peekCounterstack();
      // apply it to a copy of the map
      let nMap = { ...map };
      applyDelta(nMap, a.do);
      // create a copy of the stack with the change
      let nStack = ctx.state.actionStack.clone();
      nStack.stack.push(nStack.counterStack.pop()!);
      //dispatch it
      ctx.dispatch({
        type: EditorActions.SET_ACTION,
        payload: {
          map: nMap,
          actionStack: nStack,
          lastInstantiated: ctx.state.lastInstantiated,
        },
      });
    } else {
      throw new Error('Cannot redo if there is nothing left');
    }
  }

  public getLastInstantiatedDot(ctx: IEditorContext): IDotDensityProps | null {
    let name = ctx.state.lastInstantiated;
    if (name === DELETED_NAME || !ctx.state.map) return null;
    for (let d of ctx.state.map.globalDotDensityData) {
      if (d.name === name) {
        return d;
      }
    }
    return null;
  }
}

export interface IEditorContext {
  state: IEditorState;
  dispatch: Dispatch<{
    type: EditorActions;
    payload: Partial<IEditorState>;
  }>;
  helpers: helpers;
}

export const EditorContext = createContext<IEditorContext>({
  state: initialState,
  dispatch: () => null,
  helpers: new helpers(),
});

export const EditorProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <EditorContext.Provider value={{ state, dispatch, helpers: new helpers() }}>
      {children}
    </EditorContext.Provider>
  );
};

export const GUEST_MAP_ID =
  'THISyMAPyWASyMADEyBYyAyGUESTyANDySHOULDyNOTyBEyUSEDyINyDB';
