import { useMemo } from 'react';
import { CircularProgress, TextField, Autocomplete } from '@mui/material';
import useSWR from 'swr';
import { getAll } from '../../api';

export default function CategoryDropdown({ value, onChange, categories = [] }) {
  // Fetch categories van backend tenzij meegegeven via props
  const { data: fetched, error, isLoading } = useSWR(
    categories && categories.length ? null : 'categorieen',
    getAll,
  );

  const remoteCategories = useMemo(() => {
    if (!fetched) return [];
    const items = Array.isArray(fetched) ? fetched : fetched?.items ?? [];
    return items.map((i) => i.categorienaam ?? i.naam ?? i.name ?? String(i));
  }, [fetched]);

  const options = categories.length
    ? categories
    : remoteCategories.length
    ? remoteCategories
    : ['Salaris', 'Boodschappen', 'Huur'];

  const handleChange = (_, newValue) => {
    if (typeof onChange === 'function') onChange(newValue || null);
  };

  return (
    <Autocomplete
      value={value ?? ''}
      onChange={handleChange}
      options={options}
      loading={isLoading}
      disabled={!!error}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label="Categorie"
          placeholder="Selecteer of typ een categorie"
          error={!!error}
          helperText={error ? 'Fout bij laden categorieën' : ''}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
