import { jsx, Fragment } from 'react/jsx-runtime';
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useController, useForm } from 'react-hook-form';
import { withMemo, trimObject, createExtractor } from '@gaddario98/utiles';
import { useTranslatedText } from '@gaddario98/react-localization';
import { useNotification } from '@gaddario98/react-notifications';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const createDefaultContainer = () => {
  return ({
    children
  }) => {
    return children;
  };
};
let DefaultContainer = createDefaultContainer();
const setDefaultFormContainer = val => {
  DefaultContainer = val;
};

let formConfig = {
  formFieldContainer: DefaultContainer,
  errorTranslationOption: {
    ns: "errors"
  }
};
const setFormConfig = config => {
  formConfig = Object.assign(Object.assign({}, formConfig), config);
};

const FormField = withMemo(({
  config,
  onFieldChange,
  ns: globalNs,
  globalErrorNs
}) => {
  var _a, _b, _c, _d;
  const ns = (_a = config.ns) !== null && _a !== void 0 ? _a : globalNs;
  const errorNs = (_b = config.errorNs) !== null && _b !== void 0 ? _b : globalErrorNs;
  const {
    traslateText
  } = useTranslatedText(ns);
  const errorMessage = useMemo(() => {
    var _a;
    if (!config.fieldState.error) return undefined;
    return errorNs ? traslateText((_a = config.fieldState.error.message) !== null && _a !== void 0 ? _a : "", Object.assign(Object.assign({}, formConfig.errorTranslationOption), {
      ns: errorNs !== null && errorNs !== void 0 ? errorNs : formConfig.errorTranslationOption.ns
    })) : config.fieldState.error.message;
  }, [config.fieldState.error, errorNs, traslateText]);
  const label = useMemo(() => {
    var _a;
    return ns ? traslateText((_a = config.label) !== null && _a !== void 0 ? _a : "") : config.label;
  }, [ns, config.label, traslateText]);
  const helperMessage = useMemo(() => {
    var _a, _b, _c;
    return ((_a = config.helper) === null || _a === void 0 ? void 0 : _a.text) ? traslateText((_b = config.helper) === null || _b === void 0 ? void 0 : _b.text, (_c = config.helper) === null || _c === void 0 ? void 0 : _c.translationOption) : "";
  }, [(_c = config.helper) === null || _c === void 0 ? void 0 : _c.text, (_d = config.helper) === null || _d === void 0 ? void 0 : _d.translationOption, traslateText]);
  const handleChange = useCallback(value => {
    config.field.onChange(value);
    onFieldChange === null || onFieldChange === void 0 ? void 0 : onFieldChange(value);
  }, [config.field, onFieldChange]);
  const baseProps = useMemo(() => ({
    value: config.field.value,
    onChange: handleChange,
    error: !!config.fieldState.error,
    errorMessage,
    label,
    helperMessage
  }), [config.field.value, handleChange, config.fieldState.error, errorMessage, label, helperMessage]);
  const container = useMemo(() => (config === null || config === void 0 ? void 0 : config.container) || formConfig.formFieldContainer, [config === null || config === void 0 ? void 0 : config.container]);
  const field = useMemo(() => config.component(baseProps), [config.component, baseProps]);
  if (!config.component) return null;
  return container({
    children: field
  });
});

