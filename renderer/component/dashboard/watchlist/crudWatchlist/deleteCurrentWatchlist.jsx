import electron from "electron";
const ipcRenderer = electron.ipcRenderer || false;
import { Button, Text, Image, Link } from "@nextui-org/react";
import { useGlobalContext } from "../../../../context/GlobalContext";
import { deleteWatchlist } from "../../../../../services/transactions/transactions.service";

const DeleteWatchlist = () => {
  const {
    selectedCurrentWatchlist,
    setSelectedCurrentWatchlist,
    setWatchlistMasterData,
    setSelectedWatchlistSymbolData,
  } = useGlobalContext();

  const deleteWatchlistHandler = async () => {
    try {
      if (
        selectedCurrentWatchlist &&
        Object.keys(selectedCurrentWatchlist).length
      ) {
        await deleteWatchlist(selectedCurrentWatchlist?.watchlistId);

        setWatchlistMasterData((prev) => {
          const updatedData = prev.filter(
            (item) => item.watchlistId !== selectedCurrentWatchlist?.watchlistId
          );

          if (!!updatedData.length) {
            const deletedIndex = prev.findIndex(
              (item) =>
                item.watchlistId === selectedCurrentWatchlist?.watchlistId
            );

            const nextIndex =
              deletedIndex < updatedData.length ? deletedIndex : 0;

            setSelectedCurrentWatchlist(updatedData[nextIndex]);
          } else {
            setSelectedCurrentWatchlist(null);
            setSelectedWatchlistSymbolData([]);
          }
          return updatedData;
        });
      }
    } catch (error) {
      console.log("delete watchlist error", error);
    }
  };

  return (
    <>
      <Link
        css={{
          width: "auto",
          height: "auto",
          // alignSelf: "center",
          mt: "$1",
          ml: "$15",
          pl: "-$12",
          pr: "-$1",
          background: "transparent",
        }}
        auto
        // shadow
        flat
        disabled={!Boolean(selectedCurrentWatchlist)}
        onPress={deleteWatchlistHandler}
      >
        <Image
          src="./images/icons8-delete 1.svg"
          width={34}
          objectFit="fill"
          css={{ mt: "-$.8" }}
        />
      </Link>
    </>
  );
};

export default DeleteWatchlist;
