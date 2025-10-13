import { PropsWithChildren } from "react";
import { DefaultContainer } from "./containers";
import { TOptions } from "i18next";

export interface FormConfigProps {
  formFieldContainer: React.FC<PropsWithChildren>;
  errorTranslationOption: TOptions;
}

export let formConfig: FormConfigProps = {
  formFieldContainer: DefaultContainer,
  errorTranslationOption: { ns: "errors" },
};

export const setFormConfig = (config: Partial<FormConfigProps>) => {
  formConfig = { ...formConfig, ...config };
};
