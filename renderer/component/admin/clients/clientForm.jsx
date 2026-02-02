import { Card, Grid, Input, Row } from "@nextui-org/react";
import FullPageLoader from "../../common/FullPageLoader";
import { Accordion, AccordionItem } from "../../common/Accordian";

export default function ClientForm(props) {
  const { handleInputChange, loading, fields, formState, error } = props; //

  return (
    <div style={{ width: "calc(100% - 200px)" }}>
      <FullPageLoader show={loading} />
      <Card.Body
        css={{ padding: "$1", paddingLeft: "$10", paddingRight: "$5" }}
      >
        <Grid
          css={{
            height: "67vh",
            maxHeight: "72vh",
            display: "flex",
            flexDirection: "column",
            ...(window.innerWidth >= 1920 && {
              height: "75vh",
              maxHeight: "75vh",
            }),
          }}
        >
          {fields.slice(0, -4).map((elem, index) => {
            const { isMandatory = true } = elem;
            return (
              <Row
                key={index}
                css={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "13px",
                  columnGap: "20px",
                }}
              >
                <label
                  style={{
                    fontWeight: "500",
                    marginBottom: "5px",
                    width: "200px", // Set a fixed width for the label
                    whiteSpace: "nowrap", // Prevent label from breaking into multiple lines
                    overflow: "hidden", // Hide overflow text
                    textOverflow: "ellipsis", // Add ellipsis if text overflows
                    marginLeft: "5px",
                  }}
                >
                  {elem.label}
                  {isMandatory && (
                    <span style={{ color: "red", marginLeft: "2px" }}>*</span>
                  )}
                </label>

                {elem?.field === "password" ? (
                  <>
                    <Input.Password
                      className="border-radius-8"
                      bordered
                      fullWidth
                      value={formState[elem.field] || ""}
                      borderWeight="light"
                      name="password"
                      placeholder={elem.placeHolder}
                      onChange={(e) => handleInputChange(elem.field, e)}
                      style={{
                        borderRadius: "8px",
                        paddingLeft: "10px",
                        flexGrow: 1,
                        margin: "0px",
                        width: "100%",
                      }}
                    ></Input.Password>
                  </>
                ) : (
                  <Input
                    // initialValue={formState[field.label] || ''}
                    value={formState[elem.field] || ""}
                    fullWidth
                    type={elem.value}
                    placeholder={elem.placeHolder}
                    onChange={(e) => handleInputChange(elem.field, e)}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      paddingLeft: "10px",
                      flexGrow: 1,
                      margin: "0px",
                    }}
                  />
                )}
              </Row>
            );
          })}

          <Accordion>
            <AccordionItem
              title="Additional Information"
              defaultOpen={false}
              customStyles={{
                background: "inherit",
              }}
            >
              {fields.slice(-4).map((elem, index) => {
                const { isMandatory = false } = elem;
                return (
                  <Row
                    key={index}
                    css={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "13px",
                      columnGap: "20px",
                    }}
                  >
                    <label
                      style={{
                        fontWeight: "500",
                        marginBottom: "5px",
                        width: "200px", // Set a fixed width for the label
                        whiteSpace: "nowrap", // Prevent label from breaking into multiple lines
                        overflow: "hidden", // Hide overflow text
                        textOverflow: "ellipsis", // Add ellipsis if text overflows
                        marginLeft: "5px",
                      }}
                    >
                      {elem.label}
                      {isMandatory && (
                        <span style={{ color: "red", marginLeft: "2px" }}>
                          *
                        </span>
                      )}
                    </label>

                    {elem?.field === "password" ? (
                      <>
                        <Input.Password
                          className="border-radius-8"
                          bordered
                          fullWidth
                          value={formState[elem.field] || ""}
                          borderWeight="light"
                          name="password"
                          placeholder={elem.placeHolder}
                          onChange={(e) => handleInputChange(elem.field, e)}
                          style={{
                            borderRadius: "8px",
                            paddingLeft: "10px",
                            flexGrow: 1,
                            margin: "0px",
                            width: "100%",
                          }}
                        ></Input.Password>
                      </>
                    ) : (
                      <Input
                        // initialValue={formState[field.label] || ''}
                        value={formState[elem.field] || ""}
                        fullWidth
                        type={elem.value}
                        placeholder={elem.placeHolder}
                        onChange={(e) => handleInputChange(elem.field, e)}
                        style={{
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          paddingLeft: "10px",
                          flexGrow: 1,
                          margin: "0px",
                        }}
                      />
                    )}
                  </Row>
                );
              })}
            </AccordionItem>
          </Accordion>

          {error && (
            <p
              style={{
                color: "red",
                fontSize: "13px",
                letterSpacing: "0.4px",
                textAlign: "right",
              }}
            >
              {error}
            </p>
          )}
        </Grid>
      </Card.Body>
    </div>
  );
}
