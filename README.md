# @gaddario98/react-form

An advanced React library for managing dynamic and type-safe forms, built on top of **TanStack React Form**. It provides full support for TypeScript, internationalization, Jotai state management, and notifications.

## ✨ Features

- 🎯 **Type-Safe**: Full TypeScript support with generics and automatic type inference.
- 🚀 **TanStack Form**: Built on the modern, performant, and headless `@tanstack/react-form`.
- 🌍 **i18n Ready**: Native integration with translation options for internationalization.
- 🔔 **Notifications**: Built-in generic notification system for standard success and error handling.
- 🎨 **Customizable**: Fully customizable containers, dynamic fields, and conditional rendering.
- ⚛️ **Jotai Integration**: Exposes form state efficiently using internally managed state atoms via `@gaddario98/react-state`.
- 🧩 **Flexible Layouts**: Includes structural injection arrays to render fields in custom views, dialogs, etc.

## 📦 Installation

To install the library, you can use npm or yarn:

```bash
npm install @gaddario98/react-form @tanstack/react-form @gaddario98/react-state
# or
yarn add @gaddario98/react-form @tanstack/react-form @gaddario98/react-state
```

### Peer Dependencies

Make sure you have `react` installed (>=18.0.0).

## 🚀 Quick Start

### Basic Example

The library exposes a single cohesive component, `FormManager`, which you can feed a configuration array to build layout-agnostic complex forms.

```tsx
import React, { useMemo } from "react";
import { FormManager, FormManagerProps } from "@gaddario98/react-form";
import { Input } from "your-ui-library";

interface UserForm {
  name: string;
  email: string;
}

export const BasicForm = () => {
  const formProps = useMemo(
    (): FormManagerProps<UserForm> => ({
      defaultValues: { name: "", email: "" },
      // Fields configuration
      data: [
        {
          name: "name",
          label: "Full Name",
          rules: {
            onChange: (val) => (!val ? "Name is required" : undefined),
          },
          component: (props) => (
            <Input
              value={props.value}
              onChange={(e) => props.onChange(e.target.value)}
              error={!!props.errorMessage}
              helperText={props.errorMessage}
            />
          ),
        },
        {
          name: "email",
          label: "Email",
          component: (props) => (
            <Input
              value={props.value}
              onChange={(e) => props.onChange(e.target.value)}
              error={!!props.errorMessage}
              helperText={props.errorMessage}
            />
          ),
        },
      ],
      // Submit buttons configuration
      submit: [
        {
          component: ({ onClick, type }) => (
            <button type={type} onClick={onClick}>
              Save
            </button>
          ),
          onSuccess: async (values) => {
            console.log("Saved data:", values);
          },
        },
      ],
    }),
    [],
  );

  return <FormManager {...formProps} />;
};
```

## 📚 Core Concepts & API Reference

### `FormManager` Component

The wrapper responsible for building your form utilizing TanStack form hooks. You pass an array of field definitions (`data`) and submit definitions (`submit`).

```typescript
export type FormManagerProps<T extends FieldValues> = {
  data: Array<
    | FormManagerConfig<T>
    | ((props: FormFunctionProps<T>) => FormManagerConfig<T>)
  >;
  defaultValues: T;
  onInvalid?: (err: unknown) => void;
  isHiddenErrors?: boolean;
  submit?: Array<Submit<T>>;
  notification?: {
    success?:
      | FormNotificationMessage
      | ((res: unknown) => FormNotificationMessage);
    error?:
      | FormNotificationMessage
      | ((error: string) => FormNotificationMessage);
    ns?: string;
  };
  onValuesChange?: (
    props: T,
    setValue: (name: any, value: any) => void,
  ) => void;
  formSettings?: UseCustomFormOptions<T>;
  viewSettings?: {
    container?: React.ComponentType<{ children: React.ReactNode }>;
    submitContainer?: React.ComponentType<{ children: React.ReactNode }>;
    bodyContainer?: React.ComponentType<{ children: React.ReactNode }>;
    containerProps?: Record<string, unknown>;
    // ...
  };
  // ...
};
```

### Dynamic Fields configuration (`data`)

Elements in the `data` array shape the visual layout and validation of the fields. They can be standard objects or factory functions granting you access to current form values via `get()` and setters via `set()`.

