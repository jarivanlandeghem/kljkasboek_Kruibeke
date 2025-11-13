import { useMemo } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { getAll } from '../../api';
import useSWR from 'swr';

export default function CategoryDropdown({ value, onChange, categories = [] }){
  // Fetch categories from backend unless provided via props
  const { data: fetched, error, isLoading } = useSWR(
    categories && categories.length ? null : 'categorieen',
    getAll,
  );

  const remoteCategories = useMemo(() => {
    if (!fetched) return [];
    const items = Array.isArray(fetched) ? fetched : fetched?.items ?? [];
    return items.map((i) => i.categorienaam ?? i.naam ?? i.name ?? String(i));
  }, [fetched]);

  const sample = categories.length ? categories : (remoteCategories.length ? remoteCategories : ["Salaris","Boodschappen","Huur"]);

  const handleChange = (event) => {
    const v = event.target.value === '' ? null : event.target.value;
    if (typeof onChange === 'function') onChange(v);
  };

  return (
    <FormControl fullWidth size="medium">
      <InputLabel id="category-select-label"></InputLabel>
      <Select
        labelId="category-select-label"
        value={value ?? ''}
        label="Categorie"
        onChange={handleChange}
        displayEmpty
      >
        <MenuItem value="">— Alle categorieën —</MenuItem>
        {isLoading && !sample.length && (
          <MenuItem value="" disabled>
            <CircularProgress size={18} />&nbsp;Laden...
          </MenuItem>
        )}
        {!isLoading && sample.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        {error && (
          <MenuItem value="" disabled>Fout bij laden categorieën</MenuItem>
        )}
      </Select>
    </FormControl>
  );
}