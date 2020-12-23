import { isEqual } from "lodash";
import React, { createContext, useReducer } from "react";

type Action<T extends Record<string, unknown>> =
  | { type: "updateDefaults"; value: State<T>["defaults"] }
  | { type: "updateValues"; value: State<T>["values"] };

type Dispatch<T extends Record<string, unknown>> = (action: Action<T>) => void;
export type State<T extends Record<string, unknown>> = {
  values: T[];
  defaults: T[];
  dirty: number[]
};

export type FormProviderProps<T extends Record<string, unknown>> = {
  children: React.ReactNode;
  values?: State<T>["values"];
  defaults?: State<T>["defaults"];
};

const calcDirty =<T extends Record<string, unknown>> (s1: T[], s2: T[]) => {
  if (s1.length !== s2.length) {
    return [];
  }
  return s1.reduce((agg, s1o, i) => !isEqual(s1o, s2[i]) ? [...agg, i] : agg, [] as number[]);
}


export const FormContext = createContext<State<Record<string, unknown>>>(
  {defaults: [], values: [], dirty: []}
);

export const FormDispatchContext = createContext<
  Dispatch<Record<string, unknown>> | undefined
>(undefined);

const FormReducer = <T extends Record<string, unknown>>(
  state: State<T>,
  action: Action<T>
) => {
  switch (action.type) {
    case "updateDefaults": {
      const dirty = calcDirty(state.values, action.value);
      return { ...state, defaults: action.value, dirty };
    }
    case "updateValues": {
      const dirty = calcDirty(state.defaults, action.value);
      return { ...state, values: action.value, dirty };
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
};

const FormProvider = <T extends Record<string, unknown>>({
  children,
  defaults = [],
  values = [],
}: FormProviderProps<T>) => {
  const [state, dispatch] = useReducer(FormReducer, { defaults, values, dirty: calcDirty(values, defaults) });
  return (
    <FormContext.Provider value={state}>
      <FormDispatchContext.Provider value={dispatch}>
        {children}
      </FormDispatchContext.Provider>
    </FormContext.Provider>
  );
};

function useFormState() {
  const context = React.useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormState must be used within a FormProvider");
  }
  return context;
}

function useFormDispatch() {
  const context = React.useContext(FormDispatchContext);
  if (context === undefined) {
    throw new Error("useFormDispatch must be used within a FormProvider");
  }
  return context;
}
export { FormProvider, useFormState, useFormDispatch };
