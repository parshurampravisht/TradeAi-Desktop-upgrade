import { Button, Card, Modal, Row, Switch, Text } from "@nextui-org/react";
import { AgGridReact } from "ag-grid-react";
import React, { useCallback, useEffect, useState, memo } from "react";
import SignUp from "../../auth/signup/signUp";
import {
  deleteDealers,
  getDealers,
  updateDealer,
} from "../../../../services/auth/auth.service";
import { toast } from "react-toastify";
import moment from "moment/moment";
import {
  IconTrash,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconX,
  IconCheck,
} from "@tabler/icons-react";

function DealersListingPage() {
  const newValue = {
    email_id: "",
    address: "",
    phone: "",
  };
  const [openCreateUserModal, setOpenCreateUserModal] = useState(false);
  // const useEditedRowData = useRef(null);
  const [dealers, setDealers] = useState([]);
  const [flag, setFlag] = useState(false);
  const [status, setStatus] = useState(true);

  const refreshComponent = () => {
    setFlag(!flag);
  };

  const fetchDealersList = async () => {
    const response = await getDealers();
    if (response?.status === "success") {
      if (response?.data !== null && response?.data !== undefined) {
        const tempArray = [];
        Object.keys(response.data).forEach((item) => {
          tempArray.push({ ...response.data[item], id: item });
        });
        setDealers(tempArray);
      }
    } else {
      toast.error(
        response?.message ? response?.message : "Something went wrong!"
      );
    }
  };

  const updateDealerInfoCall = () => {
    refreshComponent();
  };

  const handleSwitchChange = async (e, props) => {
    const newState = e.target.checked;
    try {
      const res = await updateDealer({
        user_id: props?.data?.user_id,
        is_active: newState ? "True" : "False",
        first_name: props?.data?.first_name,
      });

      if (res?.status === "success") {
        setStatus(newState);
        toast.success(res?.message);
        updateDealerInfoCall();
      } else {
        toast.error(`Something went wrong: ${res?.message}`);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  //cell Renderes
  const ActivityToggler = (props) => {
    useEffect(() => {
      setStatus(props.data?.is_active);
    }, [props.data?.is_active]);

    return (
      <Row>
        <span style={{ width: "100px" }}>
          {props.data?.is_active ? "Active" : "Inactive"}
        </span>

        <Switch
          checked={status}
          size="sm"
          onChange={(e) => handleSwitchChange(e, props)}
        ></Switch>
      </Row>
    );
  };

  const actionsCellRenderer = (params) => {
    const [inquireActionConfirm, setInquireActionConfirm] = useState(false);
    const [confirmActionType, setConfirmActionType] = useState(""); //"confirm-edit"|"confirm-delete"
    const [showDelConfirm, setShowDelConfirm] = useState(false);
    const [enableEdit, setEnableEdit] = useState(false);
    let actionbuttons = null;

    let editingCells = params.api.getEditingCells();
    // checks if the rowIndex matches in at least one of the editing cells
    let isCurrentRowEditing = editingCells.some((cell) => {
      return cell.rowIndex === params.node.rowIndex;
    });
    if (isCurrentRowEditing || inquireActionConfirm) {
      actionbuttons = (
        <>
          <Row justify="center">
            {/* <button data-action="update"> */}
            <IconCheck
              type="button"
              height={20}
              width={20}
              color={"#000"}
              strokeWidth={1}
              data-action={
                confirmActionType === "confirm-edit"
                  ? "confirm-edit"
                  : "confirm-delete"
              }
            />
            {/* </button> */}
            <IconX
              type="button"
              height={20}
              width={20}
              color={"#000"}
              strokeWidth={1}
              data-action={"cancel"}
              onClick={
                confirmActionType === "confirm-edit"
                  ? () => {
                      setInquireActionConfirm(false);
                      setConfirmActionType("");
                    }
                  : () => {
                      setInquireActionConfirm(false);
                      setConfirmActionType("");
                    }
              }
            />
          </Row>
        </>
      );
    } else {
      actionbuttons = (
        <>
          <Row justify="center">
            {/* <button> */}
            <IconPencil
              type="button"
              height={20}
              width={20}
              color={"#000"}
              strokeWidth={1}
              data-action={"edit"}
              onClick={() => {
                setInquireActionConfirm(true);
                setConfirmActionType("confirm-edit");
              }}
            />
            {/* </button> */}

            {/* <button data-action="delete"> */}
            <IconTrash
              height={20}
              width={20}
              color={"#000"}
              strokeWidth={1}
              data-action={"delete"}
              onClick={() => {
                setInquireActionConfirm(true);
                setConfirmActionType("confirm-delete");
              }}
            />
            {/* </button> */}
          </Row>
        </>
      );
    }
    return actionbuttons;
  };
  //

  //Row editing start stop functions
  function onRowEditingStarted(params) {
    params.api.refreshCells({
      columns: ["action"],
      rowNodes: [params.node],
      force: true,
    });
  }

  function onRowEditingStopped(params) {
    params.api.refreshCells({
      columns: ["action"],
      rowNodes: [params.node],
      force: true,
    });
  }
  //

  //CellClicked function
  async function onCellClicked(params) {
    // Handle click event for action cells
    if (
      params.column.colId === "action" &&
      params.event.target.dataset.action
    ) {
      let action = params.event.target.dataset.action;

      if (action === "edit") {
        params.api.startEditingCell({
          rowIndex: params.node.rowIndex,
          // gets the first columnKey
          colKey: params.columnApi.getDisplayedCenterColumns()[0].colId,
        });
      }

      if (action === "confirm-delete") {
        const res = await deleteDealers(params.data?.user_id);
        if (res?.status === "success") {
          params.api.applyTransaction({
            remove: [params.node.data],
          });
          toast.success("User deleted successfully!");
        } else {
          toast.error("Something went wrong! User couldn't be deleted");
        }
      }
      if (action === "confirm-edit") {
        params.api.stopEditing();
        // updateDealerInfoCall();
        // modifyOrderCall(params.data);
      }

      if (action === "cancel") {
        params.api.stopEditing(true);
      }
    }
  }
  //

  const dealersColumnDefiniton = [
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      // editable: true,
      cellRenderer: (params) => {
        return (
          <>
            <div style={{ textAlign: "center" }}>
              {params?.data?.first_name + " " + params?.data?.last_name}
            </div>
          </>
        );
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Email",
      field: "email_id",
      sortable: true,
      cellStyle: {
        textAlign: "center",
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Address",
      field: "address",
      sortable: true,
      editable: true,
      cellStyle: {
        textAlign: "center",
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Last Login",
      field: "last_login",
      sortable: true,
      cellRenderer: (params) => {
        return (
          <>
            <div style={{ textAlign: "center" }}>
              {params?.data?.last_updated
                ? moment(params?.data?.last_updated).format("DD/MM/YYYY")
                : "-"}
            </div>
          </>
        );
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Date Joined",
      field: "date_joined",
      sortable: true,
      cellRenderer: (params) => {
        return (
          <>
            <div style={{ textAlign: "center" }}>
              {params?.data?.date_joined
                ? moment(params?.data?.date_joined).format("DD/MM/YYYY")
                : "-"}
            </div>
          </>
        );
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Phone",
      field: "phone",
      sortable: true,
      editable: true,
      cellStyle: {
        textAlign: "center",
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Last Updated",
      field: "last_updated",
      sortable: true,
      cellRenderer: (params) => {
        return (
          <>
            <div style={{ textAlign: "center" }}>
              {params?.data?.last_updated
                ? moment(params?.data?.last_updated).format("DD/MM/YYYY")
                : "-"}
            </div>
          </>
        );
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Allowed Accounts",
      field: "allowed_acounts",
      sortable: true,
      cellStyle: {
        textAlign: "center",
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "User ID",
      field: "user_id",
      sortable: true,
      cellStyle: {
        textAlign: "center",
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      cellStyle: {
        textAlign: "center",
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Is Verified",
      field: "is_verified",
      sortable: true,
      cellRenderer: (params) => {
        return (
          <>
            <div style={{ textAlign: "center" }}>
              {params?.data?.is_verified ? "Yes" : "No"}
            </div>
          </>
        );
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: true,
      pinned: "right",
      cellRenderer: actionsCellRenderer,
      colId: "action",
      width: 100,
      cellStyle: {
        textAlign: "center",
      },
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Status",
      // headerName: "Activity",
      field: "is_active",
      sortable: true,
      pinned: "right",
      cellRenderer: ActivityToggler,
      colId: "action",
      width: 120,
      cellStyle: {
        textAlign: "center",
      },
      // editor: "input", //to change input from the table
    },
  ];

  const onCellEditingStopped = (event) => {
    event.column.colId === "email_id"
      ? (newValue.email_id = event.newValue)
      : event.column.colId === "address"
      ? (newValue.address = event.newValue)
      : event.column.colId === "phone"
      ? (newValue.phone = event.newValue)
      : console.log("no key found to save edited values");
  };

  const onRowValueChanged = async (event) => {
    const updateDetailsPayload = {
      first_name: event?.data?.first_name,
      last_name: event?.data?.last_name,
      address: event?.data?.address,
      phone: event?.data?.phone,
      user_id: event?.data?.user_id,
      email_id: event?.data?.email_id,
    };
    const res = await updateDealer(updateDetailsPayload);
    if (res?.status === "success") {
      toast.success(res?.message);
      event.api.applyTransaction({
        update: [event.node.data],
      });
      updateDealerInfoCall();
    } else {
      updateDealerInfoCall();
      toast.error(`Something went wrong: ${res?.message}`);
    }
  };

  useEffect(() => {
    fetchDealersList();
  }, [flag]);

  return (
    <div style={{ width: "100%", height: "70vh" }}>
      <Modal
        preventClose
        open={openCreateUserModal}
        onClose={() => {
          setOpenCreateUserModal(false);
          refreshComponent();
        }}
        width="38rem"
        blur
      >
        {/* <Modal.Header>
            <h5>Create User</h5>
          </Modal.Header>
          <Modal.Body>
          </Modal.Body> */}
        <SignUp
          title={"Create New Dealer"}
          formType={"create-user"}
          show={openCreateUserModal}
          setShow={setOpenCreateUserModal}
          close={() => setOpenCreateUserModal(false)}
        />
      </Modal>
      <Card css={{ width: "100%", height: "100%" }}>
        <Card.Header
          css={{
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Text h4>Dealers List</Text>
          <Button
            className="primary-button border-radius-8"
            flat
            auto
            onClick={() => setOpenCreateUserModal(true)}
          >
            Create Dealer
          </Button>
        </Card.Header>
        <Card.Body style={{ width: "100%" }}>
          <div
            className="ag-theme-balham"
            style={{
              width: "100%",
              height: "100%",
              overflowY: "scroll",
            }}
          >
            <AgGridReact
              style={{ width: "100%", height: "100%" }}
              rowData={dealers}
              columnDefs={dealersColumnDefiniton}
              onRowEditingStopped={onRowEditingStopped}
              onRowEditingStarted={onRowEditingStarted}
              onCellClicked={onCellClicked}
              editType="fullRow"
              suppressClickEdit={true}
              // readOnlyEdit={true}
              onRowValueChanged={onRowValueChanged}
              onCellEditingStopped={onCellEditingStopped}
              //   domLayout="autoHeight"
              /* onGridReady={(params) => {
            setGridApi(params.api);
            setGridColumnApi(params.columnApi);
          }} */
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default memo(DealersListingPage);
