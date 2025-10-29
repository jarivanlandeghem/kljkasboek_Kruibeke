import Navbar from "../components/Navbar";
import TransactionList from "../components/transactions/TransactionList";
import TransactionTable from "../components/transactions/TransactionTable";
export default function TransactionsPage(){
    return(
    <div>
      <Navbar/>
      <TransactionTable/>
      <TransactionList/>
    </div>
  );
}