```tsx
data: [
  // 1. Static Configuration
  {
    name: "role",
    label: "User Role",
    component: (props) => <SelectComponent {...props} />,
  },
  // 2. Dynamic Configuration based on form values
  ({ get }) => ({
    name: "adminCode",
    label: "Access Code",
    hidden: get("role") !== "admin",
    rules: {
      validate: (val) =>
        !val && get("role") === "admin" ? "Required for admins" : undefined,
    },
    component: (props) => <Input {...props} />,
  }),
];
```

#### Field Rules (Validation)

Since we're using TanStack Form under the hood, standard `validators` functions apply natively:

```typescript
rules: {
  validate: (value) => value.length < 3 ? 'Min 3 chars' : undefined,
  onChange: (value) => ...
}
```

### Action Configuration (`submit`)

You can define multiple submission or action buttons that only validate a specific fields subset using the `values` array. This is perfect for partial updates or drafts.

```tsx
submit: [
  {
    component: ({ onClick }) => (
      <Button onClick={onClick} variant="ghost">
        Cancel
      </Button>
    ),
  },
  {
    // ONLY validate these fields
    values: ["name", "address", "vatNumber"],
    component: ({ onClick, type }) => (
      <Button onClick={onClick}>Publish</Button>
    ),
    onSuccess: async (values) => {
      // Here `values` will be typed according to the `values` subset specified above
      await updateCompanyMutation(values);
    },
  },
];
```

### View/Layout Settings (`viewSettings`)

Want to render your form in a Dialog? A Card? You can replace the underlying HTML wrappers cleanly without polluting your actual form configurations.

```tsx
viewSettings: {
  container: DialogContainer,
  containerProps: {
    open,
    onOpenChange,
    title: 'Edit Company'
  },
  submitContainer: ({ children }) => <DialogFooter>{children}</DialogFooter>,
}
```

### Global Notifications Configuration

`FormManager` exposes a `notification` object that intercepts `onSuccess`/`onError` scenarios natively to show toast notifications via the config context provider.

```tsx
<FormManager
  notification={{
    success: { message: "Successfully updated!", type: "success" },
    error: (err) => ({ message: `Operation failed: ${err}`, type: "error" }),
  }}
  // ...
/>
```

## 🔌 Hook Alternatives

Rather than using the `<FormManager />` component directly, you can also use the `useFormManager` hook if you need a headless implementation and custom orchestration over the built `elements`.

```tsx
import { useFormManager } from "@gaddario98/react-form";

const { elements, formValues, setValue, errors } = useFormManager({
  data,
  formOptions: { defaultValues },
  submit,
});
```

You can then iterate `elements` which provides `.element` (the JSX node), `.renderInFooter`, `.renderInHeader`, `.isSubmit`, and `.index`.

## 📦 Global Form Configuration Context

The form configuration (such as custom containers, text translation, and notification logic) is managed globally using Jotai atoms via `@gaddario98/react-state`.

Instead of wrapping your app in a Context Provider, you can efficiently set the configuration anywhere (typically at the root of your application) using the `useFormConfigState` hook.

```tsx
import { useFormConfigState } from "@gaddario98/react-form";
import { useEffect } from "react";
import { toast } from "your-toast-library";
import { useTranslation } from "react-i18next";

export const CoreAppProvider = ({ children }) => {
  const { t } = useTranslation();
  const [, setFormConfig] = useFormConfigState();

  useEffect(() => {
    // Inject your global dependencies into the form package
    setFormConfig((prev) => ({
      ...prev,
      translateText: (key, options) => t(key, options as any),
      formFieldContainer: ({ children }) => (
        <div className="p-2 border">{children}</div>
      ),
      showNotification: (msg) => toast(msg.message, { type: msg.type }),
    }));
  }, [setFormConfig, t]);

  return <>{children}</>;
};
```

### Configuration APIs

The library exports the built atoms and hooks from `config.ts` so you have full control over the form's global environment:

- `useFormConfigValue()`: Reads the current configuration (used internally by form fields).
- `useFormConfigState()`: Returns `[config, setConfig]` analogous to `useState`.
- `useFormConfigReset()`: Resets the configuration to its default empty state.
- `formConfigAtom`: The raw Jotai atom if you need to manipulate it outside of the React Tree via the Jotai `store`.

## 📄 License

MIT
