import { JSX } from "react";
import { FieldErrors, FieldValues } from "react-hook-form";
import { UseFormManagerProps } from "./types";
export interface FormElements {
    index: number;
    element: JSX.Element;
    renderInFooter: boolean;
    renderInHeader: boolean;
}
export declare const useFormManager: <T extends FieldValues = FieldValues>({ data, onInvalid, submit, notification, formControl, onValuesChange, globalErrorNs, }: UseFormManagerProps<T>) => {
    elements: FormElements[];
    formContents: any[];
    errors: FieldErrors<T>;
};
