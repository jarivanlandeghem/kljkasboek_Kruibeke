import { useMemo, useState, useEffect } from 'react';
import { CircularProgress, TextField, Autocomplete } from '@mui/material';
import useSWR from 'swr';
import { getAll } from '../../api';

export default function CategoryDropdown({ value, onChange, categories = [], sx, className, style, fullWidth = true }) {
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

  // Always sort options alphabetically by `categorienaam` (case-insensitive)
  const sortedOptions = useMemo(() => {
    const copy = Array.isArray(options) ? [...options] : [];
    copy.sort((a, b) => {
      const an = (typeof a === 'string' ? a : a?.categorienaam || '').toString().toLowerCase();
      const bn = (typeof b === 'string' ? b : b?.categorienaam || '').toString().toLowerCase();
      if (an < bn) return -1;
      if (an > bn) return 1;
      return 0;
    });
    return copy;
  }, [options]);

  const handleChange = (_, newValue) => {
    if (typeof onChange === 'function') {
      onChange(newValue || null);
    } else {
      setInternalValue(newValue || null);
    }
  };

  const [internalValue, setInternalValue] = useState(value ?? null);

  useEffect(() => {
    if (value !== undefined) setInternalValue(value ?? null);
  }, [value]);

  const controlledValue = value !== undefined ? value ?? null : internalValue;

  return (
    <Autocomplete
      value={controlledValue}
      onChange={handleChange}
      options={sortedOptions}
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
