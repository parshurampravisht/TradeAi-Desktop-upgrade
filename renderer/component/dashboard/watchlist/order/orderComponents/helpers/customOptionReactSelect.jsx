import { size } from "lodash";
import { components } from "react-select";

const CustomOption = ({ children, ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = { ...props, innerProps: rest };
  return (
    <components.Option {...newProps} className="custom-option">
      <span b>{children}</span>
      <span style={{ color: "green", fontSize: "10px" }}>
        &nbsp;{" "}
        {props.data.Exch == "N" || props.data.Exch == "NSE"
          ? "NSE"
          : props.data.Exch == "B" || props.data.Exch == "BSE"
          ? "BSE"
          : props.data.Exch == "M" || props.data.Exch == "MCX"
          ? "MCX"
          : ""}
      </span>
    </components.Option>
  );
};

export default CustomOption;

export const CustomMultiValue = (props) => {
  return (
    <components.MultiValue {...props}>
      <span>
        {`${props.data.label} (${
          props.data.Exch === "NSE"
            ? "NSE"
            : props.data.Exch === "BSE"
            ? "BSE"
            : props.data.Exch === "MCX"
            ? "MCX"
            : ""
        })`}
      </span>
    </components.MultiValue>
  );
};
