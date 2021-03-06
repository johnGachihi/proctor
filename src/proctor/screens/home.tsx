/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Button } from "@material/react-button";
import MaterialIcon from "@material/react-material-icon";
import TextField, { Input } from "@material/react-text-field";
import { Body1 } from "@material/react-typography";
import { FormEvent, PropsWithChildren, useCallback, useEffect, useState } from "react";
import Alert, { useAlert } from "../../components/alert";
import client from "../../network/client";
import useAsync from "../../utils/use-async";
import NavbarPageTemplate from "../../screens/templates/navbar-page";
import { useHistory } from "react-router-dom";
import { ErrorMessage } from "../../components/lib";

type Props = PropsWithChildren<{
  requestWebcamStream: () => void
}>

function ProctorHome({ requestWebcamStream }: Props) {
  const [examCode, setExamCode] = useState("");
  const [examCodeErrors, setExamCodeErrors] = useState<string[]>([])
  const { run, isLoading, isSuccess, isError, error, data } = useAsync();
  const { showAlert, alertState, closeAlert } = useAlert();
  const history = useHistory();

  const handleStartExamSessionClick = useCallback(() => {
    run(client.post('exam-session'));
  }, [run]);

  async function handleClickJoin() {
    try {
      await run(client("check_code", { params: { code: examCode } }));
      await requestWebcamStream()
      history.push(`exam/${examCode}`);
    } catch (error) {
      setExamCodeErrors(error.fields?.code ?? [])

      if (error.name === "NotFoundError") {
        console.log('Please turn on your webcam')
      } else if (error.name === "NotAllowedError") {
        console.log('Please grant webcam permissions on your browser')
      }
    }
  }

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

              {examCodeErrors.map((error, key) => 
                (<ErrorMessage key={key} children={error} css={{alignSelf: 'start'}}/>))}

              <Button
                disabled={examCode === ""}
                onClick={handleClickJoin}
              >Join</Button>
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
            <Button raised onClick={() => {
              history.push(`/exam/${data.code}`)
            }}>
              Join session
            </Button>
          </div>
        )}
      </div>

      <Alert {...alertState} />
    </NavbarPageTemplate>
  );
}

export default ProctorHome;
