import React from "react";

function Alert(props) {
  return (
    <>
      {props.alert && (
        <div
          className={`alert alert-${props.alert.type} alert-dismissible fade show`}
          role="alert"
        >
          <strong>
            {" "}
            {props.alert.type === "danger" ? "Error" : props.alert.type}:{" "}
            {props.alert.message}
          </strong>
        </div>
      )}
    </>
  );
}

export default Alert;
