import React, { ReactNode } from 'react';
import { useController, FieldValues, Path, Control } from 'react-hook-form';
import { KeyboardTypeOptions, ViewStyle } from 'react-native';
import Input from './Input';
import Dropdown, { DropdownOption } from './Dropdown';
import DatePicker from './DatePicker';

/**
 * Thin react-hook-form adapters for the existing Input / Dropdown / DatePicker.
 * Generic over the form shape so consumers get full type-safety on `name`.
 *
 * Wrappers only — no styling. The underlying components own all visuals so
 * the form continues to look identical to its non-RHF version.
 */

interface RHFInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  style?: ViewStyle;
}

export function RHFInput<T extends FieldValues>({
  control, name, ...rest
}: RHFInputProps<T>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Input
      {...rest}
      value={(field.value as string) ?? ''}
      onChangeText={field.onChange}
      error={fieldState.error?.message}
    />
  );
}

interface RHFDropdownProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  searchable?: boolean;
  searchPlaceholder?: string;
  style?: ViewStyle;
}

export function RHFDropdown<T extends FieldValues>({
  control, name, ...rest
}: RHFDropdownProps<T>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Dropdown
      {...rest}
      value={(field.value as string) ?? ''}
      onSelect={field.onChange}
      error={fieldState.error?.message}
    />
  );
}

interface RHFDatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  style?: ViewStyle;
}

export function RHFDatePicker<T extends FieldValues>({
  control, name, ...rest
}: RHFDatePickerProps<T>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <DatePicker
      {...rest}
      value={(field.value as string) ?? ''}
      onChange={field.onChange}
      error={fieldState.error?.message}
    />
  );
}
