import { AgGridReact } from "ag-grid-react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  currencyFormatter,
} from "../../../helpers";
import { useRef, useState, useMemo, memo } from "react";
import { useEffect } from "react";
import {
  Row,
  Spacer,
  Checkbox,
} from "@nextui-org/react";
import { IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { useGlobalContext } from "../../../context/GlobalContext";
import { getSymbolsListNetPositions, getSymbolsListHoldings } from "./helpers";
import FullPageLoader from "../../common/FullPageLoader";
import "react-toastify/dist/ReactToastify.css";

function SubDashboardTablesEditor(props) {

  const {
    selectedCheckboxSquareOffHoldings,
    setSelectedCheckboxSquareOffHoldings,
    holdingsTableSquareOffHandler,
    selectAllholdingsTableSquareOffHandler,
    selectedCheckboxSquareOffNetPositions,
    setSelectedCheckboxSquareOffNetPositions,
    netPositionsTableSquareOffHandler,
    setHoldingsSelectAll,
    setNetPositionsSelectAll,
    filteredbody,
    showtable,
    isDataLoading,
    displayTotalUnRealizedMTM,
    totalRealizedMTM,
    displayPercentageLTP,
    gridOptionsData,
    holdingsTableCellClicked,
    netPositionsTableCellClicked,
    onCellClicked,
    onRowEditingStopped,
    onRowEditingStarted,
    getAllSearchInputs,
    columns,
    defaultColDef,
    totalRow,
  } = props;

  const {
    loadSymbols,
    setLoadSymbols,
    flowLtpShares,
    gridRef,
    openModelPreview,
    modifyOrderData,
    setModifyOrderData,
    setCancelOrderData,
    holdingsFilteredbody,
  } = useGlobalContext();

  const [isMount, setIsMount] = useState(false);

  useEffect(() => {
    if (!isMount) setIsMount(true);
  }, []);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current?.api?.sizeColumnsToFit();

      if (isDataLoading) {
        gridRef.current?.api?.showLoadingOverlay();
      } else if (filteredbody?.length === 0) {
        gridRef.current?.api?.showNoRowsOverlay();
      } else {
        gridRef.current?.api?.hideOverlay();
      }
    }
  }, [filteredbody, isDataLoading]);

  const [holdingSellApproveFlag, setHoldingSellApproveFlag] = useState("");

  const holdingsCellRenderer = (params) => {
    const rowId = `row-${params.rowIndex}`;

    const checkboxHandler = (rowId) => {
      setSelectedCheckboxSquareOffHoldings((prev) => {
        const isSelected = prev.includes(rowId);
        return isSelected
          ? prev.filter((id) => id !== rowId)
          : [...prev, rowId];
      });
    };

    return (
      <>
        {rowId !== holdingSellApproveFlag ? (
          <div className="flex-row align-center">
            <Checkbox
              style={{ marginRight: "5px", cursor: "pointer" }}
              isSelected={selectedCheckboxSquareOffHoldings.includes(rowId)}
              onChange={() => {
                checkboxHandler(rowId);
                setHoldingsSelectAll(false);
                holdingsTableSquareOffHandler(params);
              }}
            />
            <button
              style={{
                textAlign: "justify",
                lineHeight: "15px",
                padding: "0px 5px -2px 5px",
                height: "20px",
                border: "none",
                borderRadius: "7px",
                cursor: "pointer",
              }}
              onClick={() => {
                flowLtpShares.current = true;
                setHoldingSellApproveFlag(rowId);
              }}
            >
              SQ
            </button>
          </div>
        ) : (
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <IconCheck
              type="button"
              height={20}
              width={20}
              color={"#000"}
              stroke-width={1}
              data-action="send"
              onClick={() => {
                flowLtpShares.current = true;
                setHoldingSellApproveFlag(rowId);
              }}
            />
            <IconX
              type="button"
              height={20}
              width={20}
              color={"#000"}
              stroke-width={1}
              onClick={() => {
                flowLtpShares.current = true;
                setHoldingSellApproveFlag("");
              }}
              data-action="cancel"
            />
          </div>
        )}
      </>
    );
  };

  const netPositionsCellRenderer = (params) => {
    const sellApproveFlagRef = useRef(false);
    const rowId = `row-${params.rowIndex}`;

    const handleClick = () => {
      const newValue = !sellApproveFlagRef.current;
      sellApproveFlagRef.current = newValue;
    };

    const netPositionsCheckboxHandler = (rowId) => {
      setSelectedCheckboxSquareOffNetPositions((prev) => {
        const isSelected = prev.includes(rowId);
        return isSelected
          ? prev.filter((id) => id !== rowId)
          : [...prev, rowId];
      });
    };

    return (
      <>
        {!sellApproveFlagRef.current ? (
          <div className="flex-row align-center">
            {+params.data?.Qty !== 0 && (
              <>
                <Checkbox
                  style={{ marginRight: "5px", cursor: "pointer" }}
                  isSelected={selectedCheckboxSquareOffNetPositions.includes(
                    rowId
                  )}
                  // type="checkbox"
                  onChange={() => {
                    netPositionsCheckboxHandler(rowId);
                    setNetPositionsSelectAll(false);
                    netPositionsTableSquareOffHandler(params);
                  }}
                />
                <button
                  style={{
                    textAlign: "justify",
                    lineHeight: "15px",
                    padding: "0px 5px -2px 5px",
                    height: "20px",
                    border: "none",
                    borderRadius: "7px",
                    cursor: "pointer",
                  }}
                  // onClick={() => {
                  //   flowLtpShares.current = false;
                  //   setSellApproveFlag(true);
                  // }}
                  onClick={handleClick}
                >
                  SQ
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <IconCheck
              type="button"
              height={20}
              width={20}
              color={"#000"}
              stroke-width={1}
              data-action="send"
              // onClick={() => {
              //   flowLtpShares.current = true;
              //   setSellApproveFlag(false);
              // }}
              onClick={handleClick}
              style={{ cursor: "pointer" }}
            />
            <IconX
              type="button"
              height={20}
              width={20}
              color={"#000"}
              stroke-width={1}
              // onClick={() => {
              //   flowLtpShares.current = true;
              //   setSellApproveFlag(false);
              // }}
              onClick={handleClick}
              data-action="cancel"
              style={{ cursor: "pointer" }}
            />
          </div>
        )}
      </>
    );
  };

  const MemoizedHoldingsCellRenderer = useMemo(
    () => holdingsCellRenderer,
    [selectedCheckboxSquareOffHoldings]
  );
  const MemoizedNetPositionsCellRenderer = useMemo(
    () => netPositionsCellRenderer,
    [selectedCheckboxSquareOffNetPositions]
  );

  const MemoizedOrderCellRenderer = useMemo(
    () => actionCellRenderer,
    [modifyOrderData]
  );

  // memoized symbol lists to avoid updating state during render
  const symbolListForHoldings = useMemo(() => {
    return getSymbolsListHoldings(loadSymbols, filteredbody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSymbols, filteredbody]);

  const symbolListForNetPositions = useMemo(() => {
    return getSymbolsListNetPositions(loadSymbols, filteredbody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSymbols, filteredbody]);

  // effects to update context state after render
  useEffect(() => {
    if (showtable === "holdings") {
      setLoadSymbols(symbolListForHoldings);
    }
  }, [showtable, symbolListForHoldings, setLoadSymbols]);

  useEffect(() => {
    if (showtable === "netpositions") {
      setLoadSymbols(symbolListForNetPositions);
    }
  }, [showtable, symbolListForNetPositions, setLoadSymbols]);

  function actionCellRenderer(params) {
    let actionbuttons = null;

    let editingCells = params.api.getEditingCells();
    // checks if the rowIndex matches in at least one of the editing cells
    let isCurrentRowEditing = editingCells.some((cell) => {
      return cell.rowIndex === params.node.rowIndex;
    });

    const multipleModifyOrderHandler = (selectedParams) => {
      setModifyOrderData((prevData) => {
        let exists = prevData.some(
          (item) => item["rowIndex"] === selectedParams.rowIndex
        );

        const updatedData = exists
          ? prevData.filter(
            (item) => item["rowIndex"] !== selectedParams?.rowIndex
          )
          : [
            ...prevData,
            { ...selectedParams?.data, rowIndex: selectedParams?.rowIndex },
          ];
        setCancelOrderData(updatedData);
        return updatedData;
      });
    };

    if (params.data.Status !== "Pending" && params.data.Status !== "Modified")
      return <></>;

    if (isCurrentRowEditing) {
      actionbuttons = (
        <>
          <Row justify="center">
            <IconCheck
              type="button"
              height={25}
              width={18}
              cursor="pointer"
              color={"#000"}
              strokeWidth={2}
              data-action="update"
            />
            <Spacer x={1} />
            <IconX
              type="button"
              height={25}
              width={18}
              cursor="pointer"
              color={"#000"}
              strokeWidth={2}
              data-action="cancel"
            />
          </Row>
        </>
      );
    } else {
      actionbuttons = (
        <>
          <Row justify="center">
            <Checkbox
              style={{ marginRight: "10px", cursor: "pointer" }}
              isSelected={modifyOrderData
                .map((item) => item?.rowIndex)
                .includes(params?.rowIndex)}
              onChange={() => multipleModifyOrderHandler(params)}
            />
            <IconPencil
              type="button"
              height={25}
              width={25}
              cursor="pointer"
              color={"#000"}
              strokeWidth={2}
              data-action="edit"
            />
            <Spacer x={1} />
            <IconTrash
              height={25}
              // width={18}
              width={25}
              cursor="pointer"
              color={"#000"}
              strokeWidth={2}
              data-action="delete"
            />
          </Row>
        </>
      );
    }
    return actionbuttons;
  }

  return (
    <>
      {!!openModelPreview && (
        <div
          className="ag-theme-balham"
          style={{
            height:
              showtable == "holdings" || "netpositions" ? "75vh" : "78vh",
            width: "auto",
            overflowX: "auto",
            marginTop: "-3.2%",
            ...(isMount && window.innerWidth >= 1920 && { marginTop: "-2%" }),
          }}
        >
          <FullPageLoader show={isDataLoading} />
          <AgGridReact
            onRowEditingStopped={onRowEditingStopped}
            onRowEditingStarted={onRowEditingStarted}
            onCellClicked={
              showtable === "holdings"
                ? holdingsTableCellClicked
                : showtable === "netpositions"
                  ? netPositionsTableCellClicked
                  : onCellClicked
            }
            editType="fullRow"
            // suppressClickEdit={true}
            modules={[ClientSideRowModelModule]}
            columnDefs={columns}
            ref={gridRef}
            overlayNoRowsTemplate="No Data Found"
            overlayLoadingTemplate="Loading Data..."
            floatingFilter={true}
            rowData={showtable === "holdings" ? holdingsFilteredbody : filteredbody}
            sizeColumnsToFit={true}
            enableColResize={true}
            defaultColDef={defaultColDef}
            gridOptions={gridOptionsData}
            onFilterChanged={(params) => {
              getAllSearchInputs(params);
            }}
          />
        </div>
      )}

      {showtable === "holdings" ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignContent: "center",
            border: "1px solid #ECEEF0",
          }}
        >
          <div
            style={{
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            Total
          </div>
          <div
            style={{
              display: "flex",
              gap: "3rem",
              marginRight: "20px",
            }}
          >
            <span
              style={{
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              Invested:{" "}
              {totalRow.value ? currencyFormatter(totalRow.value, 2) : "-"}
            </span>
            <span
              style={{
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              Market Value:{" "}
              <span
                style={{
                  color:
                    totalRow.marketAmount - totalRow.value > 0
                      ? "green"
                      : "red",
                }}
              >
                {totalRow.marketAmount
                  ? currencyFormatter(totalRow.marketAmount, 2)
                  : "-"}
              </span>
            </span>
            <span
              style={{
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              P&L:{" "}
              <span
                style={{
                  color:
                    totalRow.marketAmount - totalRow.value > 0
                      ? "green"
                      : "red",
                }}
              >
                {totalRow.TotalLTP
                  ? currencyFormatter(totalRow.TotalLTP, 2)
                  : "-"}{" "}
                ({displayPercentageLTP || "-"}%)
              </span>
            </span>
          </div>
        </div>
      ) : showtable === "netpositions" ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignContent: "center",
            border: "1px solid #ECEEF0",
          }}
        >
          <div
            style={{
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            Total
          </div>
          <div
            style={{
              display: "flex",
              gap: "3rem",
              marginRight: "20px",
            }}
          >
            <span
              style={{
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              Realized MTM:{currencyFormatter(totalRealizedMTM, 2)}
            </span>
            <span
              style={{
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              Unrealized MTM: {currencyFormatter(displayTotalUnRealizedMTM, 2)}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <div></div>
        </div>
      )}
    </>
  );
};

export default memo(SubDashboardTablesEditor);
