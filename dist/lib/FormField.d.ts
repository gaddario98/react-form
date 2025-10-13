import type { FieldValues } from "react-hook-form";
import { FormFieldProps } from "./types";
export declare const FormField: <T extends FieldValues>({ config, onFieldChange, ns: globalNs, globalErrorNs, }: FormFieldProps<T>) => import("react").ReactNode;