const RenderField = withMemo(({
  field,
  fieldState,
  fieldProps,
  onFieldChange
}) => {
  const config = useMemo(() => Object.assign(Object.assign({}, fieldProps), {
    field,
    fieldState
  }), [fieldProps, field, fieldState]);
  return jsx(FormField, {
    config: config,
    ns: fieldProps === null || fieldProps === void 0 ? void 0 : fieldProps.ns,
    globalErrorNs: fieldProps === null || fieldProps === void 0 ? void 0 : fieldProps.errorNs,
    onFieldChange: onFieldChange
  });
}, (prev, next) => {
  var _a, _b;
  return prev.field.name === next.field.name && prev.field.value === next.field.value && ((_a = prev.fieldState.error) === null || _a === void 0 ? void 0 : _a.message) === ((_b = next.fieldState.error) === null || _b === void 0 ? void 0 : _b.message) && prev.fieldProps.name === next.fieldProps.name;
});
const ControllerWrapper = withMemo(({
  name,
  control,
  rules,
  render
}) => {
  const {
    field,
    fieldState
  } = useController({
    name,
    control,
    rules
  });
  return render({
    field,
    fieldState
  });
});
const useFormManager = ({
  data,
  onInvalid,
  submit = [],
  notification,
  formControl,
  onValuesChange,
  globalErrorNs
}) => {
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState,
    trigger
  } = formControl;
  const errorsCacheRef = useRef(formState.errors);
  const errors = useMemo(() => {
    const next = formState.errors;
    errorsCacheRef.current = next;
    return errorsCacheRef.current;
  }, [formState.errors]);
  const {
    showNotification
  } = useNotification();
  const handleNotification = useCallback(props => {
    if (props === null || props === void 0 ? void 0 : props.message) {
      showNotification(props);
    }
  }, [showNotification]);
  const filterFormData = useCallback((values, submitConfig) => {
    const keys = submitConfig.values;
    if (!keys || keys.length === 0) {
      return values;
    }
    const out = {};
    for (const key of keys) {
      if (key in values) {
        out[key] = values[key];
      }
    }
    return out;
  }, []);
  const processSubmit = useCallback(async (data_0, submitConfig_0) => {
    const filteredData = filterFormData(data_0, submitConfig_0);
    if (submitConfig_0.onSuccess) {
      return submitConfig_0.onSuccess(filteredData);
    }
    throw new Error("No submit handler provided");
  }, [filterFormData]);
  const handleError = useCallback((error, submitConfig_1) => {
    var _a, _b;
    if (submitConfig_1.onError) {
      submitConfig_1.onError(error);
    }
    const notificationProps = typeof (notification === null || notification === void 0 ? void 0 : notification.error) === "function" ? notification.error((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : "Error") : notification === null || notification === void 0 ? void 0 : notification.error;
    if (notificationProps === null || notificationProps === void 0 ? void 0 : notificationProps.message) {
      handleNotification(Object.assign({
        message: notificationProps.message,
        type: (_b = notificationProps.type) !== null && _b !== void 0 ? _b : "error",
        autoHideDuration: notificationProps.autoHideDuration
      }, notificationProps));
    }
  }, [handleNotification, notification]);
  const createSubmitHandler = useCallback(submitConfig_2 => async data_1 => {
    var _a_0;
    try {
      const res = await processSubmit(trimObject(data_1), submitConfig_2);
      const notificationProps_0 = typeof (notification === null || notification === void 0 ? void 0 : notification.success) === "function" ? notification.success(res) : notification === null || notification === void 0 ? void 0 : notification.success;
      if (notificationProps_0 === null || notificationProps_0 === void 0 ? void 0 : notificationProps_0.message) {
        handleNotification(Object.assign(Object.assign({}, notificationProps_0), {
          message: notificationProps_0.message,
          type: (_a_0 = notificationProps_0.type) !== null && _a_0 !== void 0 ? _a_0 : "success",
          autoHideDuration: notificationProps_0.autoHideDuration
        }));
      }
      return res;
    } catch (error_0) {
      handleError(error_0, submitConfig_2);
      throw error_0;
    }
  }, [processSubmit, notification, handleNotification, handleError]);
  const onInvalidHandle = useCallback((errors_0, submitConfig_3) => {
    onInvalid === null || onInvalid === void 0 ? void 0 : onInvalid(errors_0);
    handleError(new Error("invalidData"), submitConfig_3);
  }, [handleError, onInvalid]);
  const renderSubmit = useCallback((_a_1, index) => {
    var {
        component
      } = _a_1,
      submitConfig_4 = __rest(_a_1, ["component"]);
    return (component === null || component === void 0 ? void 0 : component({
      onClick: async () => {
        const keys_0 = submitConfig_4.values;
        if (keys_0 === null || keys_0 === void 0 ? void 0 : keys_0.length) {
          const ok = await trigger(keys_0);
          if (!ok) return onInvalidHandle(formState.errors, submitConfig_4);
        }
        return handleSubmit(createSubmitHandler(submitConfig_4), errors_1 => onInvalidHandle(errors_1, submitConfig_4))();
      },
      index,
      key: `submit-${index}`,
      type: "submit"
    })) || jsx(Fragment, {});
  }, [createSubmitHandler, handleSubmit, onInvalidHandle, trigger, formState.errors]);
  const values_0 = watch();
  const valueCacheRef = useRef(new Map());
  const extractValues = useMemo(() => {
    return createExtractor(values_0, valueCacheRef.current);
  }, [values_0]);
  const mappedFieldsRef = useRef([]);
  const mappedFields = useMemo(() => {
    var _a_2;
    const next_0 = (_a_2 = data.map((el_0, idx) => {
      if (typeof el_0 === "function") {
        const prev = mappedFieldsRef.current[idx];
        const newField = el_0(extractValues);
        if (prev && prev.name === newField.name) {
          return Object.assign(Object.assign(Object.assign({}, prev), newField), {
            component: prev.component
          });
        }
        return newField;
      }
      return el_0;
    })) === null || _a_2 === void 0 ? void 0 : _a_2.filter(el => !el.hidden);
    mappedFieldsRef.current = next_0;
    return next_0;
  }, [data, extractValues]);
  const fields = useMemo(() => {
    var _a_3;
    return (_a_3 = mappedFields === null || mappedFields === void 0 ? void 0 : mappedFields.filter(el_1 => !(el_1 === null || el_1 === void 0 ? void 0 : el_1.hidden))) === null || _a_3 === void 0 ? void 0 : _a_3.map((fieldProps, index_0) => ({
      index: fieldProps.index === undefined ? index_0 : fieldProps.index,
      element: jsx(ControllerWrapper, {
        control: control,
        name: fieldProps.name,
        rules: fieldProps.rules,
        render: ({
          field,
          fieldState
        }) => {
          var _a_4;
          return jsx(RenderField, {
            field: field,
            fieldState: fieldState,
            fieldProps: Object.assign(Object.assign({}, fieldProps), {
              errorNs: (_a_4 = fieldProps === null || fieldProps === void 0 ? void 0 : fieldProps.errorNs) !== null && _a_4 !== void 0 ? _a_4 : globalErrorNs
            }),
            onFieldChange: fieldProps === null || fieldProps === void 0 ? void 0 : fieldProps.onFieldChange
          }, fieldProps.name);
        }
      }, fieldProps.name),
      renderInFooter: !!fieldProps.renderInFooter,
      renderInHeader: !!fieldProps.renderInHeader
    }));
  }, [mappedFields, control, globalErrorNs]);
  const submits = useMemo(() => submit === null || submit === void 0 ? void 0 : submit.filter(el_2 => !(el_2 === null || el_2 === void 0 ? void 0 : el_2.hidden)).map((submitConfig_5, index_1) => ({
    index: (submitConfig_5 === null || submitConfig_5 === void 0 ? void 0 : submitConfig_5.index) === undefined ? index_1 : submitConfig_5.index,
    element: renderSubmit(submitConfig_5, index_1),
    renderInFooter: !!submitConfig_5.renderInFooter,
    renderInHeader: !!submitConfig_5.renderInHeader
  })), [renderSubmit, submit]);
  const elementsRef = useRef([]);
  const elements = useMemo(() => {
    const next_1 = fields.concat(submits);
    const prev_0 = elementsRef.current;
    const merged = next_1.map(el_3 => {
      const found = prev_0.find(e => e.index === el_3.index && e.element.key === el_3.element.key);
      if (found) {
        return Object.assign(Object.assign(Object.assign({}, found), el_3), {
          element: el_3.element
        });
      }
      return el_3;
    });
    elementsRef.current = merged;
    return merged;
  }, [fields, submits]);
  const formContentsRef = useRef([]);
  const formContents = useMemo(() => {
    const next_2 = [...(mappedFields !== null && mappedFields !== void 0 ? mappedFields : []), ...submit];
    const prev_1 = formContentsRef.current;
    const merged_0 = next_2.map((el_4, idx_0) => {
      var _a_5;
      const key_0 = (_a_5 = el_4 === null || el_4 === void 0 ? void 0 : el_4.key) !== null && _a_5 !== void 0 ? _a_5 : idx_0;
      const found_0 = prev_1.find((e_0, i) => {
        var _a_6;
        return ((_a_6 = e_0 === null || e_0 === void 0 ? void 0 : e_0.key) !== null && _a_6 !== void 0 ? _a_6 : i) === key_0;
      });
      if (found_0) {
        return Object.assign(Object.assign({}, found_0), el_4);
      }
      return el_4;
    });
    formContentsRef.current = merged_0;
    return merged_0;
  }, [mappedFields, submit]);
  useEffect(() => {
    onValuesChange === null || onValuesChange === void 0 ? void 0 : onValuesChange(extractValues);
  }, [onValuesChange, extractValues]);
  return {
    elements,
    formContents,
    errors
  };
};

