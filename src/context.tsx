import { cloneDeep, isEqual } from "lodash";
import React, { createContext, useReducer } from "react";

export enum ActionType {
  RESET,
  SET,
  APPEND,
  PREPEND,
  REMOVE,
}

export type Action<T extends Record<string, unknown>, Key extends keyof T> =
  | { type: ActionType.RESET; index: number }
  | { type: ActionType.SET; index: number; key: Key; value: T[Key] }
  | { type: ActionType.APPEND; value: T }
  | { type: ActionType.PREPEND; value: T }
  | { type: ActionType.REMOVE; index: number };

type Dispatch<T extends Record<string, unknown>> = (
  action: Action<T, keyof T>
) => void;
export type State<T extends Record<string, unknown>> = {
  values: T[];
  defaults: T[];
  dirty: number[];
};

export type FormProviderProps<T extends Record<string, unknown>> = {
  children: React.ReactNode;
  values?: State<T>["values"];
  defaults?: State<T>["defaults"];
};

const calcDirty = <T extends Record<string, unknown>>(s1: T[], s2: T[]) => {
  if (s1.length !== s2.length) {
    return [];
  }
  return s1.reduce(
    (agg, s1o, i) => (!isEqual(s1o, s2[i]) ? [...agg, i] : agg),
    [] as number[]
  );
};

export const FormContext = createContext<State<Record<string, unknown>>>({
  defaults: [],
  values: [],
  dirty: [],
});

export const FormDispatchContext = createContext<
  Dispatch<Record<string, unknown>> | undefined
>(undefined);

const FormReducer = <T extends Record<string, unknown>>(
  { dirty, defaults, values }: State<T>,
  action: Action<T, keyof T>
) => {
  let newDefaults;
  let newValues;
  switch (action.type) {
    case ActionType.APPEND:
      newDefaults = [...defaults, cloneDeep(action.value)];
      newValues = [...values, cloneDeep(action.value)];
      return { dirty, defaults: newDefaults, values: newValues };
    case ActionType.PREPEND:
      newDefaults = [cloneDeep(action.value), ...defaults];
      newValues = [cloneDeep(action.value), ...values];
      return { dirty, defaults: newDefaults, values: newValues };
    case ActionType.REMOVE:
      newValues = [...values];
      newDefaults = [...defaults];
      newValues.splice(action.index, 1);
      newDefaults.splice(action.index, 1);
      return { dirty, defaults: newDefaults, values: newValues };
    case ActionType.RESET:
      newValues = [...values];
      newValues[action.index] = cloneDeep(defaults[action.index]);
      return { dirty, defaults, values: newValues };
    case ActionType.SET:
      newValues = [...values];
      newValues[action.index][action.key] = action.value;
      return { dirty, defaults, values: newValues };
  }
};

const FormProvider = <T extends Record<string, unknown>>({
  children,
  defaults = [],
  values = [],
}: FormProviderProps<T>) => {
  const [state, dispatch] = useReducer(FormReducer, {
    defaults,
    values,
    dirty: calcDirty(values, defaults),
  });
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
