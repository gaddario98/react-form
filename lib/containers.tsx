import { PropsWithChildren } from "react";

export interface DefaultFormContainerProps {
  children: React.ReactNode;
}

const createDefaultContainer = (): React.FC<PropsWithChildren> => {
  return ({ children }: PropsWithChildren) => {
    return children;
  };
};

let DefaultContainer = createDefaultContainer();

const setDefaultFormContainer = (val: React.FC<PropsWithChildren>) => {
  DefaultContainer = val;
};

export { DefaultContainer, setDefaultFormContainer };
