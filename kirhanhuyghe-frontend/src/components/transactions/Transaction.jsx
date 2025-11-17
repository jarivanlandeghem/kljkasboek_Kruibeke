import { IoTrashOutline } from 'react-icons/io5';
import CategoryDropdown from '../categories/CategoryDropdown';
import { useState, useEffect } from 'react';
import { put } from '../../api';
import { useSWRConfig } from 'swr';

const dateFormat = new Intl.DateTimeFormat('nl-BE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const amountFormat = new Intl.NumberFormat('nl-BE', {
  currency: 'EUR',
  style: 'currency',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function Transaction({ 
  transactieID, 
  beschrijving, 
  datum, 
  bedrag, 
  userID, 
  onDelete = () => {},
  categorieDetails = null,
  categorieKoppelingen = null,
}) {
  const { mutate } = useSWRConfig();

  const [cat1, setCat1] = useState(null);
  const [cat2, setCat2] = useState(null);

  useEffect(() => {
    // Simple, reliable initialization from props provided by the parent
    if (categorieDetails && Array.isArray(categorieDetails) && categorieDetails.length > 0) {
      setCat1(categorieDetails[0] ?? null);
      setCat2(categorieDetails[1] ?? null);
      return;
    }

    if (categorieKoppelingen && Array.isArray(categorieKoppelingen) && categorieKoppelingen.length > 0) {
      setCat1(
        categorieKoppelingen[0]
          ? { categorieID: categorieKoppelingen[0].categorieID, categorienaam: String(categorieKoppelingen[0].categorieID) }
          : null,
      );
      setCat2(
        categorieKoppelingen[1]
          ? { categorieID: categorieKoppelingen[1].categorieID, categorienaam: String(categorieKoppelingen[1].categorieID) }
          : null,
      );
    }
  }, [categorieDetails, categorieKoppelingen]);
 

  const handleDelete = () => {
    onDelete(transactieID);
  };

  const saveCategories = async (newCat1, newCat2) => {
    const ids = [newCat1?.categorieID, newCat2?.categorieID].filter((v) => v != null);
    try {
      // Call the dedicated endpoint that updates only the join table
      await put(`transacties/${transactieID}/categorieen`, { categorieIDs: ids });
      mutate('transacties');
    } catch (err) {
      console.error('Error saving categories', err);
    }
  };

  const handleCategoryChange = async (index, newValue) => {
    if (index === 1) setCat1(newValue);
    else setCat2(newValue);
    const newCat1 = index === 1 ? newValue : cat1;
    const newCat2 = index === 2 ? newValue : cat2;
    await saveCategories(newCat1, newCat2);
  };

  // Safely format the date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return dateFormat.format(date);
    } catch {
      return 'N/A';
    }
  };

  return (
    <tr className="border-b border-gray-200">
      <td className="py-2">{beschrijving || 'N/A'}</td>
      <td className="py-2">
        <CategoryDropdown
          value={cat1}
          onChange={(v) => handleCategoryChange(1, v)}
          fullWidth={true}
          sx={{ width: 250 }}
        />
      </td>
      <td className="py-2">
        <CategoryDropdown
          value={cat2}
          onChange={(v) => handleCategoryChange(2, v)}
          fullWidth={false}
          sx={{ width: 250 }}
        />
      </td>
      <td className="py-2">{formatDate(datum)}</td>
      <td className="py-2">User {userID}</td>
      <td className="py-2">{amountFormat.format(bedrag || 0)}</td>
      <td className="text-end py-2 pl-8">
        <button className='py-2 px-2.5 rounded-md bg-gray-950' onClick={handleDelete}>
          <IoTrashOutline />
        </button>
      </td>
    </tr>
  );
}

export default Transaction;