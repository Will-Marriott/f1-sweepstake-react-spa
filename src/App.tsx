import HeaderBar from "./components/HeaderBar/HeaderBar";
import SweepstakeDriversTable from "./components/SweepstakeDriversTable/SweepstakeDriversTable";

const App = () => {
  return (
    <div className="w-vw h-vh flex flex-col items-center pb-4 grow dark:bg-slate-800 dark:text-white">
      <HeaderBar />
      <SweepstakeDriversTable />
    </div>
  );
};

export default App;
