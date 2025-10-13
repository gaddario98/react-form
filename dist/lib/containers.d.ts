import { PropsWithChildren } from "react";
export interface DefaultFormContainerProps {
    children: React.ReactNode;
}
declare let DefaultContainer: import("react").FC<{
    children?: import("react").ReactNode | undefined;
}>;
declare const setDefaultFormContainer: (val: React.FC<PropsWithChildren>) => void;
export { DefaultContainer, setDefaultFormContainer };
