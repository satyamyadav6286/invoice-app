
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import Login from './component/login/Login';
import Register from './component/register/Register';
import Dashboard from './component/dashboard/Dashboard';
import Home from './component/dashboard/Home';
import Invoices from './component/dashboard/Invoices';
import NewInvoice from './component/dashboard/NewInvoice';
import Setting from './component/dashboard/Setting';
import InvoiceDetail from './component/InvoiceDetail';

function App() {
  const myRouter = createBrowserRouter([
    {path:'',Component:Login},
    {path:'/login',Component:Login},
    {path:'/register',Component:Register},
    {path:'/dashboard',Component:Dashboard,children:[
      {path:'',Component:Home},
      {path:'home',Component:Home},
      {path:'invoices',Component:Invoices},
      {path:'new-invoice',Component:NewInvoice},
      {path:'setting',Component:Setting},
      {path:'invoice-detail',Component:InvoiceDetail}
    ]}
  ])
  return (
    <div>
      <RouterProvider router={myRouter}></RouterProvider>
    </div>
  );
}

export default App;
