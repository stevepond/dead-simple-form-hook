import { ActionType, useFormDispatch } from "./context";

export const useForm = <T extends Record<string, unknown>, Key extends keyof T>() => {
  const dispatch = useFormDispatch();
  const remove = (index: number) => dispatch({type: ActionType.REMOVE, index}); 
  const append = (value: T) => dispatch({type: ActionType.APPEND, value}); 
  const prepend = (value: T) => dispatch({type: ActionType.PREPEND, value}); 
  const reset = (index: number) => dispatch({type: ActionType.RESET, index}); 
  const set = (index: number, key: string, value: T[Key]) => dispatch({type: ActionType.SET, index, key, value}); 


  return { remove, reset, set, append, prepend};
};