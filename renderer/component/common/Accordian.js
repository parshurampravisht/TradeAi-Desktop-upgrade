// Accordion.js
import { useState } from "react";

export const Accordion = ({ children }) => {
    return <div className="accordion-container">{children}</div>;
};

export const AccordionItem = ({ title, children, defaultOpen = false, customStyles = {} }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="accordion-item">
            <button
                className="accordion-header"
                onClick={() => setOpen(!open)}
                style={{ ...customStyles }}
            >
                <span className="text-underline">{title}</span>
                <span className="accordion-icon">{open ? "-" : "+"}</span>
            </button>

            {open && <div className="accordion-content">{children}</div>}
        </div >
    );
};
