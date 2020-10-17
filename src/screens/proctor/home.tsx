/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Button } from "@material/react-button";
import MaterialIcon from "@material/react-material-icon";
import TextField, { Input } from "@material/react-text-field";
import { Body1 } from "@material/react-typography";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Alert, { useAlert } from "../../components/alert";
import client from "../../network/client";
import useAsync from "../../utils/use-async";
import NavbarPageTemplate from "../templates/navbar-page";

function ProctorHome() {
  const [examCode, setExamCode] = useState("");
  const { run, isLoading, isSuccess, isError, error, data } = useAsync();
  const { showAlert, alertState, closeAlert } = useAlert();

  const handleStartExamSessionClick = useCallback(() => {
    run(client('exam-session'));
  }, [run]);

  useEffect(() => {
    if (isError) {
      showAlert({
        message: error.message,
        actionText: 'Retry',
        action: () => {
          closeAlert();
          handleStartExamSessionClick();
        },
      });
    }
  }, [isError, error, showAlert, closeAlert, handleStartExamSessionClick]);

  return (
    <NavbarPageTemplate loading={isLoading}>
      <div
        css={{
          height: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!isSuccess ? (
          <div
            css={{
              display: "flex",
              "& > *": {
                marginRight: "20px",
              },
            }}
          >
            <Button
              css={{ height: "56px" }}
              raised
              icon={<MaterialIcon icon="add" />}
              onClick={handleStartExamSessionClick}
            >
              Start Exam Session
            </Button>

            <div
              css={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <TextField
                outlined
                label="Enter exam code"
                leadingIcon={<MaterialIcon icon="keyboard" />}
              >
                <Input
                  value={examCode}
                  onChange={(e: FormEvent<HTMLInputElement>) => {
                    setExamCode(e.currentTarget.value);
                  }}
                ></Input>
              </TextField>

              <Button disabled={examCode === ""}>Join</Button>
            </div>
          </div>
        ) : (
          <div css={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div css={{
              display: 'flex',
              alignItems: 'baseline'
            }}>
              <Body1 css={{marginRight: '15px'}}>Exam session code:</Body1>
              <Body1 css={{fontSize: '30px'}}>{data.code}</Body1>
            </div>
            <Button raised>Join session</Button>
          </div>
        )}
      </div>

      <Alert {...alertState} />
    </NavbarPageTemplate>
  );
}

export default ProctorHome;
