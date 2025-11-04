export default function Loader() {
  return (
    <div className='flex flex-col items-center'>
      <div className='animate-spin rounded-full h-15 w-15 border-b-4 border-blue-600'>
        <span className='sr-only'>Data aan het ophalen...</span>
      </div>
    </div>
  );
}