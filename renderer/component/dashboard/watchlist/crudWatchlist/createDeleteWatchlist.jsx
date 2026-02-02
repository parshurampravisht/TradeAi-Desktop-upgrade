import {
  Dropdown,
  Text,
  Button,
  Link,
  Spacer,
  Image,
  Row,
} from "@nextui-org/react";
import { useState } from "react";
import { AddNoteIcon } from "../AddNoteIcon";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddUpdateWatchlist from "./addUpdateWatchlist";
import { useGlobalContext } from "../../../../context/GlobalContext";
import DeleteWatchlist from "./deleteCurrentWatchlist";

const WatchListHeader = () => {
  const [visible, setVisible] = useState(false); //state for modal visibility
  const [createUpdate, setCreateUpdate] = useState(null); //flag to a function, which creates or updates a watchlist
  const {
    setSelectedWatchlist,
    watchlistMasterData,
    selectedCurrentWatchlist,
    setSelectedCurrentWatchlist,
  } = useGlobalContext();

  //to select wishlist from the loaded watchlist to dropdown button
  const selectWishList = (item) => {
    if (item.currentKey == "create") {
      setCreateUpdate("create");
      handler();
    } else {
      const selectedWatchlist = watchlistMasterData.find(
        (elem) => +elem.watchlistId === +item.currentKey
      );
      setSelectedCurrentWatchlist(selectedWatchlist);
    }
  };

  const setwatchlistSymbols = (watchlistname) => {
    setSelectedWatchlist(new Set([watchlistname]));
  };

  //open and close handler for the model
  const handler = () => setVisible(true);

  return (
    <>
      {/* modal for selecting watch list and their symbols */}
      <AddUpdateWatchlist
        visible={visible}
        setVisible={setVisible}
        createUpdate={createUpdate}
      />

      <Dropdown>
        <Dropdown.Button
          className="primary-text-color"
          flat
          //bordered
          borderWeight="light"
          css={{
            position: "relative",
            tt: "capitalize",
            pl: "$2",
            maxWidth: "100vw",
            mr: "-$20",
            ml: "$6",
            width: "100%",
            background: "$accents1",
          }}
        >
          {!watchlistMasterData.length ? (
            <Text>WatchList </Text>
          ) : (
            selectedCurrentWatchlist?.watchlistName
          )}
        </Dropdown.Button>
        <Dropdown.Menu
          aria-label="Single selection actions"
          color="warning"
          disallowEmptySelection
          selectionMode="single"
          // selectedKeys={selected}
          disabledKeys={["empty"]}
          onSelectionChange={(item) => {
            selectWishList(item);
          }}
        >
          {/* showing watchlist in the dropdown */}

          {!watchlistMasterData.length ? (
            <Dropdown.Item key="empty">
              <Text>Empty</Text>
            </Dropdown.Item>
          ) : (
            watchlistMasterData.map((item, index) => (
              <Dropdown.Item key={item.watchlistId}>
                {item.watchlistName}
              </Dropdown.Item>
            ))
          )}
          <Dropdown.Item
            key="create"
            description="Create a new Watchlist"
            color="success"
            icon={<AddNoteIcon size={22} fill="var(--nextui-colors-success)" />}
          >
            Create
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Spacer x={1} />
      <Row justify="right" css={{ mr: "-$4" }}>
        <DeleteWatchlist />

        {/* <Link auto flat onPress={handler} css={{marginLeft:"$4",marginRight:"$6",mt:"$2"}}>
      </Link> */}
        <Spacer x={0.3} />
        <Link
          flat
          auto
          css={{ background: "#3c57a2", mr: "$8", mt: "$2" }}
          onPress={() => {
            if (watchlistMasterData.length === 0) {
              toast.warn(`Please create the Watchlist.`);
              return;
            }
            setCreateUpdate("update");
            handler();
          }}
          disabled={watchlistMasterData.length === 0}
        >
          <Image src="./images/Add_icon.svg" width={30} />
        </Link>
      </Row>
    </>
  );
};

export default WatchListHeader;
