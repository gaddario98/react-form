/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  useController,
} from "react-hook-form";
import {
  FormFieldConfig,
  FormManagerConfig,
  Submit,
  UseFormManagerProps,
  SubmitKeysArg,
  SubmitPayload,
} from "./types";
import { createExtractor, trimObject, withMemo } from "@gaddario98/utiles";
import { FormField } from "./FormField";
import { useNotification } from "@gaddario98/react-notifications";

export interface FormElements {
  index: number;
  element: JSX.Element;
  renderInFooter: boolean;
  renderInHeader: boolean;
}

type SubmitKeys<T extends FieldValues, S extends Submit<T, SubmitKeysArg<T>>> =
  S extends Submit<T, infer K>
    ? K extends readonly (keyof T)[]
      ? K[number] extends keyof T
        ? K[number]
        : keyof T
      : keyof T
    : keyof T;

type PayloadOf<
  T extends FieldValues,
  S extends Submit<T, SubmitKeysArg<T>>,
> = SubmitPayload<T, S extends Submit<T, infer K> ? K : undefined>;

const RenderField = withMemo(
  <T extends FieldValues = FieldValues>({
    field,
    fieldState,
    fieldProps,
    onFieldChange,
  }: {
    field: ControllerRenderProps<T, Path<T>>;
    fieldState: ControllerFieldState;
    fieldProps: FormManagerConfig<T>;
    onFieldChange?: (value: PathValue<T, Path<T>>) => void;
  }) => {
    const config: FormFieldConfig<T> = useMemo(
      () => ({
        ...fieldProps,
        field,
        fieldState,
      }),
      [fieldProps, field, fieldState]
    );
    return (
      <FormField<T>
        config={config}
        ns={fieldProps?.ns}
        globalErrorNs={fieldProps?.errorNs}
        onFieldChange={onFieldChange}
      />
    );
  }
  /*(prev, next) => 
    prev.field.name === next.field.name &&
    prev.field.value === next.field.value &&
    prev.fieldState.error?.message === next.fieldState.error?.message &&
    prev.fieldProps.name === next.fieldProps.name*/
);

