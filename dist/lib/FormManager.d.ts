import { FieldValues } from 'react-hook-form';
import { FormManagerProps } from './types';
export declare const FormManager: <T extends FieldValues = FieldValues>({ data, defaultValues, onInvalid, submit, ns, globalErrorNs, notification, formControl, container, formSettings }: FormManagerProps<T>) => import("react/jsx-runtime").JSX.Element;
