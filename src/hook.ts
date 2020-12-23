import { cloneDeep, isEqual } from "lodash";
import { State, useFormDispatch, useFormState } from "./context";

export const useForm = <T extends Record<string, unknown>>() => {
  const {defaults, values} = useFormState() as State<T>;
  const dispatch = useFormDispatch();

  const isDirty = (i: number) => {
    return !isEqual(values[i], defaults[i]);
  };

  const reset = (i: number) => {
    const newValues = [...values];
    newValues[i] = cloneDeep(defaults[i]);
    dispatch({type: 'updateValues', value: newValues});
  };

  const set = <Key extends keyof(T)>(i: number, key: Key, value: T[Key]) => {
    const newValues = [...values];
    newValues[i][key] = value;
    dispatch({type: 'updateValues', value: newValues});
  };

  const append = (value: T) => {
    const newDefaults = [...defaults, cloneDeep(value)];
    const newValues = [...values, cloneDeep(value)];
    dispatch({type: 'updateValues', value: newValues});
    dispatch({type: 'updateDefaults', value: newDefaults});
  };

  const prepend = (value: T) => {
    const newDefaults = [cloneDeep(value), ...defaults];
    const newValues = [cloneDeep(value), ...values];
    dispatch({type: 'updateValues', value: newValues});
    dispatch({type: 'updateDefaults', value: newDefaults});
  };

  const remove = (i: number) => {
    const newValues = [...values];
    const newDefaults = [...defaults];
    newValues.splice(i, 1);
    newDefaults.splice(i, 1);
    dispatch({type: 'updateValues', value: newValues});
    dispatch({type: 'updateDefaults', value: newDefaults});
  };
  return { remove, isDirty, reset, set, append, prepend };
};
