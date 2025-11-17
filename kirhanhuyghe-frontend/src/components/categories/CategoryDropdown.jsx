import { useMemo } from 'react';
import { CircularProgress, TextField, Autocomplete } from '@mui/material';
import useSWR from 'swr';
import { getAll } from '../../api';

export default function CategoryDropdown({ value, onChange, categories = [], sx, className, style, fullWidth = true }) {
  // Fetch categories van backend tenzij meegegeven via props
  const { data: fetched, error, isLoading } = useSWR(
    categories && categories.length ? null : 'categorieen',
    getAll,
  );

  const remoteCategories = useMemo(() => {
    if (!fetched) return [];
    const items = Array.isArray(fetched) ? fetched : fetched?.items ?? [];
    return items.map((i) => ({
      categorieID: i.categorieID ?? i.id ?? null,
      categorienaam: i.categorienaam ?? i.naam ?? i.name ?? String(i),
    }));
  }, [fetched]);

  const options = categories.length
    ? categories.map((c) => (typeof c === 'string' ? { categorieID: null, categorienaam: c } : c))
    : remoteCategories.length
    ? remoteCategories
    : [
        { categorieID: null, categorienaam: 'Salaris' },
        { categorieID: null, categorienaam: 'Boodschappen' },
        { categorieID: null, categorienaam: 'Huur' },
      ];

  const handleChange = (_, newValue) => {
    if (typeof onChange === 'function') onChange(newValue || null);
  };

  return (
    <Autocomplete
      value={value ?? null}
      onChange={handleChange}
      options={options}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option?.categorienaam ?? '')}
      isOptionEqualToValue={(option, val) => {
        if (!option || !val) return false;
        if (option.categorieID != null && val.categorieID != null) return option.categorieID === val.categorieID;
        return option.categorienaam === val.categorienaam;
      }}
      loading={isLoading}
      disabled={!!error}
      fullWidth={fullWidth}
      sx={sx}
      className={className}
      style={style}
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
