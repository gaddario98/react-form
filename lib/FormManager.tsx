/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { FormManagerProps } from './types';
import { withMemo } from '@gaddario98/utiles';
import { useFormManager } from './hooks';
import { DefaultContainer } from './containers';


export const FormManager = withMemo(
  <T extends FieldValues = FieldValues>({
    data,
    defaultValues,
    onInvalid,
    submit = [],
    ns,
    globalErrorNs,
    notification,
    formControl,
    container,formSettings
  }: FormManagerProps<T>) => {
    const newFormControl = useForm<T>({
      defaultValues,
      mode: "all",
      ...formSettings
    });

    const { elements } = useFormManager({
      data,
      formControl: formControl ?? newFormControl,
      globalErrorNs,
      notification,
      ns,
      onInvalid,
      submit,
    });

    const render = useMemo(
      () => elements?.sort((a, b) => a.index - b.index).map((el) => el.element),
      [elements]
    );
    const Container = useMemo(() => container || DefaultContainer, [container]);

    return <Container>{render}</Container>;
  },

  (prev, next) => {
    if (prev.data.length !== next.data.length) return false;
    if (prev.submit?.length !== next.submit?.length) return false;
    
    const prevDataSignature = prev.data.map(d => 
      typeof d === 'function' ? 'function' : d.name
    ).join("-");
    const nextDataSignature = next.data.map(d => 
      typeof d === 'function' ? 'function' : d.name
    ).join("-");
    
    return prevDataSignature === nextDataSignature &&
           prev.ns === next.ns &&
           prev.globalErrorNs === next.globalErrorNs;
  }
);