import React, { createContext, useReducer } from "react";

type Action<T extends Record<string, unknown>> =
  | { type: "updateDefaults"; value: State<T>["defaults"] }
  | { type: "updateValues"; value: State<T>["values"] };

type Dispatch<T extends Record<string, unknown>> = (action: Action<T>) => void;
export type State<T extends Record<string, unknown>> = {
  values: T[];
  defaults: T[];
};

export type FormProviderProps<T extends Record<string, unknown>> = {
  children: React.ReactNode;
  values?: State<T>["values"];
  defaults?: State<T>["defaults"];
};

export const FormContext = createContext<State<Record<string, unknown>>>(
  {defaults: [], values: []}
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
      return { ...state, defaults: action.value };
    }
    case "updateValues": {
      return { ...state, values: action.value };
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
  const [state, dispatch] = useReducer(FormReducer, { defaults, values });
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
