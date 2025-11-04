import { IoTrashOutline } from 'react-icons/io5';

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
  onDelete = () => {} 
}) { 
  const handleDelete = () => {
    onDelete(transactieID);
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
      <td className="py-2">Cat 1</td>
      <td className="py-2">Cat 2</td>
      <td className="py-2">{formatDate(datum)}</td>
      <td className="py-2">User {userID}</td>
      <td className="py-2">{amountFormat.format(bedrag || 0)}</td>
      <td className="text-end py-2 pl-8">
        <button className='py-2 px-2.5 rounded-md bg-blue-600' onClick={handleDelete}>
          <IoTrashOutline />
        </button>
      </td>
    </tr>
  );
}

export default Transaction;