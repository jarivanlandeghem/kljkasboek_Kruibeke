import { useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { getAll } from '../../api';

export default function CategoryDropdown({ value, onChange, categories = [] }){
  // lokale state voor categorieën uit de backend
  const [remoteCategories, setRemoteCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // als categories via props worden meegegeven, geen fetch doen
    if (categories && categories.length) return;

    let mounted = true;
    setLoading(true);
    getAll('categorieen')
      .then((data) => {
        // backend retourneert waarschijnlijk { items: [...] }
        const items = Array.isArray(data) ? data : data?.items ?? [];
        const names = items.map((i) => i.categorienaam ?? i.naam ?? i.name ?? String(i));
        if (mounted) setRemoteCategories(names);
      })
      .catch((e) => {
        console.error('Failed to load categories', e);
        if (mounted) setError(e);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [categories]);

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
        {loading && !sample.length && (
          <MenuItem value="" disabled>
            <CircularProgress size={18} />&nbsp;Laden...
          </MenuItem>
        )}
        {!loading && sample.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        {error && (
          <MenuItem value="" disabled>Fout bij laden categorieën</MenuItem>
        )}
      </Select>
    </FormControl>
  );
}