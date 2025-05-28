import { useEffect, useState } from "react";

interface DriverStanding {
  Driver: {
    givenName: string;
    familyName: string;
  };
  Constructors: { name: string }[];
  points: string;
}

const droppedDrivers = ["Doohan"];
const players = [
  "Will",
  "Alex",
  "Coops",
  "Emily",
  "Charlotte",
  "GC",
  "Roz",
  "Iain",
  "Ted",
  "Matty",
].sort((a, b) => a.localeCompare(b));

const randomiseArray = <T,>(array: T[], seed?: number) => {
  if (seed) {
    const seededRandom = createSeededRandom(seed);
    array.sort(() => seededRandom() - 0.5);
  } else {
    array.sort(() => Math.random() - 0.5);
  }
  return array;
};

const createSeededRandom = (seed: number) => {
  const m = 0x80000000;
  const a = 1103515245;
  const c = 12345;

  let currentSeed = seed % m;

  return () => {
    currentSeed = (a * currentSeed + c) % m;
    return currentSeed / m;
  };
};

function App() {
  const BASE_API_URL = "https://api.jolpi.ca/ergast/f1/current/";
  const DRIVER_STANDINGS_URL = "driverStandings/";
  const NEXT_RACE_URL = "next/races/";

  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [nextRaceInfo, setNextRaceInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (driverStandings.length !== 0) {
      return;
    }
    const fetchDriverStandings = async () => {
      setIsLoading(true);
      try {
        // const response = await fetch(BASE_API_URL + DRIVER_STANDINGS_URL);
        const [standingsData, nextRaceData] = await Promise.all([
          fetch(BASE_API_URL + DRIVER_STANDINGS_URL).then((res) => {
            if (!res.ok) {
              throw new Error("Failed to fetch driver standings");
            }
            return res.json();
          }),
          fetch(BASE_API_URL + NEXT_RACE_URL).then((res) => {
            if (!res.ok) {
              throw new Error("Failed to fetch next race data");
            }
            return res.json();
          }),
        ]);

        const driverStandings: DriverStanding[] =
          standingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings.filter(
            (driverStanding: DriverStanding) =>
              !droppedDrivers.includes(driverStanding.Driver.familyName)
          );

        setNextRaceInfo(nextRaceData.MRData.RaceTable.Races[0]);
        setDriverStandings(
          driverStandings.sort(
            (a, b) => parseInt(b.points) - parseInt(a.points)
          )
        );
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    fetchDriverStandings();
  }, []);

  const [top10Drivers, bottom10Drivers] = driverStandings.reduce(
    (acc, driver, index) => {
      if (index < 10) {
        acc[0].push(driver);
      } else acc[1].push(driver);
      return acc;
    },
    [[], []] as [DriverStanding[], DriverStanding[]]
  );

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-blue-500">Loading...</p>;
    }

    if (error) {
      return <p className="text-red-500">Error: {error}</p>;
    }

    const randomisedTop10Drivers: DriverStanding[] = randomiseArray(
      top10Drivers,
      parseInt(nextRaceInfo.round)
    );
    const randomisedBottome10Drivers: DriverStanding[] = randomiseArray(
      bottom10Drivers,
      parseInt(nextRaceInfo.round)
    );

    if (
      players.length > randomisedTop10Drivers.length ||
      players.length > randomisedBottome10Drivers.length
    ) {
      return (
        <p className="text-red-500">Not enough drivers to assign to players.</p>
      );
    }

    return (
      <table className="table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Player</th>
            <th className="border border-gray-300 px-4 py-2">Driver 1</th>
            <th className="border border-gray-300 px-4 py-2">Driver 2</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">{player}</td>
              <td className="border border-gray-300 px-4 py-2">
                {randomisedTop10Drivers[index]?.Driver.familyName || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {randomisedBottome10Drivers[index]?.Driver.familyName || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="w-full h-auto flex flex-col items-center pb-4  dark:bg-gray-800 dark:text-white">
      <div className="flex flex-col items-center w-full max-w-4xl p-2 bg-white dark:bg-red-600 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold my-4 font-orbitron">
          F1 Driver Assignment
        </h1>
      </div>
      {nextRaceInfo && (
        <div className="my-4">
          <p className="text-lg">{nextRaceInfo.raceName}:</p>
        </div>
      )}
      {renderContent()}
    </div>
  );
}

export default App;
