import Navbar from "../components/Navbar";
import TransactionTable from "../components/transactions/TransactionTable";
export default function TransactionsPage(){
    return(
    <div>
      <Navbar/>
      <TransactionTable/>
    </div>
  );
}