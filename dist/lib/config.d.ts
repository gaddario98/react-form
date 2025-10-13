import { PropsWithChildren } from "react";
import { TOptions } from "i18next";
export interface FormConfigProps {
    formFieldContainer: React.FC<PropsWithChildren>;
    errorTranslationOption: TOptions;
}
export declare let formConfig: FormConfigProps;
export declare const setFormConfig: (config: Partial<FormConfigProps>) => void;
