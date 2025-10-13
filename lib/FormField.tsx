import { useMemo, useCallback } from "react";
import type { FieldValues, Path, PathValue } from "react-hook-form";
import { withMemo } from "@gaddario98/utiles";
import { useTranslatedText } from "@gaddario98/react-localization";
import { FormFieldProps } from "./types";
import { formConfig } from "./config";

export const FormField = withMemo(
  <T extends FieldValues>({
    config,
    onFieldChange,
    ns: globalNs,
    globalErrorNs,
  }: FormFieldProps<T>) => {
    const ns = config.ns ?? globalNs;
    const errorNs = config.errorNs ?? globalErrorNs;
    const { traslateText } = useTranslatedText(ns);

    const errorMessage = useMemo(() => {
      if (!config.fieldState.error) return undefined;
      return errorNs
        ? traslateText(config.fieldState.error.message ?? "", {
            ...formConfig.errorTranslationOption,
            ns: errorNs ?? formConfig.errorTranslationOption.ns,
          })
        : config.fieldState.error.message;
    }, [config.fieldState.error, errorNs, traslateText]);

    const label = useMemo(
      () => (ns ? traslateText(config.label ?? "") : config.label),
      [ns, config.label, traslateText]
    );

    const helperMessage = useMemo(
      () =>
        config.helper?.text
          ? traslateText(config.helper?.text, config.helper?.translationOption)
          : "",
      [config.helper?.text, config.helper?.translationOption, traslateText]
    );

    const handleChange = useCallback(
      (value: PathValue<T, Path<T>>) => {
        config.field.onChange(value);
        onFieldChange?.(value);
      },
      [config.field, onFieldChange]
    );

    const baseProps = useMemo(
      () => ({
        value: config.field.value,
        onChange: handleChange,
        error: !!config.fieldState.error,
        errorMessage,
        label,
        helperMessage,
      }),
      [
        config.field.value,
        handleChange,
        config.fieldState.error,
        errorMessage,
        label,
        helperMessage,
      ]
    );

    const container = useMemo(
      () => config?.container || formConfig.formFieldContainer,
      [config?.container]
    );

    const field = useMemo(
      () => config.component(baseProps),
      [config.component, baseProps]
    );

    if (!config.component) return null;

    return container({ children: field });
  }
);