const FormManager = withMemo(({
  data,
  defaultValues,
  onInvalid,
  submit = [],
  ns,
  globalErrorNs,
  notification,
  formControl,
  container,
  formSettings
}) => {
  const newFormControl = useForm(Object.assign({
    defaultValues,
    mode: "all"
  }, formSettings));
  const {
    elements
  } = useFormManager({
    data,
    formControl: formControl !== null && formControl !== void 0 ? formControl : newFormControl,
    globalErrorNs,
    notification,
    onInvalid,
    submit
  });
  const render = useMemo(() => elements === null || elements === void 0 ? void 0 : elements.sort((a, b) => a.index - b.index).map(el => el.element), [elements]);
  const Container = useMemo(() => container || DefaultContainer, [container]);
  return jsx(Container, {
    children: render
  });
}, (prev, next) => {
  var _a, _b;
  if (prev.data.length !== next.data.length) return false;
  if (((_a = prev.submit) === null || _a === void 0 ? void 0 : _a.length) !== ((_b = next.submit) === null || _b === void 0 ? void 0 : _b.length)) return false;
  const prevDataSignature = prev.data.map(d => typeof d === 'function' ? 'function' : d.name).join("-");
  const nextDataSignature = next.data.map(d => typeof d === 'function' ? 'function' : d.name).join("-");
  return prevDataSignature === nextDataSignature && prev.ns === next.ns && prev.globalErrorNs === next.globalErrorNs;
});

export { DefaultContainer, FormManager, formConfig, setDefaultFormContainer, setFormConfig, useFormManager };
//# sourceMappingURL=index.mjs.map