const ControllerWrapper = withMemo(
  <T extends FieldValues = FieldValues>({
    name,
    control,
    rules,
    render,
  }: {
    name: Path<T>;
    control: Control<T, any>;
    rules?: FormManagerConfig<T>["rules"];
    render: ({
      field,
      fieldState,
    }: {
      field: ControllerRenderProps<T, Path<T>>;
      fieldState: ControllerFieldState;
    }) => React.ReactElement;
  }) => {
    const { field, fieldState } = useController({
      name,
      control,
      rules,
    });
    return render({ field, fieldState });
  }
);
export const useFormManager = <T extends FieldValues = FieldValues>({
  data,
  onInvalid,
  submit = [],
  notification,
  formControl,
  onValuesChange,
  globalErrorNs,
}: UseFormManagerProps<T>) => {
  const { control, handleSubmit, watch, formState, trigger } = formControl;
  const errorsCacheRef = useRef<FieldErrors<T>>(formState.errors);
  const errors = useMemo(() => {
    const next = formState.errors;
    errorsCacheRef.current = next;
    return errorsCacheRef.current;
  }, [formState.errors]);

  const { showNotification } = useNotification();

  const handleNotification = useCallback(
    (props: Parameters<typeof showNotification>[0]) => {
      if (props?.message) {
        showNotification(props);
      }
    },
    [showNotification]
  );

  const filterFormData = useCallback(
    <S extends Submit<T, SubmitKeysArg<T>>>(
      values: T,
      submitConfig: S
    ): PayloadOf<T, S> => {
      const keys = submitConfig.values as ReadonlyArray<keyof T> | undefined;
      if (!keys || keys.length === 0) {
        return values as PayloadOf<T, S>;
      }

      const out = {} as Record<keyof T, T[keyof T]>;
      for (const key of keys) {
        if (key in values) {
          out[key] = values[key];
        }
      }
      return out as PayloadOf<T, S>;
    },
    []
  );

  const processSubmit = useCallback(
    async <S extends Submit<T, SubmitKeysArg<T>>>(data: T, submitConfig: S) => {
      const filteredData = filterFormData(data, submitConfig);
      if (submitConfig.onSuccess) {
        return submitConfig.onSuccess(filteredData);
      }
      throw new Error("No submit handler provided");
    },
    [filterFormData]
  );

  const handleError = useCallback(
    <S extends Submit<T, SubmitKeysArg<T>>>(
      error: unknown,
      submitConfig: S
    ) => {
      if (submitConfig.onError) {
        submitConfig.onError(error as Error);
      }
      const notificationProps =
        typeof notification?.error === "function"
          ? notification.error((error as Error)?.message ?? "Error")
          : notification?.error;
      if (notificationProps?.message) {
        handleNotification({
          message: notificationProps.message,
          type: notificationProps.type ?? "error",
          autoHideDuration: notificationProps.autoHideDuration,
          ...notificationProps,
        });
      }
    },
    [handleNotification, notification]
  );

  const createSubmitHandler = useCallback(
    <S extends Submit<T, SubmitKeysArg<T>>>(submitConfig: S) =>
      async (data: T) => {
        try {
          const res = await processSubmit(trimObject<T>(data), submitConfig);
          const notificationProps =
            typeof notification?.success === "function"
              ? notification.success(res)
              : notification?.success;
          if (notificationProps?.message) {
            handleNotification({
              ...notificationProps,
              message: notificationProps.message,
              type: notificationProps.type ?? "success",
              autoHideDuration: notificationProps.autoHideDuration,
            });
          }
          return res;
        } catch (error) {
          handleError(error, submitConfig);
          throw error;
        }
      },
    [processSubmit, notification, handleNotification, handleError]
  );

  const onInvalidHandle = useCallback(
    (errors: FieldErrors<T>, submitConfig: Submit<T>) => {
      onInvalid?.(errors);
      handleError(new Error("invalidData"), submitConfig);
    },
    [handleError, onInvalid]
  );

  const renderSubmit = useCallback(
    ({ component, ...submitConfig }: Submit<T>, index: number) =>
      component?.({
        onClick: async () => {
          const keys = submitConfig.values as readonly (keyof T)[] | undefined;
          if (keys?.length) {
            const ok = await trigger(keys as Path<T>[]);
            if (!ok) return onInvalidHandle(formState.errors, submitConfig);
          }
          return handleSubmit(createSubmitHandler(submitConfig), (errors) =>
            onInvalidHandle(errors, submitConfig)
          )();
        },
        index,
        key: `submit-${index}`,
        type: "submit",
      }) || <></>,
    [
      createSubmitHandler,
      handleSubmit,
      onInvalidHandle,
      trigger,
      formState.errors,
    ]
  );

  const values = watch();
  const valueCacheRef = useRef(new Map<string, any>());
  const extractValues = useMemo(() => {
    return createExtractor(values, valueCacheRef.current);
  }, [values]);

  const mappedFieldsRef = useRef<any[]>([]);
  const mappedFields = useMemo(() => {
    const next = data
      .map((el, idx) => {
        if (typeof el === "function") {
          const prev = mappedFieldsRef.current[idx];
          const newField = el(extractValues);
          if (prev && prev.name === newField.name) {
            return { ...prev, ...newField, component: prev.component };
          }
          return newField;
        }
        return el;
      })
      ?.filter((el) => !el.hidden);
    mappedFieldsRef.current = next;
    return next;
  }, [data, extractValues]);

  const fields = useMemo(
    () =>
      mappedFields
        ?.filter((el) => !el?.hidden)
        ?.map(
          (fieldProps, index): FormElements => ({
            index: fieldProps.index === undefined ? index : fieldProps.index,
            element: (
              <ControllerWrapper<T>
                key={fieldProps.name}
                control={control}
                name={fieldProps.name}
                rules={fieldProps.rules}
                render={({ field, fieldState }) => (
                  <RenderField<T>
                    field={field}
                    key={fieldProps.name}
                    fieldState={fieldState}
                    fieldProps={{
                      ...fieldProps,
                      errorNs: fieldProps?.errorNs ?? globalErrorNs,
                    }}
                    onFieldChange={fieldProps?.onFieldChange}
                  />
                )}
              />
            ),
            renderInFooter: !!fieldProps.renderInFooter,
            renderInHeader: !!fieldProps.renderInHeader,
          })
        ),
    [mappedFields, control, globalErrorNs]
  );

  const submits = useMemo(
    () =>
      submit
        ?.filter((el) => !el?.hidden)
        .map(
          (submitConfig, index): FormElements => ({
            index:
              submitConfig?.index === undefined ? index : submitConfig.index,
            element: renderSubmit(submitConfig, index),
            renderInFooter: !!submitConfig.renderInFooter,
            renderInHeader: !!submitConfig.renderInHeader,
          })
        ),
    [renderSubmit, submit]
  );

  const elementsRef = useRef<FormElements[]>([]);
  const elements = useMemo((): FormElements[] => {
    const next = fields.concat(submits);
    const prev = elementsRef.current;
    const merged = next.map((el) => {
      const found = prev.find(
        (e) => e.index === el.index && e.element.key === el.element.key
      );
      if (found) {
        return { ...found, ...el, element: el.element };
      }
      return el;
    });
    elementsRef.current = merged;
    return merged;
  }, [fields, submits]);

  const formContentsRef = useRef<any[]>([]);
  const formContents = useMemo(() => {
    const next = [...(mappedFields ?? []), ...submit];
    const prev = formContentsRef.current;
    const merged = next.map((el, idx) => {
      const key = el?.key ?? idx;
      const found = prev.find((e, i) => (e?.key ?? i) === key);
      if (found) {
        return { ...found, ...el };
      }
      return el;
    });
    formContentsRef.current = merged;
    return merged;
  }, [mappedFields, submit]);

  useEffect(() => {
    onValuesChange?.(extractValues);
  }, [onValuesChange, extractValues]);

  return { elements, formContents, errors };
};
