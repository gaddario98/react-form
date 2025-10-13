import { ControllerFieldState, ControllerRenderProps, FieldPath, FieldPathValue, Path, PathValue, RegisterOptions, DefaultValues, FieldValues, SubmitErrorHandler, UseFormReturn, UseFormProps } from "react-hook-form";
import React, { PropsWithChildren } from "react";
import { NotificationConfig } from "@gaddario98/react-notifications";
import { TOptions } from "i18next";
export type SubmitKeysArg<T> = readonly (keyof T)[] | undefined;
export type SubmitPayload<T, K extends SubmitKeysArg<T>> = K extends readonly (keyof T)[] ? Pick<T, K[number]> : T;
export interface Submit<T extends FieldValues = FieldValues, K extends SubmitKeysArg<T> = undefined> {
    onSuccess?: (values: T) => any;
    onError?: (err: Error) => void;
    values?: K;
    index?: number;
    buttonProps?: any;
    renderInFooter?: boolean;
    hidden?: boolean;
    renderInHeader?: boolean;
    isDisabled?: boolean;
    isDraggable?: boolean;
    isInDraggableView?: boolean;
    isLoading?: boolean;
    usedBoxes?: number;
    key?: string;
    component?: (props: {
        onClick: () => void;
        index: number;
        key: string;
        type: "submit";
    }) => React.JSX.Element;
}
export type FormManagerProps<T extends FieldValues = FieldValues> = {
    data: Array<FormManagerConfig<T> | ((props: T) => FormManagerConfig<T>)>;
    defaultValues: DefaultValues<T>;
    onInvalid?: SubmitErrorHandler<T> | undefined;
    formControl?: UseFormReturn<T, any, T>;
    isHiddenErrors?: boolean;
    ns?: string;
    globalErrorNs?: string;
    submit?: Submit<T>[];
    notification?: {
        success?: NotificationConfig | ((res: any) => NotificationConfig);
        error?: NotificationConfig | ((error: string) => NotificationConfig);
        ns?: string;
    };
    container?: React.ComponentType<{
        children: React.ReactNode;
    }>;
    onValuesChange?: (props: T) => void;
    formSettings?: Omit<UseFormProps<T>, "defaultValues">;
    isDraggable?: boolean;
    isInDraggableView?: boolean;
};
export type UseFormManagerProps<T extends FieldValues> = {
    data: Array<FormManagerConfig<T> | ((props: T) => FormManagerConfig<T>)>;
    onInvalid?: SubmitErrorHandler<T> | undefined;
    formControl: UseFormReturn<T, any, T>;
    isHiddenErrors?: boolean;
    ns?: string;
    globalErrorNs?: string;
    submit?: Submit<T>[];
    notification?: {
        success?: NotificationConfig | ((res: any) => NotificationConfig);
        error?: NotificationConfig | ((error: string) => NotificationConfig);
        ns?: string;
    };
    onValuesChange?: (props: T) => void;
};
export interface FieldComponentProps<T extends FieldValues> {
    value: PathValue<T, FieldPath<T>>;
    onChange: (value: FieldPathValue<T, FieldPath<T>>) => void;
    error?: boolean;
    errorMessage?: string;
    formValues?: T;
    label?: string;
    helperMessage?: string;
}
export type FormManagerConfig<T extends FieldValues> = Omit<FormFieldConfig<T>, "field" | "fieldState" | "fieldValues">;
export type FormFieldConfig<T extends FieldValues> = {
    name: Path<T>;
    label?: string;
    rules?: Omit<RegisterOptions<T>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">;
    field: ControllerRenderProps<T, Path<T>>;
    fieldState: ControllerFieldState;
    containerStyle?: string;
    component: (props: Omit<FieldComponentProps<T>, "formValues">) => React.JSX.Element;
    container?: React.FC<PropsWithChildren>;
    ns?: string;
    errorNs?: string;
    index?: number;
    renderInFooter?: boolean;
    renderInHeader?: boolean;
    hidden?: boolean;
    usedBoxes?: number;
    key?: string;
    isDraggable?: boolean;
    isInDraggableView?: boolean;
    helper?: {
        text?: string;
        translationOption?: TOptions;
    };
    onFieldChange?: (value: PathValue<T, Path<T>>) => void;
};
export interface ErrorComponentProps {
    message?: string;
    fieldName?: string;
}
export interface FormContainerProps {
    className?: string;
    children: React.ReactNode;
}
export interface FormFieldProps<T extends FieldValues> {
    config: FormFieldConfig<T>;
    onFieldChange?: (value: PathValue<T, Path<T>>) => void;
    ns?: string;
    globalErrorNs?: string;
    container?: React.FC<PropsWithChildren>;
}
