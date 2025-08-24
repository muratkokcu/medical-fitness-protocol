import React from 'react';
import type { FormField as FormFieldType } from '../types/assessment';

interface FormFieldProps {
  field: FormFieldType;
  value: string | number | boolean | undefined;
  onChange: (id: string, value: string | number | boolean) => void;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, error }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let newValue: string | number | boolean;
    
    if (field.type === 'number') {
      newValue = parseFloat(e.target.value) || 0;
    } else if (e.target.value === 'true') {
      newValue = true;
    } else if (e.target.value === 'false') {
      newValue = false;
    } else {
      newValue = e.target.value;
    }
    
    onChange(field.id, newValue);
  };

  const renderField = () => {
    const commonProps = {
      id: field.id,
      value: value === true ? 'true' : value === false ? 'false' : value || '',
      onChange: handleChange,
      placeholder: field.placeholder || '',
      required: field.required || false,
      className: error ? 'form-field-error' : ''
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps}>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea 
            {...commonProps}
            rows={field.rows || 3}
          />
        );

      case 'number':
        return (
          <input 
            {...commonProps}
            type="number"
            step={field.step || '1'}
          />
        );

      case 'date':
        return (
          <input 
            {...commonProps}
            type="date"
          />
        );

      case 'text':
      default:
        return (
          <input 
            {...commonProps}
            type="text"
          />
        );
    }
  };

  return (
    <div className="form-group">
      <label className={field.required ? 'required' : ''}>
        {field.label}
      </label>
      {renderField()}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FormField;