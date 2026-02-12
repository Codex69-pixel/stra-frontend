import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '44px',
    fontSize: '1rem',
    borderRadius: '8px',
    borderColor: '#cbd5e1',
    boxShadow: 'none',
    paddingLeft: '2.5rem',
    background: '#fff',
    cursor: 'pointer',
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: state.isSelected ? '#a7f3d0' : state.isFocused ? '#e0f2fe' : '#fff',
    color: '#334155',
    cursor: 'pointer',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    zIndex: 10,
  }),
};

export default function CustomRoleSelect({ value, onChange, options }) {
  return (
    <Select
      styles={customStyles}
      options={options}
      value={options.find(opt => opt.value === value) || null}
      onChange={opt => onChange(opt.value)}
      isSearchable={false}
      placeholder="Select role..."
      menuPlacement="auto"
    />
  );
}
