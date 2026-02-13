import { useMemo } from "react";
import { useFormManager } from "./hooks";
import { DefaultContainer, DefaultFormContainer } from "./containers";
import type { FieldValues, FormManagerProps } from "./types";
import { useFormConfigValue } from "./config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormManager = <T extends Record<string, any> = FieldValues>({
  data,
  defaultValues,
  onInvalid,
  submit = [],
  ns,
  globalErrorNs,
  notification,
  formSettings,
  viewSettings,
  onValuesChange,
  id = "form-manager",
}: FormManagerProps<T>) => {
  const { elements = [] } = useFormManager({
    data,
    globalErrorNs,
    notification,
    ns,
    onInvalid,
    submit,
    onValuesChange,
    id,
    formOptions: {
      defaultValues: defaultValues,
      ...formSettings,
      formId: id,
    },
  });

  // Render logic remains similar
  const render = useMemo(
    () =>
      elements
        .filter((el) => !el.isSubmit)
        .sort((a, b) => a.index - b.index)
        .map((el) => el.element),
    [elements],
  );
  const renderSubmit = useMemo(
    () =>
      elements
        .filter((el) => el.isSubmit)
        .sort((a, b) => a.index - b.index)
        .map((el) => el.element),
    [elements],
  );
  const { container, bodyContainer, submitContainer } = useFormConfigValue();

  const Container =
    viewSettings?.container || container || DefaultFormContainer<T>;
  const BodyContainer =
    viewSettings?.bodyContainer || bodyContainer || DefaultContainer;
  const SubmitContainer =
    viewSettings?.submitContainer || submitContainer || DefaultContainer;

  return (
    <Container {...(viewSettings?.containerProps || {})}>
      <BodyContainer {...(viewSettings?.bodyContainerProps || {})}>
        {render}
      </BodyContainer>
      <SubmitContainer {...(viewSettings?.submitContainerProps || {})}>
        {renderSubmit}
      </SubmitContainer>
    </Container>
  );
};
