import { Button, Modal, Text } from "@nextui-org/react";

export default function CommonConfirmationModal({
    isOpen,            // boolean: modal open state
    handleClose,           // function: called on cancel/close
    handleConfirm,         // function: called on confirm action
    title = "Order Confirmation", // string: modal title
    message = "Are you sure?", // string: modal message
    confirmText = "Submit",    // string: confirm button text
    cancelText = "Cancel",     // string: cancel button text
    confirmProps = {},          // optional props for confirm button
    cancelProps = {}            // optional props for cancel button
}) {

    return (
        <Modal open={isOpen} onClose={() => handleClose()} blur style={{ padding: "5px" }}>
            <Modal.Header>{title}</Modal.Header>
            <Modal.Body>
                <Text>{message}</Text>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    auto
                    flat
                    className="secondary-button border-radius-8"
                    onPress={() => handleClose()}
                    {...cancelProps}
                >
                    {cancelText}
                </Button>
                <Button
                    auto
                    flat
                    className="primary-button border-radius-8"
                    onPress={() => handleConfirm()}
                    {...confirmProps}
                >
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
