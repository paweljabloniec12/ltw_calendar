type FieldErrorProps = {
  errors?: string[];
};

export function FieldError({ errors }: FieldErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return <span className="field-error">{errors.join(" ")}</span>;
}
